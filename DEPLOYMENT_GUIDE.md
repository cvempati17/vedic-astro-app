# 🚀 Vedic Astrology App - Production Deployment Guide

This guide will walk you through deploying your full-stack application to the public internet.

## 📋 Prerequisites

Before starting, ensure you have:
1.  **GitHub Account**: To host your code.
2.  **MongoDB Atlas Account**: For the cloud database.
3.  **Render Account** (or Heroku/Railway): To host the Backend API.
4.  **Vercel Account** (or Netlify): To host the Frontend React App.

---

## 1️⃣ Database Setup (MongoDB Atlas)

Since your local database won't be accessible by the public cloud, you need a cloud database.

1.  **Create Cluster**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free Shared Cluster.
2.  **Create User**: In "Database Access", create a database user (e.g., `astro_user`) and password.
3.  **Allow Access**: In "Network Access", add IP Address `0.0.0.0/0` (allows access from anywhere).
4.  **Get Connection String**:
    *   Click "Connect" -> "Drivers".
    *   Copy the string, e.g., `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`.
    *   Replace `<password>` with your actual password.
    *   **Save this string**, you will need it for the Backend.

---

## 2️⃣ Push Code to GitHub

If you haven't already, push your code to a GitHub repository.

1.  Create a new repository on GitHub.
2.  Run these commands in your project root:
    ```bash
    git add .
    git commit -m "Ready for deployment"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```

---

## 3️⃣ Backend Deployment (Render.com)

We will use Render because it has a generous free tier for Node.js.

1.  **New Web Service**: Log in to Render and click "New +" -> "Web Service".
2.  **Connect GitHub**: Select your repository.
3.  **Configure Service**:
    *   **Name**: `vedic-astro-api` (or similar)
    *   **Root Directory**: `backend` (Important! Your server is in this folder)
    *   **Environment**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
4.  **Environment Variables** (Advanced):
    *   Add `MONGODB_URI`: Paste your MongoDB Atlas connection string.
    *   Add `JWT_SECRET`: Enter a long random string.
    *   Add `PORT`: `10000` (Render default) or `5000`.
5.  **Deploy**: Click "Create Web Service".
6.  **Wait**: It will take a few minutes. Once done, copy the **Service URL** (e.g., `https://vedic-astro-api.onrender.com`).

---

## 4️⃣ Frontend Deployment (Vercel)

Vercel is optimized for React/Vite apps.

1.  **New Project**: Log in to Vercel and click "Add New..." -> "Project".
2.  **Import Git Repository**: Select your repository.
3.  **Configure Project**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: Click "Edit" and select `frontend`.
4.  **Environment Variables**:
    *   **Name**: `VITE_API_URL`
    *   **Value**: Paste your Backend URL from Step 3 (e.g., `https://vedic-astro-api.onrender.com`).
    *   *Note: Do NOT add a trailing slash `/` at the end.*
5.  **Deploy**: Click "Deploy".

---

## 5️⃣ Final Verification

1.  **Visit your Vercel URL** (e.g., `https://vedic-astro-app.vercel.app`).
2.  **Test Login**: Try "Continue as Guest".
3.  **Test Calculation**: Enter birth details and click "Generate Chart".
4.  **Check Data**: Ensure the chart loads and interpretations appear.

---

## 🛠️ Troubleshooting

-   **Backend Error (CORS)**: If the frontend says "Network Error", check your Backend logs on Render. You might need to update `cors` settings in `server.js` to allow your Vercel domain.
    *   *Fix:* In `backend/server.js`, update `cors({ origin: '*' })` or add your Vercel URL.
-   **Database Error**: Ensure your MongoDB user password is correct and Network Access is set to `0.0.0.0/0`.
-   **Build Fails**: Check the logs. Ensure all dependencies are in `package.json`.

---

**🎉 Congratulations! Your Vedic Astrology App is now live!**
