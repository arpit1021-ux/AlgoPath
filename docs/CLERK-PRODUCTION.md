# Switching Clerk to production

A Clerk **development** instance and a **production** instance are separate
worlds. They have different keys, different sessions, and — the part that
catches people — **separate user tables**. Nobody who signed up on the dev
instance exists on the production one. Plan for that rather than discovering it
after launch.

Do the DNS half of this **before** the AWS deploy: the CNAME records take
anywhere from minutes to a few hours to propagate, and the app cannot sign
anyone in until they resolve.

---

## 1. Create the production instance

In the Clerk dashboard, top-left instance switcher → **Production**.

Clerk asks for a domain. Use the exact apex or subdomain the app will serve
from, e.g. `algopath.dev` or `app.algopath.dev`. This cannot be changed later
without recreating the instance, so decide the URL first.

Enable the same sign-in methods you have on dev (email, Google, GitHub, or
whatever you use). Production does **not** inherit them.

---

## 2. Add the DNS records

Clerk gives you a set of CNAMEs — roughly:

| Host | Points at |
|---|---|
| `clerk` | `frontend-api.clerk.services` |
| `accounts` | `accounts.clerk.services` |
| `clkmail` | a mail host |
| `clk._domainkey`, `clk2._domainkey` | DKIM records |

Add them at your registrar exactly as shown. Two things go wrong here:

- **Cloudflare proxying.** If your DNS is on Cloudflare, set every Clerk record
  to **DNS only** (grey cloud). Proxied records break Clerk's certificate
  issuance.
- **The `clerk.` prefix.** Some registrars append the domain automatically. If
  you type `clerk.algopath.dev` into a field that already appends the zone, you
  get `clerk.algopath.dev.algopath.dev`. Check the resulting FQDN.

Wait until the dashboard shows every record verified. Then:

```bash
dig +short clerk.your-domain.com CNAME
```

should return Clerk's host.

---

## 3. OAuth credentials (only if you use social sign-in)

Dev instances use Clerk's shared OAuth apps. **Production requires your own.**
This is the single most common reason a production sign-in page appears to work
and then fails on the redirect.

For each provider, create an OAuth app and set the callback URL to the one
Clerk shows on that provider's settings page — typically
`https://clerk.your-domain.com/v1/oauth_callback`.

- **Google:** Google Cloud Console → APIs & Services → Credentials → OAuth
  client ID (Web application). Publish the consent screen, or only test users
  can sign in.
- **GitHub:** Settings → Developer settings → OAuth Apps.

Paste the client ID and secret into Clerk's provider settings.

---

## 4. Keys and environment

From **API Keys** on the production instance, copy the live pair into
`.env.production` on the EC2 host:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
```

`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is **inlined at build time**, not read at
runtime. Changing it in `.env.production` and restarting the container does
nothing — the image has to be rebuilt with it:

```bash
docker compose up -d --build
```

The same applies to the CI Docker job: its `build-args` currently pass a
placeholder, which is correct for a build that only proves the image compiles.
The deploy workflow must pass the real live key.

---

## 5. Webhook

Clerk populates your `User` table through `/api/webhooks/clerk`, so this is not
optional — without it, a user signs in successfully and the app has no row for
them.

1. Production instance → **Webhooks** → Add Endpoint
2. URL: `https://your-domain.com/api/webhooks/clerk`
3. Events: `user.created`, `user.updated`, `user.deleted`
4. Copy the **signing secret** (`whsec_...`) into `CLERK_WEBHOOK_SECRET`

The dev instance has its own signing secret. Reusing it makes every production
webhook fail signature verification with a 400, silently.

Test it from the dashboard's **Send test event**, then confirm the row landed:

```bash
psql "$RDS_URL" -c 'SELECT count(*) FROM "User";'
```

---

## 6. Redirect URLs

Under **Paths**, make sure the production instance allows your domain. The app
already sets `signInUrl`, `signUpUrl` and the fallback redirects on
`<ClerkProvider>` in `src/app/layout.tsx`, so the paths themselves are
`/login`, `/register` and `/dashboard` — but Clerk still has to accept the
origin they live on.

---

## 7. Verify the deploy actually picked up live keys

`/api/health` reports it:

```bash
curl -s https://your-domain.com/api/health
# {"status":"ok","database":"reachable","clerk":"live",...}
```

`"clerk":"test"` means the image was built with the dev key — rebuild with the
right `--build-arg`. `"clerk":"unset"` means the key never reached the build
at all.

Then, by hand:

- Sign up with a **new** email. A `User` row should appear within a second or
  two (that is the webhook).
- Sign out, sign in again. You should land on `/dashboard` on the first click —
  if it takes two, `AuthShell`'s `router.refresh()` is not running.
- Click the avatar in the sidebar. The dropdown must open. (The old dev-badge
  CSS in `globals.css` hid `.cl-portalPopover`, which is that dropdown's own
  container; it has been removed, and this is the check that it is gone.)
- Confirm the development-mode badge is absent — it should be, on a production
  instance, with no CSS helping.

---

## Before you ship: the "Secured by Clerk" badge

`src/lib/clerk-appearance.ts` sets `footer: "hidden"`, which removes it.

**Removing Clerk branding is a paid-plan feature.** On the free plan, hiding it
is a terms violation, and the fact that CSS can do it is not permission. Check
your plan on the billing page before launch. If you are on the free plan,
delete that one line — it is a small piece of text in exchange for not building
your portfolio project on a terms breach, and any reviewer who notices the
badge will think nothing of it.

---

## Keep the dev instance

Do not delete it. It stays as the target for local development —
`.env.local` keeps the `pk_test_` / `sk_test_` pair, production keys live only
on the server, and the two never mix.
