# Deploy Valmiki Ashram to DigitalOcean (Docker + Kubernetes + ingress-nginx + GitHub Actions)

This guide matches the **Valmiki-Ashram** repo layout: **React** app in `client/` (Create React App) and **Express + Socket.IO + MongoDB** in `server/`. Your droplet is **`139.59.6.209`**; SSH as **`root@139.59.6.209`**.

Supporting files in this repository:

- `client/Dockerfile`, `client/nginx.conf` — static SPA + nginx
- `server/Dockerfile` — Node production (`node index.js`)
- `deploy/kubernetes/*.yaml` — namespace, MongoDB, server Secret, Deployments, Services, Ingress
- `.github/workflows/deploy-do.yml` — build images, push to GHCR, restart workloads on the droplet

---

## Part A — One-time: prepare GitHub Container Registry

1. Push this repository to GitHub (origin is already **`https://github.com/rnoonegen/valmiki-ashram.git`**).
2. After the first workflow run, open **GitHub → Packages** for `valmiki-server` and `valmiki-client`, set each package **visibility to Public** (so the droplet can pull without a pull secret). If you keep them private, create a Kubernetes `docker-registry` secret for `ghcr.io` and add `imagePullSecrets` to the Deployments.

---

## Part B — Environment variables (full list and values)

Values below are what this app reads in code. For the **IP deployment**, server runtime values are also stored in `deploy/kubernetes/server.yaml` inside the `server-env` Secret (already filled for `139.59.6.209` and in-cluster Mongo). The **client** bakes `REACT_APP_*` at **Docker build time** (see `client/Dockerfile` defaults and the workflow `build-args`).

### Server (`server/` — `dotenv` / Kubernetes Secret `server-env`)

| Variable | Value used for droplet IP deployment | Source / notes |
|----------|--------------------------------------|----------------|
| `PORT` | `5000` | Required by `server/index.js` (no default in code). |
| `CLIENT_URL` | `http://139.59.6.209` | **Required** for CORS and Socket.IO in `server/index.js`. Must match the URL users open in the browser. |
| `MONGO_URI` | `mongodb://mongo:27017/valmiki` | **Required** by `server/utils/db.js`. Uses the in-cluster Service name `mongo` in namespace `valmiki` (see `deploy/kubernetes/mongo.yaml`). |
| `ADMIN_JWT_SECRET` | `valmiki-admin-secret` | Default in `server/middleware/auth.js` and `server/routes/admin.js` if unset; Secret sets it explicitly. **Change this to a long random string before real production.** |
| `MAX_UPLOAD_MB` | `25` | Default in `server/routes/admin.js` if unset. |
| `S3_REGION` | *(empty string)* | `server/services/s3.js` — leave empty until DigitalOcean Spaces (or S3) is configured; admin uploads will error until these are set. |
| `S3_SPACE_NAME` | *(empty string)* | Same. |
| `S3_ACCESS_KEY_ID` | *(empty string)* | Same. |
| `S3_ACCESS_KEY_SECRET` | *(empty string)* | Same. |
| `S3_ENDPOINT` | *(empty string)* | Optional; if empty, code uses `https://${S3_REGION}.digitaloceanspaces.com` when region is set. |
| `S3_PUBLIC_BASE_URL` | *(empty string)* | Optional CDN/base URL for public object URLs in `server/services/s3.js`. |

### Client (build-time — `REACT_APP_*`)

These are read from `process.env` in the client. **CRA only exposes variables prefixed with `REACT_APP_`.** Defaults in `client/Dockerfile` / workflow:

