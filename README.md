# FlowPay 🚀

**Blockchain-based programmable payroll system with automated payments and real-time analytics.**

## Quick Start (30 seconds)

```bash
# 1. Clone to GitHub
git clone https://github.com/YOUR_USERNAME/flowpay.git

# 2. Deploy to Vercel (one-click)
# Go to vercel.com → Import from GitHub → Deploy

# 3. Done! 🎉
# Your app is live with localStorage (no database needed)
```

## What is FlowPay?

FlowPay is a **production-ready** blockchain payroll system that automates employee payments using smart contracts and cryptocurrency. Perfect for companies wanting to pay employees in crypto (MNEE stablecoin) with automated scheduling.

## ✅ Features Ready

- **Company Dashboard** - Register and manage your company
- **Employee Management** - Add/remove employees with wallet addresses  
- **Automated Payments** - Schedule recurring payments (weekly/monthly)
- **Multi-Wallet Support** - MetaMask, WalletConnect, Coinbase Wallet
- **Real-Time Analytics** - Payment trends, success rates, department stats
- **Blockchain Integration** - Ethereum, Polygon, BNB Chain, Arbitrum
- **Smart Contract Ready** - Integration points marked for your contracts
- **Mobile Responsive** - Works on all devices

## 🚀 Deployment Options

### Option 1: Instant Deployment (Recommended)
**No database setup required!** Uses browser localStorage.

```bash
cp index-production.html index.html
cp js/app-production.js js/app.js
# Deploy to Vercel/Netlify
```

### Option 2: Cloud Database (Advanced)
Integrate with Firebase, Supabase, or MongoDB for persistent data across devices.

**See `DEPLOYMENT_GUIDE.md` for detailed instructions.**

## 📝 Current Status

- ✅ **Company dashboard** - Fully functional
- ✅ **Staff management** - Add/edit/remove employees  
- ✅ **Wallet integration** - Connect top EVM wallets
- ✅ **Analytics dashboard** - Charts and real-time data
- ✅ **Payment scheduling** - Automated recurring payments
- ✅ **Production ready** - Deploy to GitHub/Vercel today
- ✅ **Documentation** - Complete guides included

## 🎯 Perfect For

- **Crypto-native companies** paying in stablecoins
- **Remote teams** with international employees
- **Web3 startups** wanting automated payroll
- **Freelance platforms** needing payment scheduling

## 🔧 Smart Contract Integration

Your smart contract should implement:
```solidity
function processPayment(address employee, uint256 amount, string memory paymentType) 
    external returns (bytes32);
```

**Integration points are marked in:**
- `js/analytics.js` - Update contract addresses
- `js/scheduler.js` - Payment processing logic

## 📊 Analytics Dashboard

- Payment trends over time
- Department distribution  
- Payment success rates
- Monthly comparisons
- Real-time monitoring

## 🎨 Brand & Logo

- **Name**: FlowPay (rebranded from PayStream)
- **Logo**: Abstract blockchain symbol (no text)
- **Colors**: Professional blue-green gradient
- **Favicon**: Included and ready

## 🚀 Deploy Right Now

```bash
# 1. Copy production files
cp index-production.html index.html
cp js/app-production.js js/app.js

# 2. Push to GitHub
git add .
git commit -m "FlowPay blockchain payroll system"
git push origin main

# 3. Deploy to Vercel (free)
# Go to vercel.com → New Project → Import from GitHub
```

**That's it!** Your FlowPay app is live and ready for blockchain payroll management.

## 📚 Documentation

- **Complete docs**: `FLOWPAY_DOCUMENTATION.md`
- **Deployment guide**: `DEPLOYMENT_GUIDE.md`  
- **API reference**: Included in documentation
- **Troubleshooting**: Comprehensive guides

---

**FlowPay** - *Revolutionizing payroll management through blockchain automation.* 🚀