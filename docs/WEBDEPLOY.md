# Deploying the VRS demo to the DreamHost VM

**Target:** `https://vrs-demo.alexanderthenotsobad.us`
**Host:** the existing DreamHost VM, behind Apache
**App:** Next.js 15 on `127.0.0.1:3100`, managed by systemd
**Branch:** `ai-dhs-v1`
**Last updated:** 2026-11-15

This is the simple, durable path: keep the compute you already pay for, put the
new frontend in its own directory, run it as a local Node service, and let Apache
terminate TLS and proxy to it.

> **No Google Cloud project is needed for this plan.** A GCP “project” is just a
> container for GCP resources; it does not give you a web server or DNS by itself.
> You already have the VM, the domain, and Apache. Use them. A GCP path is noted at
> the end only if you later decide to move compute.

---

## 0. Values used below

Replace these once if you choose different names:

```bash
DOMAIN=vrs-v2.alexanderthenotsobad.us
VM_IP=208.113.129.7
APP_DIR=/var/www/vrs-demo
APP_PORT=3100
BRANCH=ai-dhs-v1
SERVICE=vrs-demo
```

`208.113.129.7` appears in the current `next.config.ts`; verify it is still the VM's
public IPv4 before creating DNS. On the VM:

```bash
curl -4 -s https://ifconfig.me
```

> Do **not** deploy this under `/app` on an existing vhost. The app expects to own
> the root of its hostname. A dedicated subdomain avoids the `basePath`/asset-path
> class of bugs entirely.

---

## 1. Before touching the server

### 1.1 Commit and push the redesign

The redesign is currently uncommitted on `ai-dhs-v1`. A server clone cannot see
working-tree changes.

```bash
cd /home/alex/LLM-VRS-FE
git status
git add -A
git commit -m "Redesign VRS storefront and mock ordering flow"
git push origin ai-dhs-v1
```

### 1.2 Clean the conflict markers

`README.md` and `.gitignore` still contain unresolved Git conflict markers from an
earlier merge. They do not break the build today, but they are a deployment landmine
and they make `.gitignore` behave unpredictably.

```bash
grep -RIn '^<<<<<<<\|^=======$\|^>>>>>>>' README.md .gitignore
```

Resolve those files before the final commit. Keep the real ignore rules for
`node_modules`, `.next`, env files, and `*.tsbuildinfo`.

### 1.3 Update the domain-specific config

Two values currently point at the old hostname:

- `next.config.ts` → `experimental.serverActions.allowedOrigins`
- `src/app/layout.tsx` → `metadataBase`

Add the new hostname to `allowedOrigins`:

```ts
allowedOrigins: [
  "localhost",
  "127.0.0.1",
  "::1",
  "208.113.129.7",
  "vrs-demo.alexanderthenotsobad.us",
],
```

Change `metadataBase` to `https://vrs-demo.alexanderthenotsobad.us` (or drive it
from an environment variable). Otherwise Open Graph/canonical URLs still point at
`ai.alexanderthenotsobad.us`. This does not affect the page rendering, but it is
wrong for a new deployment.

### 1.4 Do not run the old Cloudflare script

`deploy-cloudflare.sh` overwrites `next.config` with `output: "export"` and deploys
to Cloudflare Pages. It is stale and will break this app. Ignore `wrangler.toml` for
this deployment. The `npm run export` script is also obsolete under Next 15.

### 1.5 Optional local sanity check

```bash
npm ci
npm run build
npm run lint
```

---

## 2. DNS: create the A record

In the DreamHost panel:

1. **Domains → Manage DNS** for `alexanderthenotsobad.us`.
2. Add an **A record**:
   - Host: `vrs-demo`
   - Value: `208.113.129.7` (your verified VM IPv4)
   - TTL: `300` while testing
3. Do not create a `www` record unless you actually want `www.vrs-demo...`. If you
   do, use a CNAME to `vrs-demo.alexanderthenotsobad.us`.

