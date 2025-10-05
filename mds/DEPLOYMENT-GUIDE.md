# PHPinancia Deployment Guide

**Project:** PHPinancia Finance Tracker  
**Date:** January 2025  
**Version:** 1.0.0

---

## 📋 **TABLE OF CONTENTS**

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Variables Setup](#environment-variables-setup)
3. [Deployment Platforms](#deployment-platforms)
4. [Post-Deployment Steps](#post-deployment-steps)
5. [Troubleshooting](#troubleshooting)

---

## ✅ **PRE-DEPLOYMENT CHECKLIST**

### **Before Deploying**
- [ ] All tests passing (129 tests)
- [ ] Build successful (`npm run build`)
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Supabase RLS policies enabled
- [ ] API keys secured

### **Security Checklist**
- [ ] All secrets in environment variables (not in code)
- [ ] NEXTAUTH_SECRET generated (32+ characters)
- [ ] JWT_SECRET generated (32+ characters)
- [ ] CSRF_SECRET configured
- [ ] Sentry error tracking enabled
- [ ] Rate limiting configured (Upstash Redis)

---

## 🔐 **ENVIRONMENT VARIABLES SETUP**

### **Required Variables**

#### **1. Database (Supabase)**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### **2. Redis (Upstash)**
```bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

#### **3. Authentication**
```bash
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=your_32_character_secret
JWT_SECRET=your_32_character_jwt_secret
```

#### **4. AI Features (Mistral)**
```bash
MISTRAL_API_KEY=your_mistral_api_key
MISTRAL_MODEL=mistral-small-2503
```

#### **5. Email (Mailgun)**
```bash
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
```

#### **6. Error Monitoring (Sentry)**
```bash
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

#### **7. App Configuration**
```bash
NEXT_PUBLIC_APP_NAME=PHPinancia
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
NEXT_PUBLIC_DEFAULT_CURRENCY=PHP
NEXT_PUBLIC_DATE_FORMAT=DD/MM/YYYY
```

#### **8. Production Settings**
```bash
NEXT_PUBLIC_DEBUG=false
LOG_LEVEL=error
NODE_ENV=production
```

### **Optional Variables**
```bash
# Google Analytics
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_CATEGORIZATION=true
NEXT_PUBLIC_ENABLE_RECEIPT_UPLOAD=true
NEXT_PUBLIC_ENABLE_BUDGET_TRACKING=true
NEXT_PUBLIC_ENABLE_REPORTS=true
NEXT_PUBLIC_ENABLE_MULTICURRENCY=false
```

---

## 🚀 **DEPLOYMENT PLATFORMS**

### **Option 1: Vercel (Recommended)**

#### **Why Vercel?**
- ✅ Optimized for Next.js
- ✅ Automatic deployments from GitHub
- ✅ Built-in CDN and edge functions
- ✅ Free tier available
- ✅ Easy environment variable management

#### **Deployment Steps**

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Connect GitHub Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select "PHPinancia" project

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables from `.env.production`
   - Make sure to select "Production" environment

4. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

5. **Deploy**
   ```bash
   vercel --prod
   ```
   Or push to `main` branch for automatic deployment

6. **Update Environment Variables**
   - Update `NEXTAUTH_URL` to your Vercel domain
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel domain

#### **Vercel Configuration File**
Create `vercel.json` in project root:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

### **Option 2: Netlify**

#### **Deployment Steps**

1. **Connect GitHub Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Select your repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: `netlify/functions`

3. **Add Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add all required variables

4. **Deploy**
   - Push to `main` branch for automatic deployment

---

### **Option 3: Railway**

#### **Deployment Steps**

1. **Connect GitHub Repository**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"

2. **Add Environment Variables**
   - Go to Variables tab
   - Add all required variables

3. **Configure**
   - Railway auto-detects Next.js
   - No additional configuration needed

4. **Deploy**
   - Push to `main` branch for automatic deployment

---

### **Option 4: Self-Hosted (VPS/Cloud)**

#### **Requirements**
- Node.js 18+ installed
- PM2 or similar process manager
- Nginx or Apache for reverse proxy
- SSL certificate (Let's Encrypt)

#### **Deployment Steps**

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/phpinancia.git
   cd phpinancia
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create Production Environment File**
   ```bash
   cp .env.production .env.local
   # Edit .env.local with your production values
   ```

4. **Build Application**
   ```bash
   npm run build
   ```

5. **Start with PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name "phpinancia" -- start
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Setup SSL with Let's Encrypt**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

---

## 📊 **POST-DEPLOYMENT STEPS**

### **1. Verify Deployment**
- [ ] Visit your production URL
- [ ] Test user registration
- [ ] Test user login
- [ ] Test creating transactions
- [ ] Test AI categorization
- [ ] Test email notifications
- [ ] Check Sentry for errors

### **2. Database Setup**
- [ ] Verify Supabase connection
- [ ] Check RLS policies are enabled
- [ ] Verify all tables exist
- [ ] Test database queries

### **3. Monitoring Setup**
- [ ] Verify Sentry is receiving errors
- [ ] Check Upstash Redis is working
- [ ] Monitor application logs
- [ ] Set up uptime monitoring (optional)

### **4. Performance Optimization**
- [ ] Enable caching
- [ ] Optimize images
- [ ] Enable compression
- [ ] Configure CDN

### **5. Security**
- [ ] Enable HTTPS
- [ ] Configure CORS
- [ ] Enable rate limiting
- [ ] Set up security headers

---

## 🐛 **TROUBLESHOOTING**

### **Build Errors**

#### **"Module not found"**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

#### **TypeScript errors**
```bash
# Check for type errors
npm run type-check
```

### **Runtime Errors**

#### **Database connection failed**
- Verify Supabase URL and keys
- Check RLS policies
- Verify network connectivity

#### **Authentication not working**
- Verify NEXTAUTH_URL matches your domain
- Check NEXTAUTH_SECRET is set
- Verify Supabase auth is enabled

#### **AI features not working**
- Verify MISTRAL_API_KEY is set
- Check API quota/limits
- Verify model name is correct

### **Performance Issues**

#### **Slow page loads**
- Enable caching
- Optimize images
- Use CDN
- Check database queries

#### **High memory usage**
- Increase server resources
- Optimize bundle size
- Enable code splitting

---

## 📚 **ADDITIONAL RESOURCES**

### **Documentation**
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Sentry Documentation](https://docs.sentry.io)

### **Support**
- GitHub Issues: [Your Repository Issues]
- Email: support@phpinancia.com
- Documentation: `/mds` folder

---

## ✅ **DEPLOYMENT CHECKLIST**

### **Pre-Deployment**
- [ ] All tests passing
- [ ] Build successful
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security checklist complete

### **Deployment**
- [ ] Platform selected
- [ ] Repository connected
- [ ] Environment variables added
- [ ] Build settings configured
- [ ] Deployed successfully

### **Post-Deployment**
- [ ] Application accessible
- [ ] All features working
- [ ] Monitoring enabled
- [ ] Performance optimized
- [ ] Security configured

---

**Deployment Status:** Ready for Production 🚀  
**Last Updated:** January 2025  
**Version:** 1.0.0

