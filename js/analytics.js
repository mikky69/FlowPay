// Advanced Analytics System for PayStream
class PayStreamAnalytics {
    constructor() {
        this.blockchainExplorers = {
            ethereum: {
                mainnet: 'https://api.etherscan.io/api',
                apiKey: 'YOUR_ETHERSCAN_API_KEY'
            },
            polygon: {
                mainnet: 'https://api.polygonscan.com/api',
                apiKey: 'YOUR_POLYGONSCAN_API_KEY'
            },
            bsc: {
                mainnet: 'https://api.bscscan.com/api',
                apiKey: 'YOUR_BSCSCAN_API_KEY'
            },
            arbitrum: {
                mainnet: 'https://api.arbiscan.io/api',
                apiKey: 'YOUR_ARBISCAN_API_KEY'
            }
        };
        
        this.mneeContractAddress = '0x...'; // MNEE stablecoin contract address
        this.paymentContractAddress = '0x...'; // Your payment contract address
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadBlockchainData();
        
        // Set global reference
        window.payStreamAnalytics = this;
    }

    setupEventListeners() {
        // Refresh analytics button
        document.getElementById('refreshAnalytics')?.addEventListener('click', () => {
            this.refreshAnalytics();
        });

        // Network selection
        document.getElementById('networkSelect')?.addEventListener('change', (e) => {
            this.switchNetwork(e.target.value);
        });
    }

    async loadBlockchainData() {
        try {
            if (!window.flowPay?.currentAccount) return;

            const network = await window.walletManager?.getNetwork();
            const balance = await window.walletManager?.getBalance();
            
            this.updateBlockchainInfo(network, balance);
            this.loadTransactionHistory();
            this.loadTokenData();
            
        } catch (error) {
            console.error('Load blockchain data error:', error);
        }
    }

    updateBlockchainInfo(network, balance) {
        const networkElement = document.getElementById('currentNetwork');
        const balanceElement = document.getElementById('walletBalance');
        
        if (networkElement) {
            networkElement.textContent = network;
        }
        
        if (balanceElement) {
            balanceElement.textContent = `${parseFloat(balance).toFixed(4)} ETH`;
        }
    }

    async loadTransactionHistory() {
        try {
            const transactions = await this.fetchTransactions(payStream.currentAccount);
            this.renderTransactionHistory(transactions);
            this.updatePaymentAnalytics(transactions);
            
        } catch (error) {
            console.error('Load transaction history error:', error);
        }
    }

    async fetchTransactions(address, startBlock = 0, endBlock = 'latest') {
        try {
            // This would use blockchain explorer APIs in production
            // For demo purposes, we'll use mock data
            const mockTransactions = this.generateMockTransactions();
            return mockTransactions;
            
        } catch (error) {
            console.error('Fetch transactions error:', error);
            return [];
        }
    }

    generateMockTransactions() {
        const transactions = [];
        const now = new Date();
        
        // Generate mock transactions for the last 6 months
        for (let i = 0; i < 25; i++) {
            const date = new Date(now.getTime() - (i * 30 * 24 * 60 * 60 * 1000)); // Roughly monthly
            
            transactions.push({
                hash: `0x${Math.random().toString(16).substr(2, 64)}`,
                from: payStream.currentAccount,
                to: this.mneeContractAddress,
                value: Math.floor(Math.random() * 10000) + 1000, // Random MNEE amount
                timestamp: date.getTime(),
                status: Math.random() > 0.1 ? 'completed' : 'failed', // 90% success rate
                type: Math.random() > 0.8 ? 'bonus' : 'monthly'
            });
        }
        
        return transactions.sort((a, b) => b.timestamp - a.timestamp);
    }