| Variable | Value for IP deployment | Where used |
|----------|-------------------------|------------|
| `REACT_APP_SERVER_URL` | `http://139.59.6.209` | `client/src/admin/api.js` — base URL for `fetch` and Socket.IO client (`getApiBase()`). Paths already include `/api/...`. |
| `REACT_APP_INTRO_VIDEO_URL` | *(empty)* | `client/src/pages/Home.jsx`, `VideoPlayer.jsx` |
| `REACT_APP_WHATSAPP_NUMBER` | *(empty)* | `Home.jsx` |
| `REACT_APP_WHATSAPP_COMMUNITY_LINK` | *(empty)* | `Home.jsx`, `Layout.jsx`, `Footer.jsx` |
| `REACT_APP_EMAIL` | *(empty)* | `ContactUs.jsx`, `Footer.jsx` |
| `REACT_APP_PHONE` | *(empty)* | `ContactUs.jsx`, `Footer.jsx` |
| `REACT_APP_ADDRESS` | *(empty)* | `ContactUs.jsx`, `Footer.jsx` |
| `REACT_APP_GOOGLE_MAPS_LINK` | *(empty)* | `ContactUs.jsx`, `Footer.jsx` |
| `REACT_APP_GOOGLE_MAPS_EMBED_URL` | *(empty)* | `ContactUs.jsx` |
| `REACT_APP_INSTAGRAM_LINK` | *(empty)* | `Footer.jsx` |
| `REACT_APP_FACEBOOK_LINK` | *(empty)* | `Footer.jsx` |
| `REACT_APP_X_LINK` | *(empty)* | `Footer.jsx` |
| `REACT_APP_LINKEDIN_LINK` | *(empty)* | `Footer.jsx` |
| `REACT_APP_YOUTUBE_LINK` | *(empty)* | `Footer.jsx` |

To change any `REACT_APP_*` value, edit `client/Dockerfile` `ARG`/`ENV` lines (or extend `.github/workflows/deploy-do.yml` `build-args`) and rebuild the client image.

### GitHub Actions secrets (repository **Settings → Secrets and variables → Actions**)

| Secret | Value |
|--------|--------|
| `DO_HOST` | `139.59.6.209` |
| `DO_USER` | `root` |
| `DO_SSH_KEY` | Full private key matching the public key on the droplet (PEM text, including `BEGIN`/`END` lines). |

`GITHUB_TOKEN` is provided automatically for pushing to GHCR.

---

## Part C — One-time: prepare the droplet

SSH:

```bash
ssh root@139.59.6.209
```

Recommended: Ubuntu 22.04+, at least **2 GB RAM** (k3s + Mongo + ingress + app).

1. **Updates and firewall**

```bash
apt-get update && apt-get upgrade -y
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

2. **Install k3s** (Kubernetes without the default Traefik ingress, so we can use **ingress-nginx**)

```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable traefik --write-kubeconfig-mode 644" sh -
```

3. **Use kubectl on the server**

```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
kubectl get nodes
```

4. **Install ingress-nginx (bare-metal manifest)**

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.3/deploy/static/provider/baremetal/deploy.yaml
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s
```

5. **Bind ingress to port 80 on the droplet** (so you can open `http://139.59.6.209` without a random NodePort)

Patch the controller to use the host network:

```bash
kubectl patch deployment ingress-nginx-controller -n ingress-nginx --type=strategic -p '
spec:
  template:
    spec:
      hostNetwork: true
      dnsPolicy: ClusterFirstWithHostNet
'
```

Ensure nothing else is listening on **80** (e.g. system nginx):

```bash
ss -tlnp | grep ':80 '
```

6. **Apply this app’s manifests** (from your laptop, or clone the repo on the server)

From the repository root:

```bash
export KUBECONFIG=/path/to/k3s.yaml   # on local machine: copy /etc/rancher/k3s/k3s.yaml from droplet and replace 127.0.0.1 with 139.59.6.209

kubectl apply -f deploy/kubernetes/namespace.yaml
kubectl apply -f deploy/kubernetes/mongo.yaml
kubectl apply -f deploy/kubernetes/server.yaml
kubectl apply -f deploy/kubernetes/client.yaml
kubectl apply -f deploy/kubernetes/ingress.yaml
```

7. **First-time images** — before CI/CD can deploy, the cluster must be able to pull images. Either:

- Push **`ghcr.io/rnoonegen/valmiki-server:latest`** and **`ghcr.io/rnoonegen/valmiki-client:latest`** once (run the GitHub Action by pushing to `main`, or build/push manually), **or**
- Temporarily set the image lines in `server.yaml` / `client.yaml` to images you already pushed.

8. **Wait for pods**

```bash
kubectl get pods -n valmiki -w
```

9. **Smoke test**

- Browser: `http://139.59.6.209` → React app  
- API: `http://139.59.6.209/api/content/home` (or any public content route)  
- Root JSON: `http://139.59.6.209/api` may 404 depending on routes; `GET http://139.59.6.209/` on the **server Service** is `/` on the server pod — the Ingress sends **`/api`** to the API, **`/`** to the client.

---

## Part D — CI/CD (GitHub Actions)

The workflow **`.github/workflows/deploy-do.yml`** runs on every push to **`main`**:

