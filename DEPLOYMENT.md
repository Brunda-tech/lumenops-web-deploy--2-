# LumenOps — Standard Web Server Deployment Guide

This package contains both the **pre-built static website (`dist/`)** and the **full source code (`src/`, `server.ts`, `package.json`)** for the LumenOps BESCOM Outage & Complaint Operations Platform.

---

## Option 1: Static Web Server (Nginx — Ubuntu / Debian / RHEL)

The `dist/` folder contains pure HTML, CSS, and JavaScript. No Node.js runtime is required on the server.

1. **Upload & Extract** the ZIP archive onto your server:
   ```bash
   unzip lumenops-web-deploy.zip -d /var/www/lumenops
   ```
2. **Copy the Nginx config** (`deploy/nginx.conf`):
   ```bash
   sudo cp /var/www/lumenops/deploy/nginx.conf /etc/nginx/sites-available/lumenops
   sudo ln -s /etc/nginx/sites-available/lumenops /etc/nginx/sites-enabled/
   ```
3. **Update `server_name`** in `/etc/nginx/sites-available/lumenops` to your domain or server IP.
4. **Test & Reload Nginx**:
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```
5. **(Optional HTTPS)** Enable free SSL via Certbot:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

---

## Option 2: Apache HTTP Server / cPanel Shared Hosting

1. Open your hosting **File Manager** (or connect via SFTP) and navigate to `public_html/` (or `/var/www/html/`).
2. Upload the contents of the **`dist/`** folder directly into `public_html/`.
3. Copy **`deploy/.htaccess`** into `public_html/.htaccess` so client-side routes and assets resolve cleanly.
4. Ensure `mod_rewrite` is enabled (`sudo a2enmod rewrite && sudo systemctl restart apache2` on self-hosted Ubuntu).

---

## Option 3: Full-Stack Node.js + Express (With Live API & Dynamic ZIP)

If you want to run the Express API backend alongside the frontend:

1. Ensure **Node.js v20+** is installed.
2. Install dependencies and build the production bundle:
   ```bash
   npm install
   npm run build
   ```
3. Start the server on port 3000 (or set `PORT=8080`):
   ```bash
   npm start
   ```
4. Use **PM2** to keep the process running in production and reverse-proxy port 3000 behind Nginx:
   ```bash
   npm install -g pm2
   pm2 start "npm start" --name lumenops
   pm2 save
   ```

---

## Option 4: Docker (One-Command Container)

```bash
docker build -f deploy/Dockerfile -t lumenops-web .
docker run -d -p 80:80 --name lumenops lumenops-web
```