    renderTransactionHistory(transactions) {
        const container = document.getElementById('transactionHistory');
        if (!container) return;

        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-history text-4xl mb-2"></i>
                    <p>No transaction history available</p>
                </div>
            `;
            return;
        }

        const html = transactions.slice(0, 10).map(tx => `
            <div class="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full ${tx.status === 'completed' ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center">
                        <i class="fas ${tx.status === 'completed' ? 'fa-check text-green-600' : 'fa-times text-red-600'}"></i>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-800">
                            ${tx.type === 'monthly' ? 'Monthly Payment' : 'Bonus Payment'}
                        </p>
                        <p class="text-sm text-gray-500">
                            ${new Date(tx.timestamp).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-semibold text-gray-800">${tx.value.toLocaleString()} MNEE</p>
                    <p class="text-xs text-gray-500">
                        Hash: ${tx.hash.substring(0, 6)}...${tx.hash.substring(58)}
                    </p>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    updatePaymentAnalytics(transactions) {
        const completed = transactions.filter(tx => tx.status === 'completed');
        const failed = transactions.filter(tx => tx.status === 'failed');
        const successRate = (completed.length / transactions.length * 100).toFixed(1);
        
        // Update success rate
        const successRateElement = document.getElementById('successRate');
        if (successRateElement) {
            successRateElement.textContent = `${successRate}%`;
            successRateElement.className = `font-semibold ${successRate >= 95 ? 'text-green-600' : successRate >= 80 ? 'text-yellow-600' : 'text-red-600'}`;
        }

        // Update payment volume
        const totalVolume = completed.reduce((sum, tx) => sum + tx.value, 0);
        const volumeElement = document.getElementById('totalVolume');
        if (volumeElement) {
            volumeElement.textContent = `${totalVolume.toLocaleString()} MNEE`;
        }

        // Update payment count
        const countElement = document.getElementById('totalPayments');
        if (countElement) {
            countElement.textContent = completed.length;
        }

        // Render charts
        this.renderAnalyticsCharts(transactions);
    }

    renderAnalyticsCharts(transactions) {
        this.renderPaymentTrendsChart(transactions);
        this.renderPaymentStatusChart(transactions);
        this.renderDepartmentAnalytics();
    }

    renderPaymentTrendsChart(transactions) {
        const canvas = document.getElementById('paymentTrendsChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Group transactions by month
        const monthlyData = this.groupTransactionsByMonth(transactions);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(monthlyData),
                datasets: [{
                    label: 'Monthly Payments (MNEE)',
                    data: Object.values(monthlyData),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Payment Trends Over Time'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString() + ' MNEE';
                            }
                        }
                    }
                }
            }
        });
    }

    renderPaymentStatusChart(transactions) {
        const canvas = document.getElementById('paymentStatusChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        const statusData = {
            completed: transactions.filter(tx => tx.status === 'completed').length,
            failed: transactions.filter(tx => tx.status === 'failed').length
        };

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Failed'],
                datasets: [{
                    data: [statusData.completed, statusData.failed],
                    backgroundColor: [
                        'rgb(34, 197, 94)',
                        'rgb(239, 68, 68)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Payment Success Rate'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderDepartmentAnalytics() {
        const canvas = document.getElementById('departmentChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const departmentData = payStream.getDepartmentData();
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(departmentData),
                datasets: [{
                    label: 'Employee Count',
                    data: Object.values(departmentData),
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(147, 51, 234, 0.8)'
                    ],
                    borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(239, 68, 68)',
                        'rgb(147, 51, 234)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Employees by Department'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    groupTransactionsByMonth(transactions) {
        const grouped = {};
        
        transactions.forEach(tx => {
            const date = new Date(tx.timestamp);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!grouped[monthKey]) {
                grouped[monthKey] = 0;
            }
            
            if (tx.status === 'completed') {
                grouped[monthKey] += tx.value;
            }
        });

        // Sort by month
        const sorted = {};
        Object.keys(grouped).sort().forEach(key => {
            const [year, month] = key.split('-');
            const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short' 
            });
            sorted[monthName] = grouped[key];
        });

        return sorted;
    }

    async loadTokenData() {
        try {
            // Load MNEE token data
            const mneeData = await this.fetchTokenData(this.mneeContractAddress);
            this.updateTokenInfo(mneeData);
            
        } catch (error) {
            console.error('Load token data error:', error);
        }
    }

    async fetchTokenData(contractAddress) {
        // Mock token data - in production this would use blockchain APIs
        return {
            symbol: 'MNEE',
            name: 'MNEE Stablecoin',
            decimals: 18,
            totalSupply: '1000000000',
            price: '1.00', // $1.00 stablecoin
            marketCap: '1000000000',
            holders: 12500
        };
    }

    updateTokenInfo(tokenData) {
        const container = document.getElementById('tokenInfo');
        if (!container) return;

        container.innerHTML = `
            <div class="bg-white rounded-lg p-6 card-shadow">
                <h4 class="text-lg font-semibold text-gray-800 mb-4">MNEE Token Info</h4>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Symbol:</span>
                        <span class="font-semibold">${tokenData.symbol}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Price:</span>
                        <span class="font-semibold">$${tokenData.price}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Holders:</span>
                        <span class="font-semibold">${tokenData.holders.toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Market Cap:</span>
                        <span class="font-semibold">$${parseInt(tokenData.marketCap).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;
    }

    refreshAnalytics() {
        this.showNotification('Refreshing analytics data...', 'info');
        this.loadBlockchainData();
    }

    switchNetwork(network) {
        this.showNotification(`Switched to ${network}`, 'info');
        this.loadBlockchainData();
    }

    showNotification(message, type) {
        payStream.showNotification(message, type);
    }

    // Real-time analytics monitoring
    startRealTimeMonitoring() {
        // Monitor blockchain events
        this.monitorBlockchainEvents();
        
        // Update analytics every 30 seconds
        setInterval(() => {
            this.loadBlockchainData();
        }, 30000);
    }

    monitorBlockchainEvents() {
        if (!walletManager.web3) return;

        // Listen for payment events from your smart contract
        // This would be implemented when you integrate with your smart contract
        
        walletManager.web3.eth.subscribe('newBlockHeaders', (error, result) => {
            if (error) {
                console.error('Block subscription error:', error);
                return;
            }
            
            // New block received, check for relevant transactions
            this.checkNewTransactions(result.number);
        });
    }

    async checkNewTransactions(blockNumber) {
        try {
            const block = await walletManager.web3.eth.getBlock(blockNumber, true);
            
            if (block && block.transactions) {
                block.transactions.forEach(tx => {
                    // Check if transaction involves our payment contract or MNEE token
                    if (tx.to === this.paymentContractAddress || tx.to === this.mneeContractAddress) {
                        this.handleNewTransaction(tx);
                    }
                });
            }
            
        } catch (error) {
            console.error('Check new transactions error:', error);
        }
    }

    handleNewTransaction(tx) {
        // Update analytics with new transaction
        this.showNotification('New payment transaction detected', 'success');
        this.loadBlockchainData();
    }
}

// Initialize analytics
const payStreamAnalytics = new PayStreamAnalytics();