Verify from your laptop:

```bash
dig +short vrs-demo.alexanderthenotsobad.us A
dig +short vrs-demo.alexanderthenotsobad.us AAAA
```

- The A result must be the VM IP.
- If an old AAAA record exists and IPv6 is not configured on the VM, remove it;
  Certbot may try IPv6 first and fail.
- If the domain is behind Cloudflare, set the record to **DNS only** (grey cloud)
  until the certificate is issued. A proxied record can break the HTTP-01 challenge.
  After TLS works, you may re-enable the proxy with SSL mode **Full (strict)**.

---

## 3. Firewall and ports

Only these need to be public:

| Port | Purpose |
|---|---|
| 22 | SSH (restrict to your IP if possible) |
| 80 | HTTP / Certbot challenge / redirect |
| 443 | HTTPS |

Port `3100` must **not** be public. Bind Next to `127.0.0.1` and let Apache proxy.

On the VM:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Apache Full'
sudo ufw enable
sudo ufw status
```

Also check the DreamHost panel/firewall for the VM, if it has a separate network
firewall. A rule in one place but not the other produces a silent timeout.

---

## 4. Prepare the VM

SSH in:

```bash
ssh you@208.113.129.7
```

### 4.1 Install packages

```bash
sudo apt update
sudo apt install -y apache2 certbot python3-certbot-apache git curl ufw
```

### 4.2 Install Node 20

Use the system Node package, not an nvm-only install. systemd does not load your
shell's nvm environment, and “works in SSH, fails in systemd” is almost always this.

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
command -v node
command -v npm
```

The repo's `.node-version` says `20.0.0`; NodeSource's current 20.x is fine and
newer. Next 15 needs Node 18.18+.

### 4.3 Create a service user and directory

```bash
sudo adduser --system --group --home /var/www/vrs-demo vrs
sudo mkdir -p /var/www/vrs-demo
sudo chown -R vrs:vrs /var/www/vrs-demo
```

Do not run the Node process as `root`. Do not put the app in `/root`.

### 4.4 Check resources

This is a small static-ish Next app, but the build is the memory-heavy step:

```bash
free -h
df -h
```

If the VM has 1 GB RAM and no swap, add a small swap file before building:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 5. Get the code onto the VM

The repo is public unless you changed it. As the service user:

```bash
sudo -u vrs git clone --branch ai-dhs-v1 --depth 1 \
  https://github.com/AlexanderTheNotSoBad-git/nvrs-ts-v1.git \
  /var/www/vrs-demo
```

If `APP_DIR` already exists and is not empty, clone somewhere temporary and move
the contents, or use `git init` + `git remote add` + `git fetch`.

If the repo is private, create a read-only deploy key for the `vrs` user:

```bash
sudo -u vrs ssh-keygen -t ed25519 -N "" -f /var/www/vrs-demo/.ssh/id_ed25519
sudo -u vrs cat /var/www/vrs-demo/.ssh/id_ed25519.pub
```

Add that public key under **GitHub → repo → Settings → Deploy keys** (read-only),
then clone with the SSH URL:

```bash
sudo -u vrs git clone --branch ai-dhs-v1 --depth 1 \
  git@github.com:AlexanderTheNotSoBad-git/nvrs-ts-v1.git \
  /var/www/vrs-demo
```

---

## 6. Build on the server

```bash
cd /var/www/vrs-demo
sudo -u vrs npm ci
sudo -u vrs npm run build
```

Important:

- **Do not** set `NODE_ENV=production` before `npm ci`. That skips devDependencies,
  and the build needs Tailwind, TypeScript, and PostCSS.
- If you must build in a production-style environment, use
  `npm ci --include=dev`.
- Build first, then restart the service. Do not serve a half-written `.next`.

Quick check that the build exists:

```bash
ls -la .next
du -sh .next
```

### 6.1 Optional: standalone output

