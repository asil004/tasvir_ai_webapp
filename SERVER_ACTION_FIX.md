# Fix for "Failed to find Server Action" Error

## Problem
The error `Failed to find Server Action "x"` occurs when there's a mismatch between client and server code, typically after deployments or during development with hot reloads.

## Root Causes
1. **Build cache mismatch**: The .next directory contains stale references to Server Actions
2. **Docker layer caching**: Old build artifacts are cached in Docker layers
3. **Browser cache**: Client is using outdated JavaScript bundles

## Solutions Applied

### 1. ✅ Added Unique Build IDs
**File**: `webapp/next.config.mjs`

Added `generateBuildId` to ensure each build has a unique identifier, preventing cache conflicts:
```javascript
generateBuildId: async () => {
  return `build-${Date.now()}`;
},
```

### 2. ✅ Created .dockerignore
**File**: `webapp/.dockerignore`

Prevents .next directory from being copied into Docker, forcing a fresh build:
- Excludes `.next`, `node_modules`, and cache directories
- Ensures clean builds in production

### 3. ✅ Added Cleanup Scripts
**File**: `webapp/package.json`

New npm scripts:
```bash
npm run clean      # Clean build artifacts
npm run rebuild    # Clean + build
```

**File**: `webapp/clean-build.bat` (Windows)
Batch script for Windows users to clean build artifacts

**File**: `Makefile`

New make command:
```bash
make clean-build   # Clean and rebuild Docker with no cache
```

## How to Fix

### Quick Fix (Development)
```bash
cd webapp
npm run clean
npm run build
npm run dev
```

### Docker Fix (Production)
```bash
# Option 1: Using Makefile
make clean-build

# Option 2: Manual
docker compose down
rm -rf webapp/.next
docker compose build --no-cache
docker compose up -d
```

### Windows Users
```bash
cd webapp
clean-build.bat
npm run build
```

### Emergency Fix
If the error persists:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Run `make clean-all` to remove all Docker resources
3. Rebuild: `make deploy-prod`

## Prevention

### For Development
- Always stop dev server before switching branches
- Run `npm run clean` after pulling new code
- Use `npm run rebuild` if you encounter cache issues

### For Production
- Always use `make deploy-prod` (builds with --no-cache)
- Clear CDN cache after deployments
- Monitor build IDs in browser DevTools Network tab

## Verification
After fixing, verify the build ID changes:
1. Open browser DevTools → Network tab
2. Look for `_next/static/BUILD_ID/_buildManifest.js`
3. The BUILD_ID should be a timestamp (e.g., `build-1739283456789`)

## Additional Notes
- This error does NOT occur in your codebase because you're not using Server Actions
- The error might be coming from:
  - A third-party library
  - Old cached JavaScript in the browser
  - Stale Docker layers

## If Error Persists
1. Check browser console for the exact action ID being called
2. Search codebase for that action ID: `grep -r "ACTION_ID" webapp/`
3. Check if any forms have `action` or `formAction` props
4. Consider adding cache headers in next.config.mjs:
   ```javascript
   async headers() {
     return [
       {
         source: '/_next/static/:path*',
         headers: [
           { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
         ],
       },
     ];
   }
   ```

## Contact
If the issue persists after trying all solutions, please provide:
- Browser console errors (full stack trace)
- Network tab screenshot showing the failed request
- Build ID from `_buildManifest.js`
