# Spenza Webhook Backend

A production-ready NestJS-based webhook management system that allows users to subscribe to webhooks and handle incoming webhook events with authentication, retry mechanisms, and real-time event processing.

## ✨ Features

- **🔐 JWT Authentication**: Secure user registration and login system
- **🪝 Webhook Subscription Management**: Create, list, view, and cancel webhook subscriptions
- **📡 Webhook Event Handling**: Process incoming webhook events with validation and forwarding
- **🔄 Retry Mechanism**: Automatic retry for failed webhook deliveries (max 3 attempts)
- **🗄️ Database**: PostgreSQL with Prisma ORM (supports local and cloud databases)
- **🚀 Production Ready**: Railway deployment with Docker, health checks, and migrations
- **🛠️ Free Plan Support**: HTTP-based migrations for platforms without console access
- **📊 Monitoring**: Built-in debug endpoints and migration status tracking

## 🛠️ Tech Stack

- **Backend**: NestJS (Node.js 20)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **HTTP Client**: Axios for webhook forwarding
- **Scheduling**: @nestjs/schedule for retry mechanism
- **Validation**: class-validator and class-transformer
- **Deployment**: Docker + Railway (production ready)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL (local) or Railway/Neon account (cloud)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd spenza/sp-webhook-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
# For local PostgreSQL
npx prisma migrate dev --name init

# For production deployment
npx prisma migrate deploy
npx prisma generate
```

5. Start the development server:
```bash
npm run start:dev
```

## ⚙️ Environment Variables

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/spenza_webhook?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGINS="http://localhost:5173,http://localhost:3000,https://your-frontend-domain.com"

# Webhook Configuration
WEBHOOK_BASE_URL="https://your-backend-domain.com"
```

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login

### Webhook Management
- `POST /webhooks/subscribe` - Create webhook subscription (protected)
- `GET /webhooks` - List user's webhook subscriptions (protected)
- `GET /webhooks/:id` - Get webhook subscription details (protected)
- `POST /webhooks/:id/cancel` - Cancel webhook subscription (protected)
- `DELETE /webhooks/:id` - Delete webhook subscription (protected)

### Webhook Events
- `POST /webhook-events/:subscriptionId` - Handle incoming webhook events

### System & Debug
- `GET /health` - Application health check
- `GET /debug` - Environment variable status (debug mode)
- `POST /migrate/deploy` - Run database migrations
- `GET /migrate/status` - Check migration status

## 🗄️ Database Schema

### Users
- `id` (string, primary key)
- `email` (string, unique)
- `password` (string, hashed)
- `createdAt`, `updatedAt`

### Webhook Subscriptions
- `id` (string, primary key)
- `sourceUrl` (string)
- `callbackUrl` (string)
- `secret` (string, optional)
- `isActive` (boolean)
- `userId` (foreign key)
- `createdAt`, `updatedAt`

### Webhook Events
- `id` (string, primary key)
- `subscriptionId` (foreign key)
- `eventType` (string)
- `payload` (JSON)
- `headers` (JSON, optional)
- `processed` (boolean)
- `processingError` (string, optional)
- `retryCount` (integer)
- `createdAt`, `processedAt`

## 🔄 Retry Mechanism

The system automatically retries failed webhook deliveries:
- **Max attempts**: 3 retries per event
- **Schedule**: Every minute
- **Backoff**: Linear delay between retries
- **Failure handling**: Events marked as failed after max attempts
- **Graceful degradation**: Service continues even if database tables don't exist

## 🚀 Deployment

### Railway (Recommended)

1. **Prepare Repository**:
   ```bash
   # Ensure all files are committed
   git add .
   git commit -m "Ready for Railway deployment"
   git push origin main
   ```

2. **Railway Setup**:
   - Connect your GitHub repository to Railway
   - Railway will automatically detect the Dockerfile
   - Set environment variables in Railway dashboard

3. **Required Environment Variables**:
   ```bash
   DATABASE_URL=postgresql://postgres:password@host.railway.app:5432/railway
   JWT_SECRET=your-strong-jwt-secret-key-min-32-chars
   NODE_ENV=production
   PORT=8080
   CORS_ORIGINS=https://your-frontend-domain.vercel.app
   ```

4. **Run Migrations** (Free Plan):
   ```bash
   # Deploy first, then run migrations via HTTP
   curl -X POST https://your-app.railway.app/migrate/deploy
   
   # Check migration status
   curl https://your-app.railway.app/migrate/status
   ```

### Local Development
```bash
npm run start:dev
```

### Production Build
```bash
npm run build
npm run start:prod
```

## 🐳 Docker Configuration

The application includes a production-ready multi-stage Dockerfile:

- **Base stage**: Node.js 20 Alpine
- **Deps stage**: Dependency installation
- **Builder stage**: Application build and Prisma generation
- **Runner stage**: Production image with non-root user
- **Health checks**: Built-in health monitoring
- **Migrations**: Automatic database schema setup

## 🔒 Security Features

- JWT-based authentication with configurable expiration
- Password hashing with bcrypt (10 rounds)
- Webhook signature verification support
- Input validation and sanitization
- CORS configuration with origin whitelisting
- Non-root Docker user for production
- Environment variable protection

## 📊 Monitoring & Debugging

### Health Checks
```bash
curl https://your-app.railway.app/health
```

### Debug Information
```bash
curl https://your-app.railway.app/debug
```

### Migration Status
```bash
curl https://your-app.railway.app/migrate/status
```

### Logging
- Structured logging with NestJS Logger
- Webhook event tracking and retry logging
- Database connection status monitoring
- Error tracking and reporting

## 🛠️ Troubleshooting

### Common Issues

#### **Application Won't Start (502 Error)**
- Check environment variables are set correctly
- Verify DATABASE_URL format
- Check Railway logs for specific errors

#### **Database Table Missing Errors**
```bash
# Run migrations manually
curl -X POST https://your-app.railway.app/migrate/deploy

# Check migration status
curl https://your-app.railway.app/migrate/status
```

#### **CORS Issues**
- Update CORS_ORIGINS environment variable
- Include all frontend domains
- Check preflight requests

#### **Webhook Delivery Failures**
- Verify callback URL is accessible
- Check webhook retry logs
- Test with webhook testing services

## 🌐 Production URLs

### Example Deployment
- **Backend**: `https://sp-webhook-backend-production.up.railway.app`
- **Frontend**: `https://sp-webhook-frontend.vercel.app`

### API Testing Examples
```bash
# Health check
curl https://sp-webhook-backend-production.up.railway.app/health

# User registration
curl -X POST https://sp-webhook-backend-production.up.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create webhook
curl -X POST https://sp-webhook-backend-production.up.railway.app/webhooks/subscribe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "sourceUrl": "https://api.example.com/events",
    "callbackUrl": "https://your-frontend-domain.com/webhook",
    "secret": "your-webhook-secret"
  }'
```

## 📝 Development Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debug mode

# Building
npm run build              # Build for production
npm run start:prod         # Start production build

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run end-to-end tests
npm run test:watch         # Run tests in watch mode

# Database
npm run prisma:studio      # Open Prisma Studio
npm run prisma:migrate     # Run migrations
npm run prisma:generate    # Generate Prisma client
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

---

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Health check endpoint accessible
- [ ] CORS origins configured
- [ ] JWT secret is strong (32+ chars)
- [ ] Webhook callback URLs are accessible
- [ ] Railway deployment successful
- [ ] Frontend integration tested
- [ ] Error monitoring configured
- [ ] Backup strategy in place

**🚀 Your webhook backend is production-ready!**