The repo sets `output: "standalone"` in `next.config.ts`. You do **not** need to use
it. `next start` works normally and is simpler. If you prefer standalone:

```bash
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
```

Then the service command becomes:

```bash
/usr/bin/node .next/standalone/server.js
```

For this document, the systemd unit below uses the simpler `next start` path.

---

## 7. Run Next under systemd

Create `/etc/systemd/system/vrs-demo.service`:

```bash
sudo tee /etc/systemd/system/vrs-demo.service >/dev/null <<'EOF'
[Unit]
Description=VRS demo (Next.js)
After=network.target

[Service]
Type=simple
User=vrs
Group=vrs
WorkingDirectory=/var/www/vrs-demo
Environment=NODE_ENV=production
Environment=PORT=3100
Environment=HOSTNAME=127.0.0.1
ExecStart=/usr/bin/npm run start -- -H 127.0.0.1 -p 3100
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
```

If `command -v npm` returned something other than `/usr/bin/npm`, use that absolute
path in `ExecStart`. This is the nvm/systemd gotcha.

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now vrs-demo
sudo systemctl status vrs-demo --no-pager
curl -I http://127.0.0.1:3100
```

You should get an HTTP response from Next before Apache is involved. If this fails,
stop and read:

```bash
sudo journalctl -u vrs-demo -n 80 --no-pager
```

---

## 8. Apache reverse proxy

Enable the modules:

```bash
sudo a2enmod proxy proxy_http headers rewrite ssl
```

Create `/etc/apache2/sites-available/vrs-demo.conf`:

```apache
<VirtualHost *:80>
    ServerName vrs-demo.alexanderthenotsobad.us
    # ServerAlias www.vrs-demo.alexanderthenotsobad.us  # only if DNS exists

    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass / http://127.0.0.1:3100/ retry=0
    ProxyPassReverse / http://127.0.0.1:3100/
    RequestHeader set X-Forwarded-Proto "http"
    ProxyTimeout 3600

    ErrorLog ${APACHE_LOG_DIR}/vrs-demo-error.log
    CustomLog ${APACHE_LOG_DIR}/vrs-demo-access.log combined
</VirtualHost>
```

Enable and test:

```bash
sudo a2ensite vrs-demo
sudo apache2ctl configtest
sudo systemctl reload apache2
sudo apache2ctl -S
```

`apache2ctl -S` should list the new `ServerName` and point at this vhost. If Apache's
default site is still catching it, the `ServerName`/DNS pair does not match or the
site is not enabled.

Test over plain HTTP first:

```bash
curl -I http://vrs-demo.alexanderthenotsobad.us
```

You should see a `200` (or a redirect once Certbot runs).

> `ProxyTimeout 3600` is not needed by this static demo, but it is the right default
> if this app later gets the SSE session stream. Without it, long-lived connections
> can be cut by the proxy.

---

## 9. HTTPS with Certbot

Certbot's Apache plugin will obtain the certificate, add the TLS vhost, and offer a
redirect. Make sure DNS already resolves and port 80 is open.

```bash
sudo certbot --apache \
  -d vrs-demo.alexanderthenotsobad.us \
  --redirect
```

Then verify the generated SSL vhost actually contains the proxy directives. Certbot
usually copies the HTTP vhost, but confirm:

```bash
sudo grep -nE 'ServerName|SSLEngine|ProxyPass|ProxyPassReverse|X-Forwarded-Proto' \
  /etc/apache2/sites-available/vrs-demo-le-ssl.conf
