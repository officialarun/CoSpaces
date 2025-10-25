# Deployment Guide - Fractional Land SPV Platform

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Docker Deployment](#docker-deployment)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [SSL/TLS Configuration](#ssltls-configuration)
7. [Monitoring Setup](#monitoring-setup)
8. [Backup & Recovery](#backup--recovery)
9. [Security Checklist](#security-checklist)
10. [Scaling](#scaling)

## Prerequisites

### System Requirements

- **OS**: Ubuntu 20.04 LTS or later / CentOS 8+ / RHEL 8+
- **CPU**: 4+ cores (8+ recommended for production)
- **RAM**: 8GB minimum (16GB+ recommended)
- **Storage**: 100GB+ SSD
- **Network**: Static IP with ports 80, 443, 27017 accessible

### Software Requirements

- Docker 20.10+
- Docker Compose 2.0+
- Kubernetes 1.24+ (for K8s deployment)
- kubectl CLI
- MongoDB 6.0+
- Node.js 18+ (for non-Docker builds)
- Nginx (reverse proxy)

## Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd CoSpaces
```

### 2. Environment Variables

#### Backend Environment

Create `packages/backend/.env`:

```bash
# Server
NODE_ENV=production
PORT=5000
API_VERSION=v1

# Database
MONGODB_URI=mongodb://mongo:27017/fractional-land-spv

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-min-32-chars
JWT_REFRESH_EXPIRE=30d

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key-here

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Email (SendGrid)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your-sendgrid-api-key

# SMS (Twilio)
SMS_PROVIDER=twilio
SMS_API_KEY=your-twilio-account-sid
SMS_API_SECRET=your-twilio-auth-token

# KYC Provider
KYC_PROVIDER_URL=https://api.kycprovider.com
KYC_API_KEY=your-kyc-api-key

# eSign Provider
ESIGN_PROVIDER_URL=https://api.esignprovider.com
ESIGN_API_KEY=your-esign-api-key

# Payment Gateway
PAYMENT_GATEWAY_URL=https://api.paymentgateway.com
PAYMENT_GATEWAY_KEY=your-payment-key
PAYMENT_GATEWAY_SECRET=your-payment-secret

# Escrow Bank
ESCROW_BANK_URL=https://api.escrowbank.com
ESCROW_BANK_KEY=your-escrow-key
ESCROW_MODE=production

# AML Provider
AML_PROVIDER_URL=https://api.amlprovider.com
AML_API_KEY=your-aml-api-key

# S3 Storage
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=fractional-land-docs-prod
S3_ACCESS_KEY=your-s3-access-key
S3_SECRET_KEY=your-s3-secret-key
S3_REGION=ap-south-1

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Compliance
MAX_INVESTORS_PER_SPV=200
MIN_ACCREDITED_INVESTOR_THRESHOLD=5000000
PRIVATE_PLACEMENT_RESTRICTION_DAYS=180

# Platform Fees (basis points)
PLATFORM_ACQUISITION_FEE=200
PLATFORM_MAINTENANCE_FEE=100
PLATFORM_CARRIED_INTEREST=2000
```

#### Frontend Environment

Create `packages/frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_APP_NAME=Fractional Land SPV Platform
NEXT_PUBLIC_APP_DESCRIPTION=Invest in fractional land ownership through SPVs
```

### 3. Generate Secrets

```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Setup

### MongoDB Production Setup

#### 1. Install MongoDB

```bash
# Ubuntu
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
```

#### 2. Configure MongoDB

Edit `/etc/mongod.conf`:

```yaml
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1

security:
  authorization: enabled

replication:
  replSetName: rs0
```

#### 3. Create Admin User

```bash
mongosh

use admin
db.createUser({
  user: "admin",
  pwd: "your-secure-password",
  roles: [ { role: "root", db: "admin" } ]
})

use fractional-land-spv
db.createUser({
  user: "appuser",
  pwd: "your-app-password",
  roles: [ { role: "readWrite", db: "fractional-land-spv" } ]
})
```

#### 4. Initialize Replica Set

```bash
mongosh

rs.initiate()
```

#### 5. Backup Setup

```bash
# Create backup script
cat > /usr/local/bin/mongodb-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
mongodump --uri="mongodb://localhost:27017/fractional-land-spv" --out=$BACKUP_DIR/$DATE
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
EOF

chmod +x /usr/local/bin/mongodb-backup.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /usr/local/bin/mongodb-backup.sh" | crontab -
```

## Docker Deployment

### 1. Create docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: fractional-land-mongodb
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    ports:
      - "27017:27017"
    networks:
      - app-network

  backend:
    build:
      context: ./packages/backend
      dockerfile: Dockerfile
    container_name: fractional-land-backend
    restart: always
    ports:
      - "5000:5000"
    env_file:
      - ./packages/backend/.env
    depends_on:
      - mongodb
    networks:
      - app-network
    volumes:
      - backend_logs:/app/logs

  frontend:
    build:
      context: ./packages/frontend
      dockerfile: Dockerfile
    container_name: fractional-land-frontend
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - ./packages/frontend/.env.local
    depends_on:
      - backend
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    container_name: fractional-land-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - app-network

volumes:
  mongodb_data:
  mongodb_config:
  backend_logs:

networks:
  app-network:
    driver: bridge
```

### 2. Create Dockerfiles

#### Backend Dockerfile

`packages/backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p logs

EXPOSE 5000

CMD ["node", "src/server.js"]
```

#### Frontend Dockerfile

`packages/frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
```

### 3. Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:5000;
    }

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location /api/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 4. Deploy

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Stop
docker-compose down
```

## Kubernetes Deployment

### 1. Create Kubernetes Manifests

#### Namespace

`k8s/namespace.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: fractional-land
```

#### MongoDB StatefulSet

`k8s/mongodb-statefulset.yaml`:

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongodb
  namespace: fractional-land
spec:
  serviceName: mongodb
  replicas: 3
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:6
        ports:
        - containerPort: 27017
        volumeMounts:
        - name: data
          mountPath: /data/db
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: username
        - name: MONGO_INITDB_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: password
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 100Gi
```

#### Backend Deployment

`k8s/backend-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: fractional-land
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-registry/fractional-land-backend:latest
        ports:
        - containerPort: 5000
        envFrom:
        - configMapRef:
            name: backend-config
        - secretRef:
            name: backend-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 2. Apply Manifests

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/mongodb-statefulset.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

## SSL/TLS Configuration

### Using Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Monitoring Setup

### Prometheus & Grafana

```bash
# Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace

# Access Grafana
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
# Default: admin/prom-operator
```

## Backup & Recovery

### Automated Backups

```bash
# MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="/backups/mongodb/$DATE"
aws s3 sync /backups/mongodb/$DATE s3://your-bucket/backups/mongodb/$DATE
```

### Recovery

```bash
# Restore from backup
mongorestore --uri="$MONGODB_URI" /backups/mongodb/20240101_020000
```

## Security Checklist

- [ ] Changed all default passwords
- [ ] Generated secure JWT secrets
- [ ] Configured firewall rules
- [ ] Enabled MongoDB authentication
- [ ] SSL/TLS certificates installed
- [ ] Rate limiting configured
- [ ] Backup system tested
- [ ] Log rotation configured
- [ ] Security headers enabled
- [ ] CORS properly configured
- [ ] API rate limiting active
- [ ] Database encrypted at rest
- [ ] Secrets stored in vault
- [ ] Regular security audits scheduled

## Scaling

### Horizontal Scaling

```bash
# Scale backend
kubectl scale deployment backend --replicas=5 -n fractional-land

# Auto-scaling
kubectl autoscale deployment backend --cpu-percent=70 --min=3 --max=10 -n fractional-land
```

### Database Scaling

- Use MongoDB sharding for large datasets
- Read replicas for read-heavy workloads
- Connection pooling optimization

---

For support, contact: devops@fractionalland.com

