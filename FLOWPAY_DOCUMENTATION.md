# FlowPay Documentation

## Overview

FlowPay is a cutting-edge, blockchain-based programmable payroll system that automates employee payments using smart contracts and cryptocurrency. Built with modern web technologies, it provides companies with a seamless interface to manage payroll with real-time analytics and automated scheduling.

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Getting Started](#getting-started)
5. [Wallet Integration](#wallet-integration)
6. [Smart Contract Integration](#smart-contract-integration)
7. [Analytics](#analytics)
8. [Payment Scheduling](#payment-scheduling)
9. [API Reference](#api-reference)
10. [Security](#security)
11. [Troubleshooting](#troubleshooting)
12. [Development](#development)

## Introduction

### What is FlowPay?
FlowPay is a decentralized payroll management system that leverages blockchain technology to automate employee payments. It supports multiple blockchain networks and provides comprehensive analytics for payroll management.

### Key Benefits
- **Automated Payments**: Schedule recurring payments without manual intervention
- **Multi-Chain Support**: Operate on Ethereum, Polygon, BNB Chain, Arbitrum, and more
- **Real-Time Analytics**: Monitor payment success rates and trends
- **Employee Management**: Easy onboarding and management of team members
- **Transparent Transactions**: All payments are recorded on the blockchain

## Features

### Core Functionality
- ✅ Company registration and management
- ✅ Employee onboarding with wallet addresses
- ✅ Automated payment scheduling (weekly/bi-weekly/monthly)
- ✅ Multi-wallet support (MetaMask, WalletConnect, etc.)
- ✅ Real-time analytics dashboard
- ✅ Transaction history with blockchain explorer integration

### Advanced Features
- 🔄 Multi-network blockchain support
- 📊 Comprehensive payment analytics
- ⚡ Real-time transaction monitoring
- 🔐 Enterprise-grade security
- 📱 Mobile-responsive design
- 🎯 Custom payment schedules

### Supported Blockchains
- Ethereum Mainnet
- Polygon (MATIC)
- Binance Smart Chain
- Arbitrum
- Optimism

## Architecture

### System Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │───▶│  Wallet Manager │───▶│  Blockchain     │
│  (HTML/CSS/JS)  │    │   (Multi-Wallet)│    │  Networks       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Analytics      │    │  Payment        │    │  Smart          │
│  Engine         │    │  Scheduler      │    │  Contracts      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Styling**: Tailwind CSS
- **Charts**: Chart.js
- **Blockchain**: Web3.js
- **Data Storage**: RESTful Table API (development) / localStorage (production) / Cloud databases (optional)

## Getting Started

### Prerequisites
- Modern web browser with Web3 support
- Ethereum wallet (MetaMask recommended)
- Basic understanding of blockchain concepts

### Installation
1. Download all project files
2. Choose your deployment method:
   - **Quick Start**: Use `index-production.html` for localStorage (no database needed)
   - **Production**: Integrate with Firebase, Supabase, or your preferred backend
3. Host on any static hosting service (Vercel, Netlify, GitHub Pages)
4. Configure blockchain settings (see Configuration)
5. Deploy your smart contract
6. Update contract addresses

### Quick Setup
```bash
# No build process required - it's ready to deploy!
# Simply host the files on your preferred platform

# For production deployment with localStorage:
cp index-production.html index.html
cp js/app-production.js js/app.js

# For local development:
python -m http.server 8000
# or
npx live-server

# For Firebase/Supabase integration, see DEPLOYMENT_GUIDE.md
```

### Configuration
Update these key variables in your JavaScript files:

#### Wallet Configuration (`js/wallet.js`)
```javascript
const networks = {
    1: 'Ethereum Mainnet',
    137: 'Polygon',
    56: 'Binance Smart Chain',
    42161: 'Arbitrum'
};
```

#### Contract Configuration (`js/analytics.js`)
```javascript
this.mneeContractAddress = 'YOUR_MNEE_CONTRACT_ADDRESS';
this.paymentContractAddress = 'YOUR_PAYMENT_CONTRACT_ADDRESS';
```

## Wallet Integration

### Supported Wallets

#### Primary Wallets
- **MetaMask**: Most popular Ethereum wallet
- **WalletConnect**: Universal wallet connector
- **Coinbase Wallet**: Mobile-first wallet
- **Trust Wallet**: Binance's official wallet

#### Additional Support
- Binance Chain Wallet
- Phantom Wallet
- Argent
- Rainbow

### Wallet Connection Flow
```javascript
// Initialize wallet manager
const walletManager = new WalletManager();

// Connect specific wallet
await walletManager.connectWallet('metamask');

// Get account info
const account = walletManager.currentAccount;
const balance = await walletManager.getBalance();
```

### Multi-Wallet Detection
The system automatically detects available wallets and suggests the best options:

```javascript
// Detect available wallets
const availableWallets = walletManager.detectAvailableWallets();

// Get recommended wallets based on environment
const recommended = walletManager.getRecommendedWallets();
```

## Smart Contract Integration

### Contract Interface
Your smart contract should implement these key functions:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFlowPay {
    function processPayment(
        address employee,
        uint256 amount,
        string memory paymentType
    ) external returns (bytes32);
    
    function getPaymentHistory(
        address company
    ) external view returns (Payment[] memory);
    
    function cancelPayment(
        bytes32 paymentId
    ) external;
    
    function getEmployeePayments(
        address employee
    ) external view returns (Payment[] memory);
}
```

### Integration Points

#### Payment Processing
Update `js/scheduler.js`:
```javascript
async processSmartContractPayment(employee) {
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    
    const tx = await contract.methods.processPayment(
        employee.wallet_address,
        web3.utils.toWei(employee.salary.toString(), 'ether'),
        'monthly'
    ).send({
        from: walletManager.currentAccount,
        gas: 200000
    });
    
    return tx.transactionHash;
}
```

#### Event Listening
Set up event listeners for payment confirmations:
```javascript
contract.events.PaymentProcessed({
    filter: { company: companyAddress }
}, (error, event) => {
    if (error) {
        console.error('Payment event error:', error);
    } else {
        console.log('Payment processed:', event.returnValues);
        // Update UI with new payment
    }
});
```

### MNEE Token Integration
The system expects an MNEE stablecoin contract with standard ERC20 functionality:

```javascript
// Get MNEE token balance
const mneeContract = new web3.eth.Contract(erc20ABI, mneeAddress);
const balance = await mneeContract.methods.balanceOf(account).call();

// Transfer MNEE tokens
await mneeContract.methods.transfer(employeeAddress, amount).send({
    from: companyAddress
});
```

## Analytics

### Dashboard Components

#### Payment Trends
- Monthly payment volume tracking
- Success rate over time
- Average payment amounts
- Failed payment analysis

#### Employee Analytics
- Department distribution
- Salary analysis
- Payment history per employee
- Employee status tracking

#### Blockchain Analytics
- Network fee analysis
- Transaction confirmation times
- Gas price optimization
- Network congestion monitoring

### Chart Types

#### Line Charts
- Payment trends over time
- Success rate tracking
- Volume analysis

#### Doughnut Charts
- Payment status distribution
- Department employee count
- Success/failure ratios

#### Bar Charts
- Department-wise salaries
- Monthly comparisons
- Employee distribution

### Real-Time Updates
```javascript
// Enable real-time monitoring
payStreamAnalytics.startRealTimeMonitoring();

// Monitor new blocks
walletManager.web3.eth.subscribe('newBlockHeaders', (error, result) => {
    if (!error) {
        payStreamAnalytics.checkNewTransactions(result.number);
    }
});
```

## Payment Scheduling

### Schedule Types

#### Weekly Payments
- Frequency: Every 7 days
- Best for: Contract workers, freelancers
- Processing: Automated every Monday

#### Bi-Weekly Payments
- Frequency: Every 14 days
- Best for: Most companies
- Processing: Automated twice monthly

#### Monthly Payments
- Frequency: Every 30 days
- Best for: Salaried employees
- Processing: Automated monthly

### Schedule Management

#### Setting Up Schedules
```javascript
const scheduler = new PaymentScheduler();

// Configure payment schedule
await payStream.updateRecord('companies', companyId, {
    payment_schedule: 'monthly' // weekly, biweekly, monthly
});
```

#### Manual Processing
```javascript
// Process payments immediately
document.getElementById('triggerPayments').addEventListener('click', () => {
    paymentScheduler.processScheduledPayments();
});
```

#### Schedule Settings
```javascript
// Update schedule settings
paymentScheduler.showScheduleSettings();

// Save new settings
await paymentScheduler.saveScheduleSettings();
```

### Payment Status Flow
```
Scheduled → Pending → Completed/Failed
   ↓           ↓         ↓
Cancelled   Retrying   Archived
```

## API Reference

### Company API

#### Create Company
```http
POST /tables/companies
Content-Type: application/json

{
    "name": "TechCorp Solutions",
    "email": "admin@techcorp.com",
    "wallet_address": "0x742d35Cc6634C0532925a3b8D06e548241cC2619",
    "payment_schedule": "monthly",
    "total_monthly_budget": 50000,
    "is_active": true
}
```

#### Get Company
```http
GET /tables/companies/{company_id}
```

#### Update Company
```http
PATCH /tables/companies/{company_id}
Content-Type: application/json

{
    "payment_schedule": "biweekly"
}
```

### Employee API

#### Create Employee
```http
POST /tables/employees
Content-Type: application/json

{
    "company_id": "demo_company_1",
    "name": "John Smith",
    "email": "john@techcorp.com",
    "wallet_address": "0x8ba1f109551bD432803012645Hac136c82",
    "position": "Senior Developer",
    "department": "Engineering",
    "salary": 8000,
    "is_active": true
}
```

#### Update Employee Status
```http
PATCH /tables/employees/{employee_id}
Content-Type: application/json

{
    "is_active": false
}
```

#### Get Employees by Company
```http
GET /tables/employees?search={company_id}
```

### Payment API

#### Create Payment Record
```http
POST /tables/payments
Content-Type: application/json

{
    "company_id": "demo_company_1",
    "employee_id": "emp_1",
    "amount": 8000,
    "payment_date": "2024-12-01T00:00:00Z",
    "payment_type": "monthly",
    "status": "completed",
    "transaction_hash": "0x742d35cc6634c0532925a3b8d06e548241cc2619"
}
```

#### Get Payment History
```http
GET /tables/payments?search={company_id}
```

#### Update Payment Status
```http
PATCH /tables/payments/{payment_id}
Content-Type: application/json

{
    "status": "failed"
}
```

## Security

### Wallet Security
- Private keys never stored in application
- Secure wallet connection protocols
- Automatic session timeout
- Network validation before transactions

### Data Security
- Client-side data encryption
- Secure API communications
- Input validation and sanitization
- XSS and CSRF protection measures

### Best Practices
```javascript
// Always validate wallet addresses
function isValidAddress(address) {
    return Web3.utils.isAddress(address);
}

// Sanitize user inputs
function sanitizeInput(input) {
    return input.replace(/[<>]/g, '');
}

// Validate transaction data
function validateTransaction(tx) {
    if (!tx.to || !tx.amount || tx.amount <= 0) {
        throw new Error('Invalid transaction data');
    }
}
```

### Network Security
- HTTPS only for production
- CORS configuration
- Rate limiting for API calls
- Input length restrictions

## Troubleshooting

### Common Issues

#### Wallet Connection Failed
**Symptoms**: Cannot connect wallet
**Solutions**:
1. Check if wallet extension is installed
2. Verify wallet is unlocked
3. Check browser console for errors
4. Ensure correct network is selected

#### Transaction Failed
**Symptoms**: Payment transaction fails
**Solutions**:
1. Check gas fees and account balance
2. Verify contract address is correct
3. Ensure sufficient MNEE token balance
4. Check network congestion

#### Analytics Not Loading
**Symptoms**: Charts not displaying
**Solutions**:
1. Check browser console for JavaScript errors
2. Verify Chart.js is loaded correctly
3. Check API endpoints are accessible
4. Ensure data is available in database

#### Payment Schedule Not Working
**Symptoms**: Automated payments not processing
**Solutions**:
1. Check scheduler is running: `paymentScheduler.isSchedulerActive`
2. Verify company has active employees
3. Check payment schedule configuration
4. Ensure wallet is connected

### Debug Mode
```javascript
// Enable debug mode
window.DEBUG = true;

// Check system status
console.log('Wallet connected:', walletManager.currentAccount);
console.log('Company loaded:', payStream.currentCompany);
console.log('Scheduler active:', paymentScheduler.isSchedulerActive);
```

### Performance Issues
**Symptoms**: Slow loading, unresponsive UI
**Solutions**:
1. Clear browser cache
2. Check for memory leaks
3. Optimize chart rendering
4. Reduce API call frequency

## Development

### Local Development Setup
```bash
# Clone repository
git clone <repository-url>
cd flowpay

# Start local server
python -m http.server 8000
# or
npx live-server

# Open in browser
open http://localhost:8000
```

### Code Structure
```
flowpay/
├── index.html              # Main application
├── js/
│   ├── app.js              # Core application logic
│   ├── wallet.js           # Wallet management
│   ├── analytics.js          # Analytics engine
│   └── scheduler.js          # Payment scheduling
└── README.md               # Documentation
```

### Development Best Practices
1. **Modular Code**: Keep functions small and focused
2. **Error Handling**: Always handle errors gracefully
3. **Comments**: Document complex logic
4. **Testing**: Test on multiple browsers and wallets
5. **Security**: Never expose private keys or sensitive data

### Adding New Features

#### New Wallet Support
1. Add wallet configuration in `js/wallet.js`
2. Implement connection method
3. Update wallet detection logic
4. Test connection flow

#### New Blockchain Network
1. Add network configuration
2. Update RPC endpoints
3. Test transaction flow
4. Update documentation

#### New Analytics Charts
1. Add chart configuration in `js/analytics.js`
2. Implement data processing
3. Update HTML structure
4. Style with Tailwind CSS

---

## Support and Community

### Documentation
- Check this comprehensive documentation
- Review code comments
- Monitor browser console for errors

### Getting Help
1. Review troubleshooting section
2. Check GitHub issues
3. Join community discussions
4. Contact development team

### Contributing
1. Fork the repository
2. Create feature branch
3. Implement changes
4. Test thoroughly
5. Submit pull request

---

**FlowPay** - Revolutionizing payroll management through blockchain automation and seamless user experience.

*Built for the future of decentralized finance and automated business processes.*