```

If `ProxyPass` is missing from the `:443` vhost, add the same proxy block there and
set:

```apache
RequestHeader set X-Forwarded-Proto "https"
```

Reload:

```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
```

Check renewal:

```bash
sudo certbot renew --dry-run
sudo systemctl list-timers | grep -i certbot
```

Only after HTTPS is confirmed, add HSTS to the `:443` vhost:

```apache
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
```

Do not add `preload` until you are certain every subdomain is HTTPS-only.

---

## 10. Verify the live site

```bash
curl -I http://vrs-demo.alexanderthenotsobad.us
curl -I https://vrs-demo.alexanderthenotsobad.us
curl -s https://vrs-demo.alexanderthenotsobad.us | grep -o 'Dinner' | head
```

Then in a browser:

1. Load `https://vrs-demo.alexanderthenotsobad.us`.
2. Check the hero image and all menu images.
3. Add an item, open the tray, change quantity, run the mock checkout.
4. Open the account panel and choose each demo sign-in option.
5. Test at 390 px and 1440 px; check the mobile tab bar.
6. Open DevTools → Console; there should be no errors.
7. Confirm the certificate is valid and `http://` redirects to `https://`.

Logs:

```bash
sudo journalctl -u vrs-demo -n 100 --no-pager
sudo tail -n 100 /var/log/apache2/vrs-demo-error.log
```

---

## 11. Optional: protect the training site

If this is a private training/demo environment, add HTTP Basic Auth. Install:

```bash
sudo apt install -y apache2-utils
sudo htpasswd -c /etc/apache2/.htpasswd vrs
```

Add this inside the **SSL** vhost (and the HTTP vhost if you want it there too):

```apache
<Location />
    AuthType Basic
    AuthName "VRS preview"
    AuthUserFile /etc/apache2/.htpasswd
    Require valid-user
</Location>

# Never protect the ACME challenge path, or renewals will fail.
<Location "/.well-known/acme-challenge">
    Require all granted
</Location>
```

Reload and test. If you protect the HTTP vhost, keep the ACME exclusion or use DNS
challenges for renewal.

Optional no-index header while this is a demo:

```apache
Header always set X-Robots-Tag "noindex, nofollow"
```

Remove it when the site is meant to be public.

---

## 12. Deploying updates

```bash
cd /var/www/vrs-demo
sudo -u vrs git fetch origin ai-dhs-v1
sudo -u vrs git checkout ai-dhs-v1
sudo -u vrs git pull --ff-only origin ai-dhs-v1
sudo -u vrs npm ci
sudo -u vrs npm run build
sudo systemctl restart vrs-demo
sudo systemctl status vrs-demo --no-pager
```

If a build is risky, snapshot the old build first:

```bash
sudo -u vrs cp -a .next .next.previous
```

If the new build is bad, restore `.next.previous` and restart.

### Rollback a commit

```bash
cd /var/www/vrs-demo
sudo -u vrs git log --oneline -5
sudo -u vrs git checkout <good-sha>
sudo -u vrs npm ci
sudo -u vrs npm run build
sudo systemctl restart vrs-demo
```

For a more serious setup, use release directories and a `current` symlink; the
single-directory approach above is fine for a training demo.

---

## 13. Common failures

| Symptom | Likely cause | Check |
|---|---|---|
| `502 Bad Gateway` | Next not running or wrong port | `systemctl status vrs-demo`, `journalctl`, `curl 127.0.0.1:3100` |
| Apache shows default page | vhost not enabled / ServerName mismatch | `apache2ctl -S`, `a2ensite` |
| Certbot challenge fails | DNS not propagated, port 80 blocked, Cloudflare proxy on, stale AAAA | `dig`, `ufw`, Cloudflare DNS-only |
| HTTPS works but API/assets 404 | SSL vhost missing `ProxyPass` | grep the `-le-ssl.conf` |
| Build fails after `npm ci` | devDependencies skipped by `NODE_ENV=production` | `npm ci --include=dev` |
| Service restarts forever | wrong `npm` path under systemd | use absolute path from `command -v npm` |
| `EADDRINUSE` | port 3100 already used | `sudo ss -ltnp \| grep 3100`, choose another |
| Blank page / old assets | stale `.next` or browser cache | rebuild, hard refresh, check `.next` timestamp |
| Basic auth blocks renewal | ACME path protected | add the `/.well-known/acme-challenge` exception |
| Server actions rejected | host missing from `allowedOrigins` | add the new domain to `next.config.ts` |
| Social preview points at old host | `metadataBase` still old | update `layout.tsx` |
| Build OOM | small VM, no swap | add swap, build again |

