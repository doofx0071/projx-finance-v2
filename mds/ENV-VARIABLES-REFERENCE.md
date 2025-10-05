# Environment Variables Reference

**Quick reference for all environment variables used in PHPinancia**

---

## 🔴 **REQUIRED VARIABLES**

### **Database**
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGci...` |

### **Redis**
| Variable | Description | Example |
|----------|-------------|---------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | `ATxvAAInc...` |

### **Authentication**
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_URL` | Application URL | `https://your-domain.com` |
| `NEXTAUTH_SECRET` | NextAuth secret (32+ chars) | `926bd794bde...` |
| `JWT_SECRET` | JWT secret (32+ chars) | `335c4a2797...` |

### **AI Features**
| Variable | Description | Example |
|----------|-------------|---------|
| `MISTRAL_API_KEY` | Mistral AI API key | `sZ4mlXN9AA...` |
| `MISTRAL_MODEL` | Mistral model name | `mistral-small-2503` |

### **Email**
| Variable | Description | Example |
|----------|-------------|---------|
| `MAILGUN_API_KEY` | Mailgun API key | `271f8273296...` |
| `MAILGUN_DOMAIN` | Mailgun domain | `phinancia.do-mails.space` |

---

## 🟡 **RECOMMENDED VARIABLES**

### **Error Monitoring**
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN (public) | `https://xxx@sentry.io/xxx` |
| `SENTRY_DSN` | Sentry DSN (server) | `https://xxx@sentry.io/xxx` |
| `SENTRY_ORG` | Sentry organization | `phpinancia` |
| `SENTRY_PROJECT` | Sentry project | `phpinancia` |
| `SENTRY_AUTH_TOKEN` | Sentry auth token | `sntrys_xxx` |

### **App Configuration**
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_NAME` | Application name | `PHPinancia` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `https://your-domain.com` |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | Default currency | `PHP` |
| `NEXT_PUBLIC_DATE_FORMAT` | Date format | `DD/MM/YYYY` |

### **Environment Settings**
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_DEBUG` | Enable debug mode | `false` (production) |
| `LOG_LEVEL` | Logging level | `error` (production) |
| `NODE_ENV` | Node environment | `production` |

---

## 🟢 **OPTIONAL VARIABLES**

### **Analytics**
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_GA_TRACKING_ID` | Google Analytics ID | `G-XXXXXXXXXX` |

### **Feature Flags**
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_ENABLE_AI_CATEGORIZATION` | Enable AI categorization | `true` |
| `NEXT_PUBLIC_ENABLE_RECEIPT_UPLOAD` | Enable receipt uploads | `true` |
| `NEXT_PUBLIC_ENABLE_BUDGET_TRACKING` | Enable budget tracking | `true` |
| `NEXT_PUBLIC_ENABLE_REPORTS` | Enable reports | `true` |
| `NEXT_PUBLIC_ENABLE_MULTICURRENCY` | Enable multi-currency | `false` |

### **Security**
| Variable | Description | Example |
|----------|-------------|---------|
| `CSRF_SECRET` | CSRF protection secret | `your_csrf_secret` |
| `ENCRYPTION_KEY` | Encryption key (32 chars) | `your_encryption_key` |

### **Payment Processing (Stripe)**
| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_xxx` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_xxx` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_xxx` |

### **File Storage (Cloudinary)**
| Variable | Description | Example |
|----------|-------------|---------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your_api_secret` |

### **File Storage (AWS S3)**
| Variable | Description | Example |
|----------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS access key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key | `wJalrXUtnFEMI/K7MDENG/...` |
| `AWS_S3_BUCKET_NAME` | S3 bucket name | `phpinancia-uploads` |
| `AWS_REGION` | AWS region | `us-east-1` |

### **Bank Connections (Plaid)**
| Variable | Description | Example |
|----------|-------------|---------|
| `PLAID_CLIENT_ID` | Plaid client ID | `your_client_id` |
| `PLAID_SECRET` | Plaid secret | `your_plaid_secret` |
| `PLAID_ENV` | Plaid environment | `production` |

---

## 📋 **ENVIRONMENT-SPECIFIC VALUES**

### **Development (.env.local)**
```bash
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEBUG=true
LOG_LEVEL=info
NODE_ENV=development
```

### **Production (.env.production)**
```bash
NEXTAUTH_URL=https://your-production-domain.com
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
NEXT_PUBLIC_DEBUG=false
LOG_LEVEL=error
NODE_ENV=production
```

---

## 🔒 **SECURITY BEST PRACTICES**

### **DO**
✅ Use environment variables for all secrets  
✅ Generate strong secrets (32+ characters)  
✅ Use different secrets for dev/prod  
✅ Rotate secrets regularly  
✅ Use `.env.local` for local development  
✅ Use platform environment variables for production  

### **DON'T**
❌ Commit `.env.local` or `.env.production` to Git  
❌ Share secrets in code or documentation  
❌ Use weak or predictable secrets  
❌ Reuse secrets across environments  
❌ Store secrets in client-side code  

---

## 🛠️ **GENERATING SECRETS**

### **Generate Random Secret (32 characters)**
```bash
# Using OpenSSL
openssl rand -hex 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using Python
python -c "import secrets; print(secrets.token_hex(32))"
```

### **Generate NEXTAUTH_SECRET**
```bash
openssl rand -base64 32
```

---

## 📚 **PLATFORM-SPECIFIC SETUP**

### **Vercel**
1. Go to Project Settings → Environment Variables
2. Add variables one by one
3. Select environment (Production, Preview, Development)
4. Save and redeploy

### **Netlify**
1. Go to Site Settings → Environment Variables
2. Add variables
3. Redeploy site

### **Railway**
1. Go to Variables tab
2. Add variables
3. Railway auto-redeploys

### **Self-Hosted**
1. Create `.env.production` file
2. Add all variables
3. Restart application

---

## ✅ **VERIFICATION CHECKLIST**

### **Before Deployment**
- [ ] All required variables set
- [ ] Secrets are strong (32+ characters)
- [ ] URLs match your domain
- [ ] Debug mode disabled in production
- [ ] Log level set to `error` in production
- [ ] Feature flags configured
- [ ] API keys valid and active

### **After Deployment**
- [ ] Application loads successfully
- [ ] Database connection works
- [ ] Authentication works
- [ ] Email notifications work
- [ ] AI features work
- [ ] Error monitoring active
- [ ] No secrets exposed in client code

---

## 🆘 **TROUBLESHOOTING**

### **"Environment variable not found"**
- Check variable name spelling
- Verify variable is set in platform
- Restart application after adding variables

### **"Invalid API key"**
- Verify key is correct
- Check key hasn't expired
- Verify key has correct permissions

### **"Database connection failed"**
- Verify Supabase URL and keys
- Check network connectivity
- Verify RLS policies

---

**Last Updated:** January 2025  
**Version:** 1.0.0

