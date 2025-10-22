# 🚀 Free Deployment Guide - WonderTech

Deploy your full-stack app to production **completely free** using Vercel (frontend) and Render (backend + database).

---

## 📋 Overview

We'll deploy your app across these platforms:

| Component    | Technology           | Platform | Cost |
| ------------ | -------------------- | -------- | ---- |
| **Frontend** | React + Vite         | Vercel   | FREE |
| **Backend**  | Express + TypeScript | Render   | FREE |
| **Database** | MySQL                | Render   | FREE |

**Architecture:**

```
User Browser
    ↓
Vercel (Frontend) → https://wondertech.vercel.app
    ↓
Render (Backend) → https://wondertech-api.onrender.com
    ↓
Render MySQL → Database
```

---

## 🔧 Step 1: Prepare Backend for Render

### 1.1 Update `backend/package.json`

Add build and start scripts:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit"
  }
}
```

### 1.2 Update `backend/tsconfig.json`

Ensure output directory is set:

```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
    // ... other options
  }
}
```

### 1.3 Create `.gitignore` (if not exists)

```
node_modules/
dist/
.env
uploads/
*.log
```

### 1.4 Update `backend/src/server.ts`

Make sure port uses environment variable:

```typescript
const PORT = process.env.PORT ?? 5000;
```

### 1.5 Test Local Build

```bash
cd backend
npm run build
npm start
```

If it runs without errors, you're ready! ✅

---

## 🌐 Step 2: Deploy Backend on Render

### 2.1 Push Code to GitHub

```bash
# In project root
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/wondertech.git
git push -u origin main
```

### 2.2 Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

### 2.3 Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:

| Field              | Value                          |
| ------------------ | ------------------------------ |
| **Name**           | `wondertech-api`               |
| **Region**         | Choose closest to you          |
| **Root Directory** | `backend`                      |
| **Environment**    | `Node`                         |
| **Build Command**  | `npm install && npm run build` |
| **Start Command**  | `npm start`                    |
| **Instance Type**  | `Free`                         |

### 2.4 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these (we'll update database later):

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-production-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://wondertech.vercel.app
```

**⚠️ Important:** Change `FRONTEND_URL` to your actual Vercel URL once deployed!

### 2.5 Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for build
3. You'll get a URL like: `https://wondertech-api.onrender.com`

### 2.6 Test Backend

```bash
curl https://wondertech-api.onrender.com/health
```

Should return: `{"status":"ok","timestamp":"..."}`

---

## 🗄️ Step 3: Create Free MySQL Database on Render

### 3.1 Create Database

