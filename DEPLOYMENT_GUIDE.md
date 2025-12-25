# FlowPay Deployment Guide

## Database Configuration Options

### Current Development Environment
During development, FlowPay uses a **built-in RESTful Table API** that's part of the static website framework. This is **NOT** Supabase or any external database service.

### Production Deployment Options

When deploying to GitHub/Vercel, you have several database options:

#### Option 1: Browser Local Storage (Recommended for Quick Start)
✅ **Zero configuration required**  
✅ **Works immediately on any static host**  
✅ **No external dependencies**  
❌ **Data is browser-specific**  
❌ **No cross-device synchronization**  

**How to use:** Simply deploy `index-production.html` instead of `index.html`

#### Option 2: Free Cloud Databases (Recommended for Production)
✅ **Persistent data across devices**  
✅ **Real-time synchronization**  
✅ **Professional features**  

**Options:**
- **Firebase Firestore** (Google) - Free tier: 1GB storage, 50k reads/day
- **Supabase** - Free tier: 500MB storage, 50k API calls/month  
- **MongoDB Atlas** - Free tier: 512MB storage
- **Airtable** - Free tier: 1,200 records/base

#### Option 3: JSON File Storage with Backend
✅ **Simple implementation**  
✅ **Full control over data**  
❌ **Requires simple backend**  

---

## Quick Deploy to GitHub/Vercel

### Step 1: Prepare Production Files
```bash
# Copy production files
cp index-production.html index.html
cp js/app-production.js js/app.js
```

### Step 2: Push to GitHub
```bash
git init
git add .
git commit -m "FlowPay blockchain payroll system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/flowpay.git
git push -u origin main
```

### Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub
4. Select your FlowPay repository
5. Click "Deploy"

**No build settings needed** - it's a static site!

---

## Database Integration Guide

### Firebase Firestore Integration

1. **Create Firebase Project:**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   firebase init
   ```

2. **Replace API calls in `js/app.js`:**
   ```javascript
   // Replace this:
   await fetch(`tables/${table}`, {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify(data)
   });
   
   // With this:
   await db.collection(table).add(data);
   ```

3. **Add Firebase config:**
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID"
   };
   ```

### Supabase Integration

1. **Create Supabase project** at [supabase.com](https://supabase.com)

2. **Install Supabase client:**
   ```bash
   npm install @supabase/supabase-js
   ```

3. **Replace database calls:**
   ```javascript
   // Replace REST API calls with:
   const { data, error } = await supabase
       .from(table)
       .insert(data)
       .select();
   ```

---

## Smart Contract Deployment

### Deploy to Ethereum Network
```solidity
// Deploy using Remix IDE or Hardhat
// Contract address will be: 0x...
```

### Update Contract Addresses
Edit these files with your deployed contract addresses:

**`js/analytics.js`:**
```javascript
this.mneeContractAddress = 'YOUR_MNEE_CONTRACT_ADDRESS';
this.paymentContractAddress = 'YOUR_PAYMENT_CONTRACT_ADDRESS';
```

**`js/scheduler.js`:**
```javascript
this.contractAddress = 'YOUR_PAYMENT_CONTRACT_ADDRESS';
```

---

## Configuration Files

### Environment Variables
Create `.env` file (not tracked in git):
```
VITE_FIREBASE_API_KEY=your_key_here
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
```

### Network Configuration
**`js/wallet.js`:**
```javascript
const networks = {
    1: 'Ethereum Mainnet',
    137: 'Polygon',
    56: 'Binance Smart Chain',
    42161: 'Arbitrum'
};
```

---

## Testing Your Deployment

### Local Testing
```bash
# Python
python -m http.server 8000

# Node.js
npx live-server

# Open browser to http://localhost:8000
```

### Test Checklist
- [ ] Wallet connection works
- [ ] Company registration saves
- [ ] Employee management functions
- [ ] Analytics charts load
- [ ] Payment scheduling triggers

---

## Security Considerations

### For Production Deployment
1. **Enable HTTPS** (Vercel does this automatically)
2. **Set up CORS** if using external APIs
3. **Validate all inputs** on client-side
4. **Never expose private keys** in frontend code
5. **Use environment variables** for sensitive data

---

## Troubleshooting

### Common Issues

**"Data not persisting"**
- Check if using `index-production.html`
- Verify localStorage isn't blocked by browser

**"Wallet won't connect"**
- Check if MetaMask is installed
- Verify correct network is selected

**"Analytics not loading"**
- Check Chart.js CDN is accessible
- Verify data exists in storage

### Debug Mode
```javascript
// Enable debug mode in browser console
window.DEBUG = true;
console.log('FlowPay Debug:', window.flowPay);
```

---

## Performance Optimization

### For Vercel Deployment
- Enable **Automatic Static Optimization**
- Use **Incremental Static Regeneration** if needed
- Optimize images and assets

### Bundle Size Optimization
- Use **Tree Shaking** for JavaScript
- **Minify** CSS and JavaScript
- **Lazy load** non-critical components

---

## Monitoring & Analytics

### Add Analytics
```javascript
// Google Analytics
gtag('config', 'GA_MEASUREMENT_ID');

// Or use Vercel Analytics
import { Analytics } from '@vercel/analytics/react';
```

### Error Tracking
```javascript
// Sentry error tracking
Sentry.init({ dsn: 'YOUR_SENTRY_DSN' });
```

---

## Support

### Documentation
- Full documentation: `FLOWPAY_DOCUMENTATION.md`
- API reference in documentation file
- Troubleshooting guide included

### Community
- GitHub Issues for bug reports
- Discussions for feature requests
- Community contributions welcome!

---

**Ready to deploy?** 🚀

1. Choose your database option
2. Deploy to GitHub
3. Connect to Vercel
4. Configure smart contracts
5. Start managing payroll!

**Questions?** Check the documentation or create an issue on GitHub.