# 🚀 Hostinger Deployment - Quick Start Guide

## ✅ All Tasks Completed

Your Next.js project is now fully optimized for Hostinger deployment. Here's what was set up:

---

## 📋 What Was Done

### 1. **Dependencies Fixed**
- ✅ Removed `better-sqlite3` (native module - won't work on Hostinger)
- ✅ Removed `@netlify/plugin-nextjs` (Netlify-specific)
- ✅ Updated `package.json` with Node version requirements (18.x || 20.x)
- ✅ Created `.npmrc` with proper installation settings

### 2. **Environment Configuration**
- ✅ Created `.env.production.example` with all required variables
- ✅ Added database configuration templates
- ✅ Added email/SMTP configuration
- ✅ Added PayPal configuration
- ✅ Added feature flags

### 3. **Deployment Scripts**
- ✅ `hostinger-build.sh` - Full build preparation script
- ✅ `hostinger-start.js` - Application starter script
- ✅ `hostinger-postinstall.sh` - Post-installation setup
- ✅ Updated package.json with `start:hostinger` command

### 4. **Build Configuration**
- ✅ Updated `next.config.js` for production
- ✅ Image optimization enabled (AVIF, WebP)
- ✅ ESLint configured for builds
- ✅ Updated `.gitignore` for proper deployments

### 5. **SEO Setup** (Previously completed)
- ✅ Dynamic robots.txt
- ✅ Dynamic sitemap.xml
- ✅ Structured data (JSON-LD)
- ✅ Metadata for all pages
- ✅ Open Graph tags

---

## 🎯 Quick Deployment Steps

### **Step 1: Prepare Locally**
```bash
# Navigate to your project
cd c:\Users\ADV\Downloads\project

# Clean old build
npm cache clean --force
rm -rf node_modules .next

# Install dependencies
npm install --legacy-peer-deps

# Test the build locally
npm run build

# Test production locally
npm start
```

### **Step 2: Setup Environment**
```bash
# Copy example to local
cp .env.production.example .env.local

# Update with YOUR actual values
nano .env.local  # or open in VS Code
```

**Required values to update:**
```
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
SMTP_HOST, SMTP_USER, SMTP_PASSWORD
NEXT_PUBLIC_PAYPAL_CLIENT_ID
```

### **Step 3: Upload to Hostinger**

**Option A: Git Deployment (RECOMMENDED)**
```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy to Hostinger"
git push origin main

# 2. In Hostinger Control Panel:
#    - Go to Git
#    - Connect your repository
#    - Set build command: npm run build
#    - Set start command: npm start
```

**Option B: FTP Upload**
```bash
# 1. Remove unnecessary files locally
rm -rf node_modules .next .git

# 2. Zip everything
zip -r trueautocheck.zip .

# 3. Upload to Hostinger via FTP
# 4. Extract on server
```

**Option C: SSH (If available)**
```bash
# Connect to Hostinger
ssh user@yourdomain.com

# Navigate to project
cd public_html/trueautocheck

# Install & build
npm install --legacy-peer-deps
npm run build

# Configure Node.js and start
npm start
```

### **Step 4: Configure Node.js on Hostinger**

1. **Hostinger Control Panel** → **Node.js**
2. **Create Application** or **Modify Existing**
3. Set these values:
   - **Application Root:** `/public_html` (or your folder)
   - **Application Startup File:** `npm start` or `node_modules/.bin/next start`
   - **Node.js Version:** 18.x or 20.x
   - **Node Environment:** `production`
   - **Port:** Leave default (Hostinger assigns automatically)
   - **Interpreter:** Node.js

4. **Environment Variables** (Set in Hostinger panel):
   ```
   NODE_ENV=production
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
   SMTP_* variables
   PAYPAL_* variables
   ```

5. **Click Deploy/Restart**

### **Step 5: Verify Deployment**

```bash
# Check if site is live
curl https://yourdomain.com

# Check status
# - Hostinger Control Panel → Node.js → View logs
# - Check application status (should be "Running")
```

---

## 🔧 Available Commands

```bash
# Local development
npm run dev          # Start dev server on localhost:3000

# Production build
npm run build        # Build for production

# Production start
npm start            # Start production server

# Hostinger-specific
npm run setup:hostinger    # Build with optimizations
npm run start:hostinger    # Start with Hostinger settings

# Linting & type checking
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript check
```

---

## 🗄️ Database Setup

### **Using MySQL (Already configured)**
Make sure your Hostinger MySQL database is ready:

```bash
# Environment variables needed
DB_HOST=yourdatabasehost.com
DB_USER=yourdatabaseuser
DB_PASSWORD=yourpassword
DB_NAME=yourdatabasename
DB_PORT=3306
```

Your code already uses `mysql2` which is production-ready for Hostinger.

### **Create Database Tables**
```bash
# Run your schema
mysql -h DB_HOST -u DB_USER -p DB_NAME < sql/schema-mysql.sql
```

---

## 📊 File Structure After Deployment

```
public_html/
├── .env.local              # (Not in git - create on server)
├── .next/                  # Build output (auto-generated)
├── node_modules/           # Dependencies (auto-installed)
├── app/                    # Next.js pages
├── components/             # React components
├── lib/                    # Utilities
├── public/                 # Static files
├── package.json
├── next.config.js
├── tsconfig.json
├── .npmrc                  # npm configuration
└── ...other files
```

---

## ⚠️ Troubleshooting

### **Error 113 - Dependencies Failed**
```bash
# Solution:
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps --no-audit --no-fund
```

### **Cannot Connect to Database**
```
- Verify DB_HOST is accessible from Hostinger
- Check DB credentials
- Verify database user has correct permissions
- Check firewall rules
```

### **Application Not Starting**
```bash
# Check Hostinger logs
# Verify .env.local exists and has correct values
# Verify Node.js version is 18+ in Hostinger panel
# Run locally first: npm run build && npm start
```

### **Build Fails**
```bash
# Check for type errors
npm run typecheck

# Check for lint errors
npm run lint

# Rebuild
npm run build
```

### **Port Already in Use**
```bash
# Hostinger assigns ports automatically
# Set PORT environment variable in Hostinger panel
# Don't hardcode port in code
```

---

## 📱 Testing Checklist

- [ ] Site loads on `https://yourdomain.com`
- [ ] All pages accessible (/, /about-us, /pricing, etc.)
- [ ] SEO working (check robots.txt, sitemap.xml)
- [ ] Database connected (forms work, data saves)
- [ ] Emails sending (if configured)
- [ ] Images loading properly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] HTTPS working properly

