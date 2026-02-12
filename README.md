# 🥔 Potato CMS

**⚠️ Early Development Warning ⚠️**
This project is currently in early development. While functional, many features may not be thoroughly tested and are subject to change. Use with caution in production environments.

Potato is a lightweight, high-performance Headless CMS for GitHub-backed static sites, built with React, Vite, and Cloudflare Workers.

## 🚀 Step-by-Step Setup Guide

Follow these steps to deploy your own instance of Potato CMS.

### 1. Fork the Repository
Click the **Fork** button at the top of this repository. This creates your own copy of the CMS that you can customize and deploy.

### 2. Prepare your GitHub Account
You need a **Fine-grained Personal Access Token (PAT)** so the CMS can write to your repo.

1. Go to [GitHub Settings > Developer settings > Personal access tokens > Fine-grained tokens](https://github.com/settings/tokens?type=beta).
2. Click **Generate new token**.
3. Name it `Potato CMS Token`.
4. Set **Repository access** to "Only select repositories" and choose your forked repo.
5. Grant the following **Permissions**:
   - **Contents**: Read and Write (This allows the CMS to edit your posts).
   - **Metadata**: Read-only (Automatically added).
6. **Save the token** somewhere safe—you won't see it again!

### 3. Deploy to Cloudflare Pages
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Go to **Workers & Pages > Create > Pages > Connect to Git**.
3. Select your forked `potato` repository.
4. **Build settings**:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **Save and Deploy**.

### 4. Configure KV Storage
Potato uses Cloudflare KV to store your configuration and sessions.

1. In the Cloudflare Dashboard, go to **Workers & Pages > KV**.
2. Click **Create namespace** and name it `potato_kv`.
3. Go back to your **Pages Project > Settings > Functions**.
4. Scroll to **KV namespace bindings**.
5. Add a binding:
   - **Variable name**: `potato_kv`
   - **KV namespace**: Select the namespace you just created.
6. **D1 Database**: Add a D1 binding named `potato_d1`.
7. **Redeploy** your site to apply the bindings.

### 5. Initial Setup Mode
1. Visit your deployed Cloudflare Pages URL.
2. The CMS will detect it's unconfigured and enter **Setup Mode**.
3. Follow the on-screen prompts to:
   - Create your **Administrator** account.
   - Enter your **GitHub PAT** from Step 2.
   - Link your **Content Repository** (where your blog posts live).
   - Select Branch and the posts and images directories.

---

## ✨ Recent Updates
- **Refactored Settings & Workbench**: Modern split-pane layout with improved responsiveness.
- **Enhanced Stability**: Improved error handling and sequential initialization for GitHub operations.
- **KV-First Workflow**: Robust draft and preview system utilizing Cloudflare KV with D1 fallbacks.
- **Optimized UI**: Improved mobile navigation and desktop sidebar behavior.

## 📖 Documentation
For comprehensive documentation including setup, user guides, developer information, and contribution guidelines, please refer to the [Full Documentation](./DOCUMENTATION.md).

## 🛠️ Development
```bash
npm install
npm run dev
```

---
*Built for speed, simplicity, and your favorite spud.*