---

## 14. Things that are easy to miss

- **A GCP project is not required.** Your DreamHost VM already does compute; adding
  GCP would create a second bill and a second network for no benefit today.
- **This needs a subdomain, not `/app`.** Root-relative Next assets and links assume
  the app owns `/`. A dedicated host avoids a whole class of 404s.
- **Commit and push first.** The redesign is currently sitting in the working tree.
- **Clean the conflict markers** in `README.md` and `.gitignore`.
- **Don't run `deploy-cloudflare.sh`.** It switches the app to static export.
- **Don't use `npm run dev` in production.** It is a development server, not a
  process manager. Use `npm run build` + `npm run start` under systemd.
- **Install devDependencies before building.** `npm ci`, not
  `NODE_ENV=production npm ci`.
- **Use a non-root service account.** Run Node as `vrs`, bind to `127.0.0.1`.
- **Don't expose port 3100.** Apache proxies; the firewall only opens 80/443.
- **systemd does not read nvm.** Use the system Node from NodeSource, or an absolute
  nvm binary path in the unit.
- **Verify the SSL vhost has `ProxyPass`.** Certbot usually copies it; confirm.
- **Basic Auth must exempt `/.well-known/acme-challenge`.** Otherwise renewal fails.
- **Check for stale AAAA records.** They can make Certbot fail even when A is right.
- **Update `allowedOrigins` and `metadataBase`.** Both still reference the old host.
- **Add swap if the VM is small.** Next builds can spike memory.
- **Keep the old deployment.** Don't repurpose the existing vhost; this is a separate
  subdomain, directory, port, and systemd service.
- **Back up before updates.** At minimum, copy `.next` before replacing it.
- **Consider noindex/basic auth** while this is a training environment.
- **Set up log rotation** if you add application logs; `journald` handles the Node
  service, Apache has its own rotation.

---

## 15. If you actually want Google Cloud instead

Only do this if you are moving compute, not just adding a domain:

1. Create/select a GCP project and enable billing.
2. Create a **Compute Engine** VM (Ubuntu LTS), attach a **static external IP**.
3. Open firewall ports 80/443 (and 22 restricted to your IP).
4. Install Node, Apache, Certbot on that VM and follow §4–§10 above.
5. Point the DreamHost A record at the GCP static IP instead of the DreamHost VM.
6. Keep the DreamHost VM until the new host passes verification, then decommission
   or repurpose it.

Cloud Run is also possible, but it requires a container image, a Dockerfile, and a
different TLS/domain-mapping story. It is more work than the VM for this demo.

---

## 16. One-page checklist

- [ ] Redesign committed and pushed to `ai-dhs-v1`
- [ ] Conflict markers removed from `README.md` / `.gitignore`
- [ ] `allowedOrigins` and `metadataBase` updated for the new host
- [ ] DreamHost A record created; AAAA absent or correct
- [ ] Ports 80/443 open at both DreamHost and VM firewall
- [ ] Node 20 installed system-wide
- [ ] `vrs` user and `/var/www/vrs-demo` created
- [ ] Repo cloned on `ai-dhs-v1`
- [ ] `npm ci` + `npm run build` succeed
- [ ] systemd service running on `127.0.0.1:3100`
- [ ] Apache vhost enabled and proxying
- [ ] `certbot --apache --redirect` succeeds
- [ ] SSL vhost contains the proxy directives
- [ ] `http://` redirects to `https://`
- [ ] Live site checked on desktop and mobile
- [ ] Tray, sign-in, and mock checkout work
- [ ] Basic auth / noindex added if this is a private demo
- [ ] `certbot renew --dry-run` passes
- [ ] Logs checked; no browser console errors