1. Builds **`server/Dockerfile`** and **`client/Dockerfile`**.
2. Pushes to **`ghcr.io/rnoonegen/valmiki-server`** and **`ghcr.io/rnoonegen/valmiki-client`** (`latest` + commit SHA).
3. SSHes to the droplet and runs:

   `kubectl rollout restart deployment/server deployment/client -n valmiki`

**Required:** add secrets `DO_HOST`, `DO_USER`, `DO_SSH_KEY` (see table above).

**IP change:** If the droplet IP ever changes, update:

- `deploy/kubernetes/server.yaml` → Secret `CLIENT_URL`
- `client/Dockerfile` → `ARG REACT_APP_SERVER_URL`
- `.github/workflows/deploy-do.yml` → `REACT_APP_SERVER_URL`
- Re-apply the Secret and rebuild the **client** image (server CORS uses `CLIENT_URL`).

---

## Part E — Later: map a domain + HTTPS

Do this **after** you buy DNS and point it at **`139.59.6.209`** (A record), e.g. `www.example.com` and `example.com`.

### E1 — Decide public URLs

Example:

- Site: `https://www.example.com`
- API/Socket from browser: same origin via Ingress (no separate API subdomain required) — keep using path `/api` and `/socket.io`.

### E2 — Update environment (rebuild + cluster Secret)

1. **`CLIENT_URL`** (server Secret in `deploy/kubernetes/server.yaml` or edit live):

   `https://www.example.com`

2. **`REACT_APP_SERVER_URL`** (client build):

   `https://www.example.com`

   Update `client/Dockerfile` default `ARG`, and `deploy-do.yml` env `REACT_APP_SERVER_URL`, then push to `main` so CI rebuilds the client.

3. Re-apply Secret and restart server:

```bash
kubectl apply -f deploy/kubernetes/server.yaml
kubectl rollout restart deployment/server -n valmiki
```

### E3 — Install cert-manager + Let’s Encrypt

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.5/cert-manager.yaml
```

Create a `ClusterIssuer` (replace email):

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: you@yourdomain.com
    privateKeySecretRef:
      name: letsencrypt-prod-account-key
    solvers:
      - http01:
          ingress:
            class: nginx
```

Apply it, then add **TLS** to `deploy/kubernetes/ingress.yaml`:

```yaml
spec:
  tls:
    - hosts:
        - www.example.com
        - example.com
      secretName: valmiki-tls
  rules:
    - host: www.example.com
      http:
        paths:
          # same paths as today: /api, /socket.io, /
    - host: example.com
      http:
        paths:
          # duplicate paths or redirect via second Ingress
```

Annotate the Ingress for cert-manager:

```yaml
metadata:
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
```

Apply the updated Ingress; cert-manager will create the certificate.

### E4 — HTTP → HTTPS (optional)

Add an ingress-nginx annotation such as:

`nginx.ingress.kubernetes.io/force-ssl-redirect: "true"`

### E5 — Socket.IO and CORS

After switching to HTTPS, `CLIENT_URL` and `REACT_APP_SERVER_URL` must both use **`https://`** so CORS and Socket.IO stay aligned.

---

## Part F — DigitalOcean Spaces (when you enable uploads)

When you create a Space, set the server Secret (non-empty), for example:

| Variable | Example pattern |
|----------|-----------------|
| `S3_REGION` | `blr1` (or your region slug) |
| `S3_SPACE_NAME` | your Space name |
| `S3_ACCESS_KEY_ID` | Spaces access key |
| `S3_ACCESS_KEY_SECRET` | Spaces secret |
| `S3_ENDPOINT` | `https://blr1.digitaloceanspaces.com` (region-specific) |
| `S3_PUBLIC_BASE_URL` | Optional CDN endpoint URL, or leave empty to use default object URL from code |

Then:

```bash
kubectl apply -f deploy/kubernetes/server.yaml
kubectl rollout restart deployment/server -n valmiki
```

---

## Quick reference — SSH

```bash
ssh root@139.59.6.209
```

On the server:

```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
kubectl get pods -n valmiki
kubectl logs -f deployment/server -n valmiki
```

---

## Security notes (short)

- Replace **`ADMIN_JWT_SECRET`** and consider MongoDB authentication before handling real user data.
- MongoDB in this manifest has **no auth** and is reachable only inside the cluster — acceptable for a private single-node lab, not for multi-tenant production.
- Restrict SSH (`PermitRootLogin`, keys only) and keep the droplet updated.
