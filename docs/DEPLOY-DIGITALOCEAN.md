# Deploy Valmiki Ashram on DigitalOcean (Docker Compose only)

This guide is intentionally Docker Compose only.

- No Kubernetes
- No ingress-nginx
- No domain routing changes on `80/443`
- Valmiki runs on:
  - `http://<droplet-ip>:4000` (client)
  - `http://<droplet-ip>:5000` (server API)

This keeps `gurukulamhub.org` untouched.

---

## 1) One-time cleanup: remove old Valmiki k8s resources

Run on droplet:

```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
kubectl delete namespace valmiki --ignore-not-found
kubectl get ns
```

If you already removed it, this is safe.

---

## 2) Delete current Valmiki folder and clone fresh in `/var/www`

Run on droplet:

```bash
rm -rf /var/www/valmiki-ashram
mkdir -p /var/www
cd /var/www
git clone https://github.com/rnoonegen/valmiki-ashram.git
cd /var/www/valmiki-ashram
```

If your remote is different, replace the repo URL.

---

## 3) Prepare env file for compose

```bash
cp .env.valmiki.example .env.valmiki
nano .env.valmiki
```

Set at least:

```env
CLIENT_URL=http://139.59.6.209:4000
REACT_APP_SERVER_URL=http://139.59.6.209:5000
MONGO_URI=mongodb://mongo:27017/valmiki
ADMIN_JWT_SECRET=change-this-to-long-random-secret
MAX_UPLOAD_MB=25
```

Optional: fill `S3_*` values only if you use uploads.

---

## 4) Start services with docker compose

```bash
docker compose --env-file .env.valmiki -f docker-compose.valmiki.yml up -d --build
docker compose --env-file .env.valmiki -f docker-compose.valmiki.yml ps
```

View logs:

```bash
docker compose --env-file .env.valmiki -f docker-compose.valmiki.yml logs -f
```

---

## 5) Open firewall ports

```bash
ufw allow 4000/tcp
ufw allow 5000/tcp
ufw status
```

---

## 6) Verify deployment

```bash
curl -sS http://139.59.6.209:5000/
curl -sS http://139.59.6.209:5000/api/content/home
```

Open in browser:

- `http://139.59.6.209:4000`

---

## 7) Update deployment (manual)

```bash
cd /var/www/valmiki-ashram
git pull origin main
docker compose --env-file .env.valmiki -f docker-compose.valmiki.yml up -d --build
```

---

## 8) Optional CI/CD (already configured in `.github/workflows/deploy-do.yml`)

On push to `main`, workflow now:

1. SSH into droplet
2. Ensures repo exists at `/var/www/valmiki-ashram`
3. Writes `.env.valmiki` from GitHub Secrets
4. Runs docker compose build + up

Required GitHub secrets:

- `DO_HOST`
- `DO_USER`
- `DO_SSH_KEY`
- `ADMIN_JWT_SECRET` (recommended)
- optional `S3_REGION`, `S3_SPACE_NAME`, `S3_ACCESS_KEY_ID`, `S3_ACCESS_KEY_SECRET`, `S3_ENDPOINT`, `S3_PUBLIC_BASE_URL`

---

## 9) Important safety rules

- Do not apply any `kubectl apply` for Valmiki.
- Do not expose Valmiki through ingress on this droplet while `gurukulamhub.org` is active.
- Keep Valmiki on `4000/5000` only unless you intentionally move it to a separate subdomain later.
