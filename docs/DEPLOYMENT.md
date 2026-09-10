# Deploying AlgoPath to AWS

Target: **RDS PostgreSQL** for data, a single **EC2** instance running the app
and nginx via Docker Compose. Roughly a weekend, most of it waiting for AWS.

Region: **ap-south-1 (Mumbai)** — Neon in Singapore was costing ~4x the round
trip from India, which is most of the latency in the current app.

> Cost note: `db.t4g.micro` and `t4g.small` are free-tier eligible for 12 months
> on a new account. Outside that, expect roughly $25–35/month for both.
> **Set a billing alarm before you provision anything.**

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

- **Ubuntu 24.04 LTS**, `t4g.small` (ARM). The image builds fine on ARM.
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
cp .env.production.example .env.production
nano .env.production          # RDS URL, Clerk *live* keys, Upstash, Inngest

docker compose up -d --build
docker compose ps             # app should reach "healthy", not just "running"
curl -f localhost/api/health  # {"status":"ok","database":"reachable",...}
```

If `app` never turns healthy, `docker compose logs app` first — it is almost
always the database URL or a missing Clerk key.

---

## 6. TLS

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

- **Clerk**: add the production domain, switch to live keys, and repoint the
  webhook at `https://your-domain.com/api/webhooks/clerk`.
- **Billing alarm**: CloudWatch, $10 threshold. Do this now, not later.
- **Updates**: `git pull && docker compose up -d --build`
- **Rollback**: `git checkout <last-good-sha> && docker compose up -d --build`

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
