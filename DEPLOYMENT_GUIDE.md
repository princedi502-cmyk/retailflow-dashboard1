# RetailFlow Deployment Guide

## 🚀 Quick Start for Production Deployment

### Prerequisites
- Docker and Docker Compose installed
- MongoDB Atlas account (free tier)
- Domain name (optional but recommended)

### Step 1: Setup MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (M0 Sandbox is free)
4. Create a database user with strong password
5. Get your connection string
6. Add your IP address to whitelist

### Step 2: Configure Environment Variables

#### Backend Environment
```bash
# Copy the production environment file
cp retail-backend/.env.production retail-backend/.env

# Edit the file with your actual values:
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/retail_flow?retryWrites=true&w=majority
SECRET_KEY=generate-a-32-character-random-string-here
ALLOWED_ORIGINS=https://yourdomain.vercel.app,https://yourdomain.netlify.app
```

#### Frontend Environment
```bash
# Copy the production environment file
cp .env.production .env.production.local

# Edit with your API URL:
REACT_APP_API_URL=https://your-api-domain.com
```

### Step 3: Generate Secure Secret Key
```bash
# Generate a secure random key
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 4: Setup Database Indexes
```bash
cd retail-backend
python app/db_indexes.py
```

### Step 5: Deploy to Cloud Platform

#### Option 1: Render (Recommended for Free Tier)
1. Connect your GitHub repository to Render
2. Create two services:
   - **Web Service** (Backend): Point to `retail-backend/Dockerfile`
   - **Static Site** (Frontend): Point to `dist` folder after build

#### Option 2: Railway
1. Connect GitHub repository
2. Create `railway.toml` file
3. Deploy with automatic Docker detection

#### Option 3: Vercel + Render
1. **Frontend**: Deploy to Vercel (connect GitHub)
2. **Backend**: Deploy to Render (Docker)

### Step 6: Domain Configuration (Optional)
1. Point your domain to the hosting platform
2. Update CORS origins in backend environment
3. Configure SSL certificates (usually automatic)

## 📋 Deployment Checklist

### Security ✅
- [ ] Generated strong JWT secret key
- [ ] Updated CORS origins for production domain
- [ ] Enabled HTTPS (automatic on most platforms)
- [ ] Set DEBUG=False
- [ ] Configured rate limiting

### Performance ✅
- [ ] Created database indexes
- [ ] Enabled gzip compression
- [ ] Set up caching headers
- [ ] Optimized frontend build

### Monitoring ✅
- [ ] Health check endpoint configured
- [ ] Error logging in place
- [ ] Performance monitoring setup

### Backup ✅
- [ ] MongoDB Atlas automatic backups enabled
- [ ] Code repository backed up on GitHub

## 🔧 Environment Files

### Development (.env)
```env
MONGO_URL=mongodb://localhost:27017
DATABASE_NAME=retail_flow
SECRET_KEY=dev-secret-key-not-for-production
DEBUG=True
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Production (.env.production)
```env
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/retail_flow
DATABASE_NAME=retail_flow
SECRET_KEY=super-secure-random-32-char-key
DEBUG=False
ALLOWED_ORIGINS=https://yourdomain.com
RATE_LIMIT_PER_MINUTE=60
LOG_LEVEL=INFO
```

## 🐳 Docker Commands

### Local Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Build
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Performance Optimization

### Database
- Indexes created for all frequent queries
- Connection pooling enabled
- Read replicas for scaling (paid tier)

### Frontend
- Code splitting implemented
- Gzip compression enabled
- Static asset caching
- Bundle size optimization

### Backend
- Rate limiting enabled
- Request validation
- Efficient MongoDB queries
- Memory optimization

## 🔍 Monitoring & Debugging

### Health Checks
- Backend: `GET /health`
- Database connection status
- Service availability

### Logging
- Structured JSON logs
- Error tracking
- Performance metrics
- User activity logs

### Analytics
- User count tracking
- Performance metrics
- Error rates
- Usage patterns

## 🚨 Troubleshooting

### Common Issues

#### CORS Errors
- Update ALLOWED_ORIGINS in backend environment
- Clear browser cache
- Check API URL in frontend

#### Database Connection
- Verify MongoDB Atlas connection string
- Check IP whitelist
- Ensure database user has correct permissions

#### Build Failures
- Check environment variables
- Verify all dependencies installed
- Check for syntax errors

#### Performance Issues
- Monitor database query performance
- Check for missing indexes
- Review API response times

## 📞 Support Resources

### Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/)
- [MongoDB Atlas Docs](https://docs.mongodb.com/atlas/)

### Community
- GitHub Issues for bug reports
- Stack Overflow for technical questions
- Discord communities for real-time help

---

**Deployment Time**: 30-60 minutes  
**Cost**: $0/month (free tier)  
**Scaling**: Up to 1000 users with optimizations  
**Maintenance**: Minimal with automated backups
