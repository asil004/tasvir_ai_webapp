# Setup Guide - AI Image Generator WebApp

## Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
cd webapp
npm install
```

### Step 2: Configure Environment

Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_BOT_USERNAME=your_bot_username
```

### Step 3: Start Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

### Step 4: Configure Your FastAPI Backend

Make sure your FastAPI backend is running on port 8000 with CORS enabled:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Telegram Bot Integration

### 1. Create WebApp URL

In BotFather, set your webapp URL:
```
/newapp
# Choose your bot
# Enter webapp name
# Enter webapp URL: https://your-domain.com
```

### 2. Set Menu Button (Optional)

```
/setmenubutton
# Choose your bot
# Send webapp URL
```

### 3. Test in Telegram

Open your bot and click the WebApp button to test.

## Production Deployment

### Option 1: Vercel (Easiest)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_API_BASE_URL`
   - `NEXT_PUBLIC_BOT_USERNAME`
5. Deploy!

### Option 2: VPS/Server

1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

3. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start npm --name "webapp" -- start
pm2 save
pm2 startup
```

4. Configure Nginx reverse proxy:
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

### Option 3: Docker

1. Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

2. Build and run:
```bash
docker build -t ai-image-generator .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=http://api:8000 ai-image-generator
```

## Troubleshooting

### Issue: Templates not loading

**Solution**: Check that your FastAPI backend is running and CORS is configured correctly.

```bash
# Test API endpoint
curl http://localhost:8000/api/v1/templates?page=1&limit=6
```

### Issue: Images not uploading

**Solution**: Increase FastAPI max file size:

```python
from fastapi import FastAPI, UploadFile, File

app = FastAPI()

@app.post("/api/v1/generate")
async def generate(
    images: list[UploadFile] = File(..., max_length=10485760)  # 10MB
):
    ...
```

### Issue: Telegram WebApp not working

**Solution**:
1. Make sure you're testing inside Telegram
2. Check that the script tag is loaded: `https://telegram.org/js/telegram-web-app.js`
3. Verify webapp URL in BotFather

### Issue: Theme not persisting

**Solution**: Check browser localStorage is enabled and working.

### Issue: Build errors

**Solution**: Clear cache and reinstall:
```bash
rm -rf node_modules .next
npm install
npm run build
```

## Environment Variables Explained

### `NEXT_PUBLIC_API_BASE_URL`
- **Purpose**: URL of your FastAPI backend
- **Development**: `http://localhost:8000`
- **Production**: `https://api.your-domain.com`
- **Note**: Must NOT end with trailing slash

### `NEXT_PUBLIC_BOT_USERNAME`
- **Purpose**: Your Telegram bot's username
- **Format**: Without @ symbol
- **Example**: `my_image_generator_bot`

## Performance Optimization

### 1. Enable Image Optimization

Next.js automatically optimizes images. Make sure to use the `Image` component from `next/image` when possible.

### 2. Enable Compression

Add compression middleware in production:

```bash
npm install compression
```

### 3. CDN Configuration

Upload static assets to CDN and update `next.config.mjs`:

```javascript
module.exports = {
  assetPrefix: 'https://cdn.your-domain.com',
}
```

### 4. Enable Redis Caching (Optional)

Cache API responses in Redis for better performance:

```typescript
// Add Redis caching in api.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const getCachedTemplates = async (page: number) => {
  const cacheKey = `templates:${page}`;
  const cached = await redis.get(cacheKey);

  if (cached) return JSON.parse(cached);

  const data = await api.getTemplates(page);
  await redis.setex(cacheKey, 300, JSON.stringify(data)); // 5 min cache

  return data;
};
```

## Security Checklist

- ✅ Environment variables are not committed
- ✅ API endpoints use authentication
- ✅ File uploads are validated
- ✅ XSS protection enabled
- ✅ HTTPS in production
- ✅ CSP headers configured
- ✅ Rate limiting on API

## Monitoring

### Add Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Add Analytics (Optional)

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <Analytics />
    </>
  );
}
```

## Need Help?

- 📖 [Next.js Documentation](https://nextjs.org/docs)
- 🎨 [Tailwind CSS Docs](https://tailwindcss.com/docs)
- 🔄 [Redux Toolkit Docs](https://redux-toolkit.js.org)
- 💬 [Telegram WebApp Docs](https://core.telegram.org/bots/webapps)

## Support

If you encounter any issues:

1. Check this guide
2. Review error logs
3. Test API endpoints manually
4. Open an issue on GitHub
