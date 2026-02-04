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

### **4. Database Setup**
Railway automatically provides PostgreSQL:
1. Go to your project in Railway
2. Click on the PostgreSQL service
3. Copy the `DATABASE_URL` from the "Connect" tab
4. Add it to your environment variables

### **5. Run Database Migrations**
Since Railway uses Docker, migrations need to be handled:

#### **Option A: Add Migration Script**
Add to `package.json`:
```json
{
  "scripts": {
    "migrate:deploy": "npx prisma migrate deploy",
    "migrate:generate": "npx prisma generate"
  }
}
```

#### **Option B: Update Dockerfile**
Add migration step to Dockerfile:
```dockerfile
# After copying files
RUN npx prisma migrate deploy
RUN npx prisma generate
```

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
