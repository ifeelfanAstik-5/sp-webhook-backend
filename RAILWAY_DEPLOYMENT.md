# Railway Deployment Guide

## 🚀 Deploy Spenza Webhook Backend to Railway

### **Prerequisites**
- Railway account (https://railway.app)
- GitHub repository with the backend code
- PostgreSQL database (Railway provides this)

---

## 📋 **Step-by-Step Deployment**

### **1. Prepare Your Repository**
Ensure your repository contains:
- ✅ `Dockerfile` (multi-stage build)
- ✅ `railway.json` (Railway configuration)
- ✅ `.env.example` (environment variables template)
- ✅ `package.json` (with build scripts)

### **2. Connect GitHub to Railway**
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your backend repository
5. Click **"Deploy Now"**

### **3. Configure Environment Variables**
In Railway dashboard, set these environment variables:

#### **Required Variables:**
```bash
# Database (Railway provides this automatically)
DATABASE_URL=postgresql://postgres:password@host:port/database

# JWT Secret (generate a strong one)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# Server Configuration
NODE_ENV=production
PORT=3000

# CORS Origins (comma-separated)
CORS_ORIGINS=https://your-frontend-domain.railway.app

# Webhook Base URL
WEBHOOK_BASE_URL=https://your-backend-domain.railway.app
```

#### **Optional Variables:**
```bash
# Railway-specific (auto-set)
RAILWAY_ENVIRONMENT=production
RAILWAY_PROJECT_NAME=your-project-name
RAILWAY_SERVICE_NAME=your-service-name
```

### **4. Database Setup & Migrations**
Railway automatically provides PostgreSQL:
1. Go to your project in Railway
2. Click on the PostgreSQL service
3. Copy the `DATABASE_URL` from the "Connect" tab
4. Add it to your environment variables

#### **IMPORTANT: Run Database Migrations**
The application requires database migrations to create the necessary tables:

**Option A: Automatic via Docker (Recommended)**
- The Dockerfile now includes `npx prisma migrate deploy`
- Migrations will run automatically when the container starts

**Option B: Manual via Railway Console**
1. Go to your service in Railway
2. Click "Console" tab
3. Run: `npx prisma migrate deploy`
4. Restart your service

**Option C: One-time Setup**
If you prefer to run migrations once:
1. Set up a temporary deployment
2. Run migrations manually
3. Remove migration command from Dockerfile for subsequent deployments

### **6. Health Check**
Railway will automatically use the health check:
- **Endpoint**: `/health`
- **Timeout**: 10 seconds
- **Retries**: 3 attempts

### **7. Deployment Process**
Railway will:
1. Build the Docker image
2. Start the container
3. Run health checks
4. Assign a public URL
5. Monitor the service

---

## 🔧 **Configuration Files**

### **railway.json**
```json
{
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 10000,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### **Dockerfile Features**
- ✅ Multi-stage build (smaller image size)
- ✅ Non-root user (security)
- ✅ Health checks
- ✅ Proper permissions
- ✅ Production optimizations

---

## 🌐 **Post-Deployment**

### **1. Test the Deployment**
```bash
# Health check
curl https://your-domain.railway.app/health

# Test API
curl https://your-domain.railway.app/
```

### **2. Update Frontend Configuration**
Update your frontend to use the Railway URL:
```env
VITE_API_URL=https://your-backend-domain.railway.app
```

### **3. Webhook Configuration**
For external services, use:
```
https://your-backend-domain.railway.app/webhook-events/{subscription-id}
```

---

## 📊 **Monitoring & Logs**

### **View Logs**
1. Go to Railway dashboard
2. Click on your service
3. View real-time logs

### **Monitoring**
- Railway provides basic monitoring
- Health check status
- Resource usage
- Error tracking

---

## 🔄 **CI/CD Pipeline**

### **Automatic Deployments**
Railway automatically deploys when:
- New commits are pushed to main branch
- Environment variables are changed
- Configuration is updated

### **Manual Deployments**
1. Go to Railway dashboard
2. Click on your service
3. Click **"Redeploy"**

---

## 🛠️ **Troubleshooting**

### **Common Issues:**

#### **1. Build Failures**
- Check Dockerfile syntax
- Verify package.json scripts
- Ensure all dependencies are installed

#### **2. Database Connection**
- Verify DATABASE_URL format
- Check if migrations ran
- Ensure PostgreSQL service is running

#### **4. Database Table Missing Errors**
If you see errors like:
```
The table `public.webhook_events` does not exist in the current database.
```

**Solution:**
1. **Run migrations manually** via Railway Console:
   ```bash
   npx prisma migrate deploy
   ```
2. **Restart the service** after migrations
3. **Check migration status**:
   ```bash
   npx prisma migrate status
   ```

**Root Cause:** The WebhookRetryService runs every minute and expects the `webhook_events` table to exist. If migrations haven't run, this error will appear repeatedly.

#### **3. Health Check Failures**
- Verify `/health` endpoint exists
- Check if port 3000 is exposed
- Review application logs

#### **4. CORS Issues**
- Update CORS_ORIGINS environment variable
- Include all frontend domains
- Check preflight requests

### **Debug Commands**
```bash
# Check health
curl -v https://your-domain.railway.app/health

# Test authentication
curl -X POST https://your-domain.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🎯 **Production Best Practices**

### **Security**
- ✅ Use strong JWT secrets
- ✅ Enable HTTPS (Railway provides)
- ✅ Set proper CORS origins
- ✅ Use environment variables for secrets

### **Performance**
- ✅ Multi-stage Docker builds
- ✅ Non-root user
- ✅ Health checks enabled
- ✅ Proper error handling

### **Reliability**
- ✅ Automatic restarts on failure
- ✅ Health monitoring
- ✅ Database migrations
- ✅ Environment-specific configs

---

## 📞 **Support**

- **Railway Documentation**: https://docs.railway.app
- **NestJS Deployment**: https://docs.nestjs.com/deployment
- **Prisma on Railway**: https://docs.railway.app/guides/deploy-prisma

---

**Your backend is now ready for Railway deployment!** 🚀
