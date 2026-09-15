# Deploying AlgoPath to AWS

Target: **RDS PostgreSQL** for data, a single **EC2** instance running the app
and nginx via Docker Compose. Roughly a weekend, most of it waiting for AWS.

Region: **ap-south-1 (Mumbai)** — Neon in Singapore was costing ~4x the round
trip from India, which is most of the latency in the current app.

> ### Cost
>
> AWS changed the free tier in mid-2025. Which one you are on depends on when
> your account was created, and it changes what this costs:
>
> - **Account created after ~July 2025** — you get **up to $200 in credits
>   ($100 on signup, $100 more for using services), valid 6 months or until
>   spent**, whichever comes first. There is no per-service free allowance;
>   EC2 and RDS both draw down the credits. This stack runs roughly
>   $25–35/month, so $200 covers about the full 6 months. After that you either
>   stop the instances or start paying.
> - **Older account still inside its 12 months** — the classic tier gives 750
>   h/month of `t3.micro` EC2 and 750 h/month of `db.t4g.micro` RDS. Note
>   `t4g.small` is **not** in it; its free trial ended in 2024.
>
> Check which you are on at Billing → Free tier in the console before you
> provision anything.
>
> **A CloudWatch billing alarm is free** (10 alarms, always). Set one at $10
> first — it is the only thing between a misconfigured instance and a surprise
> bill, and it costs nothing.

---

## 1. Network (do this first)

Everything else attaches to it.

1. Use the **default VPC** in ap-south-1. Building your own is not worth it here.
2. Create two security groups:

   **`algopath-web`** (for EC2)
   | Type | Port | Source |
   |---|---|---|
   | SSH | 22 | **Your IP only** — never `0.0.0.0/0` |
   | HTTP | 80 | `0.0.0.0/0` |
   | HTTPS | 443 | `0.0.0.0/0` |

   **`algopath-db`** (for RDS)
   | Type | Port | Source |
   |---|---|---|
   | PostgreSQL | 5432 | **`algopath-web` security group** (not an IP range) |

   Referencing the web SG as the DB source is the important part: the database
   becomes reachable only from the app instance, never from the internet.

---

## 2. RDS

- Engine **PostgreSQL 16**, template **Free tier**
- Instance `db.t4g.micro`, 20 GB gp3, storage autoscaling off
- DB instance identifier `algopath-db`, master username `algopath`
- **Public access: No**
- VPC security group: `algopath-db`
- Initial database name: `algopath`
- Backups: 7 days retention

Note the endpoint once it is available. Your connection string:

```
postgresql://algopath:PASSWORD@algopath-db.xxxx.ap-south-1.rds.amazonaws.com:5432/algopath?sslmode=require
```

`sslmode=require` is not optional — RDS accepts unencrypted connections and you
do not want one.

---

## 3. EC2

- **Ubuntu 24.04 LTS**, `t4g.small` (ARM, 2 GB). The image builds fine on ARM.

  On the classic 12-month tier `t4g.small` is not free — but the 1 GB
  alternatives (`t3.micro`, `t4g.micro`) will **OOM during `next build`**
  inside Docker. If you must use one, add swap before building:

  ```bash
  sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
  sudo mkswap /swapfile && sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  ```

  Swap makes the build succeed but slow. Building the image in CI and pulling
  it is the better long-term answer.
- Security group `algopath-web`
- 20 GB gp3 root volume
- Create a new key pair, download the `.pem`, keep it safe
- Allocate an **Elastic IP** and associate it, or the address changes on reboot

Then, on the instance:

```bash
sudo apt update && sudo apt upgrade -y

# Docker Engine + Compose plugin
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker $USER   # log out and back in for this to apply
```

---

## 4. Migrate the data from Neon

Run locally, where you can reach both.

```bash
# 1. Dump Neon (data only — Prisma owns the schema)
pg_dump "$NEON_URL" --data-only --no-owner --no-privileges -Fc -f algopath.dump

# 2. Create the schema on RDS from the Prisma schema
DATABASE_URL="$RDS_URL" npx prisma migrate deploy
#    (no migration history yet? use: DATABASE_URL="$RDS_URL" npx prisma db push)

# 3. Restore the data
pg_restore -d "$RDS_URL" --data-only --disable-triggers algopath.dump

# 4. Verify — these two numbers must match Neon
psql "$RDS_URL" -c "SELECT count(*) FROM \"Problem\";"
psql "$RDS_URL" -c "SELECT count(*) FROM \"Plan\" WHERE \"deletedAt\" IS NULL;"
```