1. From Render Dashboard, click **"New +"** → **"PostgreSQL"**

   **Wait!** Render doesn't offer free MySQL anymore. We'll use **PostgreSQL** instead (it's better and free!)

### 3.2 Alternative: Use PlanetScale (Free MySQL)

Since Render doesn't have free MySQL, use PlanetScale:

1. Go to [planetscale.com](https://planetscale.com)
2. Sign up (free tier: 5GB storage, 1 billion reads/month)
3. Create new database: `wondertech-db`
4. Click **"Connect"** → **"Create password"**
5. Copy the connection string

**Or use Render PostgreSQL (Recommended):**

### 3.3 Switch to PostgreSQL (Better Free Option)

**Update `backend/package.json`:**

```bash
npm uninstall mysql2
npm install pg
```

**Update `backend/src/config/database.ts`:**

```typescript
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export const initDatabase = async (): Promise<void> => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_email ON users(email);
    `);

    // Create recordings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recordings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        filepath VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_user_id ON recordings(user_id);
    `);

    console.log("✅ Database tables initialized");
  } catch (error) {
    console.error("❌ Database initialization error:", error);
    throw error;
  }
};

export default pool;
```

**Update all database queries:**

Replace `db.query<ResultSetHeader>` with `pool.query` and adjust syntax:

```typescript
// OLD (MySQL)
const [result] = await db.query<ResultSetHeader>(
  "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
  [name, email, passwordHash]
);

// NEW (PostgreSQL)
const result = await pool.query(
  "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
  [name, email, passwordHash]
);
const userId = result.rows[0].id;
```

### 3.4 Create PostgreSQL on Render

1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name:** `wondertech-db`
   - **Database:** `wondertech`
   - **User:** (auto-generated)
   - **Region:** Same as your backend
   - **Instance Type:** `Free`
3. Click **"Create Database"**
4. Copy the **"Internal Database URL"**

### 3.5 Add Database URL to Backend

1. Go to your backend service on Render
2. **"Environment"** → **"Add Environment Variable"**
3. Add:

   ```
   DATABASE_URL=postgresql://user:pass@host:5432/database
   ```

   (Use the Internal Database URL from step 3.4)

4. Click **"Save Changes"** (this will redeploy)

### 3.6 Verify Database Connection

Check backend logs:

- Should see: `✅ Database tables initialized`
- Should see: `🚀 Server running on http://localhost:10000`

---

## 🎨 Step 4: Deploy Frontend on Vercel

### 4.1 Update Frontend API URL

Create `frontend/.env.production`:

```env
VITE_API_URL=https://wondertech-api.onrender.com
```

**Update `frontend/src/api/axios.ts`:**

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// ... rest of your interceptors
```

**Update all API calls to use relative URLs:**

```typescript
// frontend/src/api/auth.ts
export const authApi = {
  register: async (data: RegisterFormData): Promise<AuthResponse> => {
    const response = await api.post("/api/auth/register", data);
    return authResponseSchema.parse(response.data);
  },
  // ...
};
```

### 4.2 Update `frontend/vite.config.ts`

Remove proxy (not needed in production):

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Remove proxy configuration
});
```

### 4.3 Test Local Production Build

```bash
cd frontend
npm run build
npm run preview
```

Visit `http://localhost:4173` to test.

### 4.4 Push Changes to GitHub

```bash
git add .
git commit -m "Prepare for production deployment"
git push
```

### 4.5 Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New Project"**
4. Import your `wondertech` repository
5. Configure:

| Field                | Value           |
| -------------------- | --------------- |
| **Framework Preset** | `Vite`          |
| **Root Directory**   | `frontend`      |
| **Build Command**    | `npm run build` |
| **Output Directory** | `dist`          |
| **Install Command**  | `npm install`   |

### 4.6 Add Environment Variables

In Vercel project settings → **"Environment Variables"**:

```env
VITE_API_URL=https://wondertech-api.onrender.com
```

**⚠️ Replace with your actual Render backend URL!**

### 4.7 Deploy

1. Click **"Deploy"**
2. Wait 1-2 minutes
3. You'll get a URL like: `https://wondertech.vercel.app`

---

## 🔗 Step 5: Connect Frontend & Backend (CORS)

### 5.1 Update Backend CORS

Go to Render → Your backend service → **"Environment"**

Update `FRONTEND_URL`:

```env
FRONTEND_URL=https://wondertech.vercel.app
```

**⚠️ Use your actual Vercel URL (no trailing slash)!**

### 5.2 Verify CORS in Code

Ensure `backend/src/server.ts` uses the env variable:

```typescript
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
  })
);
```

### 5.3 Redeploy Backend

Render will auto-redeploy when you save environment variables.

Wait 2-3 minutes for deployment.

---

## 🧪 Step 6: Test Your Deployed App

### 6.1 Test Frontend

1. Visit your Vercel URL: `https://wondertech.vercel.app`
2. Should see login page ✅

### 6.2 Test Registration

1. Click "Register"
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. Click "Create Account"
4. Should redirect to dashboard ✅

### 6.3 Test Recording

1. Click "Start Group Activity"
2. Accept consent
3. Grant permissions
4. Record for 5 seconds
5. Click "Stop Recording"
6. **⚠️ Upload will fail** - read Step 7 for file storage solution

### 6.4 Test API Directly

```bash
# Register
curl -X POST https://wondertech-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"API Test","email":"api@test.com","password":"password123"}'

# Login
curl -X POST https://wondertech-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"api@test.com","password":"password123"}'
```

---

## 💾 Step 7: File Storage for Recordings

**⚠️ Problem:** Render's free tier has ephemeral storage (files are deleted on restart).

### 7.1 Option A: Use Cloudinary (Free, Recommended)

**Setup Cloudinary:**

1. Sign up at [cloudinary.com](https://cloudinary.com) (free: 25 GB storage)
2. Get your credentials from Dashboard
3. Install package:
   ```bash
   cd backend
   npm install cloudinary multer-storage-cloudinary
   ```

**Update `backend/src/routes/recordingRoutes.ts`:**

```typescript
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "wondertech-recordings",
    resource_type: "video",
    format: async () => "webm",
  } as any,
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});
```

**Add to Render Environment Variables:**

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Update recording controller to use Cloudinary URL:**

```typescript
export const createRecording = async (req: AuthRequest, res: Response) => {
  // ...
  const filepath = req.file?.path; // Cloudinary URL
  // ...
};
```

### 7.2 Option B: Use AWS S3 (Free Tier)

AWS offers 5GB free for 12 months. Similar setup with `multer-s3`.

### 7.3 Option C: Disable File Upload (Testing Only)

Remove upload functionality temporarily to test other features.

---

## ⚡ Step 8: Important Tips

### 8.1 Render Free Tier Limitations

- **Spins down after 15 minutes of inactivity**
- **First request after sleep takes 30-60 seconds**
- **Ephemeral storage** (files deleted on restart)

**Solution:** Use external storage (Cloudinary, S3) for uploads.

### 8.2 Keep Backend Awake (Optional)

Use [cron-job.org](https://cron-job.org):

1. Create free account
2. Add job:
   - URL: `https://wondertech-api.onrender.com/health`
   - Interval: Every 10 minutes
3. This keeps your backend active

### 8.3 Environment Variables Checklist

**Backend (Render):**

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://...
JWT_SECRET=long-random-string-min-32-chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://wondertech.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

**Frontend (Vercel):**

```env
VITE_API_URL=https://wondertech-api.onrender.com
```

### 8.4 Custom Domains (Optional)

**Vercel:**

- Settings → Domains → Add your domain
- Update DNS records (Vercel provides instructions)

**Render:**

- Settings → Custom Domain → Add domain
- Update DNS to point to Render

### 8.5 HTTPS

Both Vercel and Render provide **free SSL certificates** automatically! ✅

---

## 🔧 Troubleshooting

### Frontend can't connect to backend

**Check:**

1. ✅ `VITE_API_URL` in Vercel env vars
2. ✅ `FRONTEND_URL` in Render env vars
3. ✅ No trailing slashes in URLs
4. ✅ Both deployments are successful
5. ✅ Check browser console for errors

**Fix CORS:**

```typescript
// backend/src/server.ts
app.use(
  cors({
    origin: [
      "https://wondertech.vercel.app",
      "https://wondertech-git-main-yourname.vercel.app", // Vercel preview URLs
      "http://localhost:5173", // Local development
    ],
    credentials: true,
  })
);
```

### Database connection fails

**Check:**

1. ✅ `DATABASE_URL` is correct
2. ✅ Database is running on Render
3. ✅ Connection string includes SSL settings for production

**Test connection:**

```bash
# In Render Shell (Dashboard → Shell tab)
node -e "require('pg').Pool({connectionString:process.env.DATABASE_URL}).query('SELECT NOW()')"
```

### Build fails on Render

**Common issues:**

- Missing `dist` folder → Check `tsconfig.json` `outDir`
- TypeScript errors → Run `npm run typecheck` locally
- Missing dependencies → Check `package.json`

**Check logs:**

- Render Dashboard → Your service → "Logs" tab

### Upload fails after deployment

**This is expected!** Render free tier doesn't persist files.

**Solution:** Implement Cloudinary (Step 7.1)

### App is slow / not responding

**Render free tier sleeps after 15 min inactivity.**

**Solutions:**

1. Use cron job to ping `/health` endpoint
2. Upgrade to paid plan ($7/month)
3. Accept the delay (users expect this on free tier)

### PostgreSQL vs MySQL differences

If you have MySQL-specific queries:

| MySQL            | PostgreSQL                |
| ---------------- | ------------------------- |
| `?` placeholders | `$1, $2, $3` placeholders |
| `AUTO_INCREMENT` | `SERIAL`                  |
| `LIMIT ?, ?`     | `LIMIT x OFFSET y`        |
| `NOW()`          | `NOW()` ✅ (same)         |

---

## 📊 Deployment Checklist

Before going live:

- [ ] Backend deployed on Render
- [ ] Database created and connected
- [ ] Frontend deployed on Vercel
- [ ] Environment variables set correctly
- [ ] CORS configured
- [ ] File upload using Cloudinary/S3
- [ ] Tested registration flow
- [ ] Tested login flow
- [ ] Tested recording upload
- [ ] SSL working (https://)
- [ ] Custom domain (optional)

---

## 🎉 You're Live!

Your app is now deployed on:

- **Frontend:** `https://wondertech.vercel.app`
- **Backend:** `https://wondertech-api.onrender.com`
- **Database:** Managed PostgreSQL on Render

**Total Cost:** $0.00 / month 💰

---

## 🚀 Next Steps

1. **Monitor usage** - Check Render/Vercel dashboards
2. **Set up logging** - Add error tracking (Sentry free tier)
3. **Add analytics** - Google Analytics or Plausible
4. **Improve performance** - Add caching, optimize images
5. **Scale when needed** - Upgrade to paid plans for production traffic

---

**Congratulations! Your full-stack app is live! 🎊**

Need help? Check the logs on Render/Vercel dashboards.
