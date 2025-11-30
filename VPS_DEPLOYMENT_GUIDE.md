# 🌐 VPS Deployment Guide (Hostinger/Ubuntu)

This guide assumes you have a clean VPS running **Ubuntu 20.04** or **22.04**.

---

## 1️⃣ Access Your Server

Open your terminal (PowerShell or Command Prompt) and SSH into your VPS:
```bash
ssh root@YOUR_VPS_IP
# Enter your password when prompted
```

---

## 2️⃣ Initial Server Setup

Update the system and install essential tools:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx certbot python3-certbot-nginx
```

---

## 3️⃣ Install Node.js

Install the latest LTS version of Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v
```

---

## 4️⃣ Install Process Manager (PM2)

PM2 keeps your backend running in the background and restarts it if it crashes.
```bash
sudo npm install -g pm2
```

---

## 5️⃣ Setup the Project

1.  **Clone your Repository**:
    ```bash
    cd /var/www
    git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git vedic-astro
    cd vedic-astro
    ```

2.  **Setup Backend**:
    ```bash
    cd backend
    npm install
    
    # Create .env file
    nano .env
    ```
    *Paste your environment variables inside `nano`:*
    ```env
    PORT=5000
    MONGODB_URI=mongodb+srv://... (Your Atlas URL) OR mongodb://localhost:27017/vedic_astro (if local)
    JWT_SECRET=your_super_secret_key
    ```
    *Press `Ctrl+X`, then `Y`, then `Enter` to save.*

3.  **Start Backend with PM2**:
    ```bash
    pm2 start server.js --name "astro-api"
    pm2 save
    pm2 startup
    # Run the command displayed by 'pm2 startup' to enable auto-start on reboot
    ```

---

## 6️⃣ Setup Frontend

1.  **Build the Frontend**:
    *   *Option A (Build on Server - Recommended):*
        ```bash
        cd ../frontend
        npm install
        
        # Set API URL to your domain (or IP if no domain yet)
        export VITE_API_URL=http://YOUR_VPS_IP/api
        # OR if you have a domain: export VITE_API_URL=https://yourdomain.com/api
        
        npm run build
        ```
    *   *Option B (Upload Local Build):*
        If your server is slow, upload your local `dist` folder to `/var/www/vedic-astro/frontend/dist` using FileZilla or SCP.

---

## 7️⃣ Configure Nginx (Reverse Proxy)

Nginx will serve your Frontend files and forward API requests to your Backend.

1.  **Create Config File**:
    ```bash
    sudo nano /etc/nginx/sites-available/vedic-astro
    ```

2.  **Paste Configuration**:
    *Replace `yourdomain.com` with your actual domain or VPS IP.*

    ```nginx
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com; # OR your VPS IP

        root /var/www/vedic-astro/frontend/dist;
        index index.html;

        # Serve Frontend (React App)
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Proxy API Requests to Backend
        location /api {
            proxy_pass http://localhost:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

3.  **Enable Site**:
    ```bash
    sudo ln -s /etc/nginx/sites-available/vedic-astro /etc/nginx/sites-enabled/
    sudo rm /etc/nginx/sites-enabled/default  # Remove default test page
    sudo nginx -t                             # Test config for errors
    sudo systemctl restart nginx
    ```

---

## 8️⃣ Setup Database (MongoDB)

*Option A: Use MongoDB Atlas (Cloud)* - **Recommended**
- Use the connection string you put in the `.env` file in Step 5. No extra setup needed on VPS.

*Option B: Install MongoDB Locally on VPS*
```bash
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

## 9️⃣ SSL (HTTPS) - Optional but Recommended

If you have a domain pointing to your VPS IP:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Follow the prompts to enable HTTPS automatically.

---

## ✅ Done!

Visit `http://YOUR_VPS_IP` (or your domain) in your browser.
- The Frontend should load.
- Login/API calls should work (routed via `/api`).