`--disable-triggers` matters: without it the foreign keys fail as rows load in
an order the constraints reject.

**Keep Neon alive until RDS has served real traffic for a few days.**

---

## 5. Ship it

```bash
git clone https://github.com/<you>/AlgoPath.git
cd AlgoPath
cp .env.production.example .env   # the name must be .env — see below
nano .env                         # RDS URL, Clerk *live* keys, site URL

docker compose up -d --build
docker compose ps             # app should reach "healthy", not just "running"
curl -f localhost/api/health  # {"status":"ok","database":"reachable","clerk":"live",...}
```

**Why `.env` and not `.env.production`:** Compose interpolates the `${...}`
build args in `docker-compose.yml` from a file literally named `.env`. The
`env_file:` key is a different mechanism — it only populates the *running*
container. Keep the secrets in `.env.production` and the build args resolve to
empty strings, so the image is built with an empty Clerk publishable key and
every page 500s with no obvious cause.

If `app` never turns healthy, `docker compose logs app` first — it is almost
always the database URL or a missing Clerk key. nginx starts regardless (it
waits for `service_started`, not `service_healthy`), so you will get a readable
error page rather than a refused connection.

`curl` reporting `"clerk":"test"` means the image was built against the dev
Clerk instance — rebuild once `.env` has the live key.

---

## 6. TLS (needs a domain — skip this and section 7's Clerk step if you have none)

Everything above works without a domain: the app is reachable at
`http://<elastic-ip>` and you have a real deployment to show and to talk about.
What you cannot do without one is HTTPS (Let's Encrypt will not issue a
certificate for a bare IP) or Clerk production (it verifies CNAMEs you own).
Neither of those makes the AWS work wasted — they are a clean second phase,
and a `.xyz` or `.site` domain costs a few hundred rupees for the first year
when you are ready.



Point your domain's A record at the Elastic IP, wait for DNS, then:

```bash
sudo apt install -y certbot
sudo certbot certonly --webroot -w ./nginx/certbot/www -d your-domain.com
```

In `nginx/default.conf`: uncomment the `443` server block, set `YOUR_DOMAIN`,
and swap the HTTP `location /` for the redirect line noted in the comment.
Then `docker compose restart nginx`.

---

## 7. Post-deploy

- **Clerk**: start this *before* the deploy, not after — the DNS records take
  time to propagate and nobody can sign in until they do. Full steps in
  [CLERK-PRODUCTION.md](./CLERK-PRODUCTION.md).
- **Billing alarm**: CloudWatch, $10 threshold. Do this now, not later.
- **Updates**: `git pull && docker compose up -d --build`
- **Rollback**: `git checkout <last-good-sha> && docker compose up -d --build`

---

## Known loose end: Inngest

`src/app/api/inngest/route.ts` registers two background functions —
`sync-leetcode-problems` and `generate-ai-notes` — but **nothing in `src/`
ever calls `inngest.send()`**, so neither has ever run. The AI-notes one also
calls OpenAI with an `OPENAI_API_KEY` that no env example documented until now.

Nothing breaks by deploying as-is; the route just serves a function list to a
service that never sends it an event. But it is dead weight in the dependency
list, and a reviewer reading the repo will find it. Two honest ways out:

- **Remove it** — drop `inngest` from `package.json`, delete
  `src/lib/inngest.ts`, `src/app/api/inngest/route.ts`, the middleware public
  route, and the three env vars. Smallest surface, one less thing to explain.
- **Wire it up** — emit `sync/problems.requested` on a schedule and
  `notes/generate.requested` from a button in the roadmap UI. More work, but
  then the background-jobs story on your resume is a real one.

---

## What CI does today

`.github/workflows/ci.yml` runs typecheck, lint, `next build` and a Docker
image build on every push and PR to `main`. It does **not** deploy.

Adding deployment once the instance exists means: push the image to ECR, then
have the workflow SSH in and `docker compose pull && up -d`. That needs these
repository secrets:

| Secret | Purpose |
|---|---|
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | An IAM user scoped to ECR push only |
| `EC2_HOST` | The Elastic IP |
| `EC2_SSH_KEY` | The private key contents |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Inlined at build time |

Ask for the deploy workflow when you have those.
