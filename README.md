# Spenza Webhook Backend

A NestJS-based webhook management system that allows users to subscribe to webhooks and handle incoming webhook events with authentication, retry mechanisms, and real-time event processing.

## Features

- **JWT Authentication**: Secure user registration and login system
- **Webhook Subscription Management**: Create, list, view, and cancel webhook subscriptions
- **Webhook Event Handling**: Process incoming webhook events with validation and forwarding
- **Retry Mechanism**: Automatic retry for failed webhook deliveries (max 3 attempts)
- **Database**: PostgreSQL with Prisma ORM (supports local and Neon cloud database)
- **Webhook Simulator**: Built-in script to test webhook functionality

## Tech Stack

- **Backend**: NestJS (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **HTTP Client**: Axios for webhook forwarding
- **Scheduling**: @nestjs/schedule for retry mechanism
- **Validation**: class-validator and class-transformer

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL (local) or Neon account (cloud)
- Firebase account (for authentication integration)

### Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd packages/backend
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

# Or for Neon, update DATABASE_URL in .env and run:
npx prisma migrate deploy
npx prisma generate
```

5. Start the development server:
```bash
npm run start:dev
```

## Environment Variables

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/spenza_webhook?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_PATH="./firebase/service-account.json"

# Server Configuration
PORT=3000
NODE_ENV=development
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile (protected)

### Webhook Management

- `POST /webhooks/subscribe` - Create webhook subscription (protected)
- `GET /webhooks` - List user's webhook subscriptions (protected)
- `GET /webhooks/:id` - Get webhook subscription details (protected)
- `POST /webhooks/:id/cancel` - Cancel webhook subscription (protected)
- `DELETE /webhooks/:id` - Delete webhook subscription (protected)

### Webhook Events

- `POST /webhook-events/:subscriptionId` - Handle incoming webhook events

## Webhook Simulator

Test your webhook endpoints using the built-in simulator:

```bash
# Send a single event
npm run simulate <subscription-id> user.created

# Send multiple events
npm run simulate <subscription-id> 5

# Examples
npm run simulate abc-123 payment.completed
npm run simulate abc-123 3
```

Available event types:
- `user.created`
- `payment.completed`
- `order.shipped`
- `subscription.renewed`

## Database Schema

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

## Retry Mechanism

The system automatically retries failed webhook deliveries:
- **Max attempts**: 3 retries per event
- **Schedule**: Every minute (configurable)
- **Backoff**: Linear delay between retries
- **Failure handling**: Events marked as failed after max attempts

## Deployment

### Local Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Environment Setup

1. **Local PostgreSQL**:
   ```bash
   # Install PostgreSQL
   # Create database
   createdb spenza_webhook
   
   # Update .env with local database URL
   DATABASE_URL="postgresql://username:password@localhost:5432/spenza_webhook?schema=public"
   ```

2. **Neon (Cloud PostgreSQL)**:
   ```bash
   # Create Neon account and database
   # Update .env with Neon database URL
   DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/spenza_webhook?sslmode=require"
   
   # Deploy migrations
   npx prisma migrate deploy
   ```

## Security Features

- JWT-based authentication with configurable expiration
- Password hashing with bcrypt
- Webhook signature verification (optional)
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## Monitoring and Logging

- Structured logging with NestJS Logger
- Webhook event tracking
- Error monitoring and retry logging
- Request/response logging for debugging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