---

## 🔐 Security Tips

1. **Never commit `.env.local`** - Already in .gitignore
2. **Use strong database passwords**
3. **Enable HTTPS** - Should be automatic on Hostinger
4. **Set proper file permissions** - `chmod 755` for public files
5. **Keep Node.js updated** - Use latest stable version
6. **Monitor logs regularly** - Check Hostinger logs
7. **Use environment variables** - Don't hardcode secrets

---

## 📞 Need Help?

### **Hostinger Support**
- Control Panel Help: https://support.hostinger.com/
- Node.js Deployment: Search "Node.js" in docs
- FTP Access: Check under File Manager

### **Next.js Documentation**
- Deployment: https://nextjs.org/docs/deployment
- Configuration: https://nextjs.org/docs/api-reference/next-config-js
- Environment Variables: https://nextjs.org/docs/basic-features/environment-variables

### **Check Your Project**
- **Type Errors:** `npm run typecheck`
- **Lint Errors:** `npm run lint`
- **Build Issues:** `npm run build`
- **Dependencies:** `npm list`

---

## ✨ Pro Tips

1. **Use Git** - Push to GitHub first, then use Hostinger's Git integration
2. **Test locally** - Always run `npm run build && npm start` before uploading
3. **Monitor performance** - Check Hostinger's metrics dashboard
4. **Backup database** - Regular backups from Hostinger panel
5. **Keep logs** - Save application logs for debugging
6. **Update dependencies** - Periodically update packages (carefully)

---

## 🎉 You're All Set!

Your application is production-ready for Hostinger. Follow the deployment steps above and you should have your site live in minutes!

**Questions?** Check the logs in Hostinger Control Panel → Node.js → View logs
