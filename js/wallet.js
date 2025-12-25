// Advanced Wallet Connection System for PayStream
class WalletManager {
    constructor() {
        this.web3 = null;
        this.currentAccount = null;
        this.provider = null;
        this.supportedWallets = {
            metamask: {
                name: 'MetaMask',
                icon: 'https://cryptologos.cc/logos/metamask-fox.svg',
                detect: () => typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask,
                connect: () => this.connectMetaMask()
            },
            walletconnect: {
                name: 'WalletConnect',
                icon: 'https://cryptologos.cc/logos/walletconnect.svg',
                detect: () => true,
                connect: () => this.connectWalletConnect()
            },
            coinbase: {
                name: 'Coinbase Wallet',
                icon: 'https://cryptologos.cc/logos/coinbase-wallet.svg',
                detect: () => typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet,
                connect: () => this.connectCoinbase()
            },
            trust: {
                name: 'Trust Wallet',
                icon: 'https://cryptologos.cc/logos/trust-wallet.svg',
                detect: () => typeof window.ethereum !== 'undefined' && window.ethereum.isTrust,
                connect: () => this.connectTrustWallet()
            },
            binance: {
                name: 'Binance Chain Wallet',
                icon: 'https://cryptologos.cc/logos/bnb.svg',
                detect: () => typeof window.BinanceChain !== 'undefined',
                connect: () => this.connectBinance()
            },
            phantom: {
                name: 'Phantom',
                icon: 'https://cryptologos.cc/logos/phantom.svg',
                detect: () => typeof window.phantom !== 'undefined',
                connect: () => this.connectPhantom()
            }
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.detectAvailableWallets();
        this.setupWalletChangeListeners();
    }

    setupEventListeners() {
        // Wallet modal buttons
        document.querySelectorAll('.wallet-option').forEach((btn, index) => {
            const walletKeys = Object.keys(this.supportedWallets);
            const walletKey = walletKeys[index];
            
            btn.addEventListener('click', () => {
                this.connectWallet(walletKey);
            });
        });

        // Close wallet modal
        document.getElementById('closeWalletModal').addEventListener('click', () => {
            document.getElementById('walletModal').classList.add('hidden');
        });

        // Disconnect wallet
        document.getElementById('disconnectWallet').addEventListener('click', () => {
            this.disconnectWallet();
        });
    }

    detectAvailableWallets() {
        const availableWallets = [];
        
        Object.entries(this.supportedWallets).forEach(([key, wallet]) => {
            if (wallet.detect()) {
                availableWallets.push({
                    key,
                    name: wallet.name,
                    icon: wallet.icon
                });
            }
        });

        // Update wallet modal with available wallets
        this.updateWalletModal(availableWallets);
    }

    updateWalletModal(availableWallets) {
        const walletOptions = document.querySelectorAll('.wallet-option');
        
        walletOptions.forEach((option, index) => {
            const available = availableWallets[index];
            if (available) {
                option.style.display = 'block';
                option.disabled = false;
            } else {
                option.style.display = 'none';
            }
        });
    }

    async connectWallet(walletKey) {
        try {
            payStream.showLoading(true);
            
            const wallet = this.supportedWallets[walletKey];
            if (!wallet) {
                throw new Error('Unsupported wallet');
            }

            await wallet.connect();
            
            document.getElementById('walletModal').classList.add('hidden');
            payStream.showLoading(false);
            
        } catch (error) {
            console.error(`${walletKey} connection error:`, error);
            payStream.showLoading(false);
            payStream.showNotification(`Failed to connect ${wallet.name}`, 'error');
        }
    }

    async connectMetaMask() {
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask not detected');
        }

        try {
            // Request account access
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            this.currentAccount = accounts[0];
            this.provider = window.ethereum;
            this.web3 = new Web3(this.provider);
            
            this.updateWalletUI();
            this.showNotification('MetaMask connected successfully!', 'success');
            
        } catch (error) {
            throw new Error(`MetaMask connection failed: ${error.message}`);
        }
    }

    async connectWalletConnect() {
        try {
            // WalletConnect v2 configuration
            const WalletConnectProvider = window.WalletConnectProvider;
            
            const provider = new WalletConnectProvider({
                rpc: {
                    1: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
                    137: 'https://polygon-rpc.com',
                    56: 'https://bsc-dataseed.binance.org/',
                    42161: 'https://arb1.arbitrum.io/rpc'
                },
                chainId: 1,
                qrcode: true,
                qrcodeModalOptions: {
                    mobileLinks: [
                        'metamask',
                        'trust',
                        'rainbow',
                        'argent'
                    ]
                }
            });

            await provider.enable();
            
            this.provider = provider;
            this.web3 = new Web3(provider);
            this.currentAccount = provider.accounts[0];
            
            this.updateWalletUI();
            this.showNotification('WalletConnect connected successfully!', 'success');
            
        } catch (error) {
            throw new Error(`WalletConnect connection failed: ${error.message}`);
        }
    }

    async connectCoinbase() {
        if (typeof window.ethereum === 'undefined' || !window.ethereum.isCoinbaseWallet) {
            throw new Error('Coinbase Wallet not detected');
        }

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            this.currentAccount = accounts[0];
            this.provider = window.ethereum;
            this.web3 = new Web3(this.provider);
            
            this.updateWalletUI();
            this.showNotification('Coinbase Wallet connected successfully!', 'success');
            
        } catch (error) {
            throw new Error(`Coinbase Wallet connection failed: ${error.message}`);
        }
    }

    async connectTrustWallet() {
        if (typeof window.ethereum === 'undefined' || !window.ethereum.isTrust) {
            throw new Error('Trust Wallet not detected');
        }

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            this.currentAccount = accounts[0];
            this.provider = window.ethereum;
            this.web3 = new Web3(this.provider);
            
            this.updateWalletUI();
            this.showNotification('Trust Wallet connected successfully!', 'success');
            
        } catch (error) {
            throw new Error(`Trust Wallet connection failed: ${error.message}`);
        }
    }

    async connectBinance() {
        if (typeof window.BinanceChain === 'undefined') {
            throw new Error('Binance Chain Wallet not detected');
        }

        try {
            const accounts = await window.BinanceChain.request({ method: 'eth_requestAccounts' });
            
            this.currentAccount = accounts[0];
            this.provider = window.BinanceChain;
            this.web3 = new Web3(this.provider);
            
            this.updateWalletUI();
            this.showNotification('Binance Chain Wallet connected successfully!', 'success');
            
        } catch (error) {
            throw new Error(`Binance Chain Wallet connection failed: ${error.message}`);
        }
    }

    async connectPhantom() {
        if (typeof window.phantom === 'undefined' || !window.phantom.ethereum) {
            throw new Error('Phantom Wallet not detected');
        }

        try {
            const accounts = await window.phantom.ethereum.request({ method: 'eth_requestAccounts' });
            
            this.currentAccount = accounts[0];
            this.provider = window.phantom.ethereum;
            this.web3 = new Web3(this.provider);
            
            this.updateWalletUI();
            this.showNotification('Phantom Wallet connected successfully!', 'success');
            
        } catch (error) {
            throw new Error(`Phantom Wallet connection failed: ${error.message}`);
        }
    }

    setupWalletChangeListeners() {
        // Listen for account changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnectWallet();
                } else {
                    this.currentAccount = accounts[0];
                    this.updateWalletUI();
                    this.showNotification('Account changed', 'info');
                }
            });

            window.ethereum.on('chainChanged', (chainId) => {
                this.showNotification('Network changed', 'info');
                // Reload the page or update the UI accordingly
                window.location.reload();
            });

            window.ethereum.on('disconnect', () => {
                this.disconnectWallet();
            });
        }
    }

    updateWalletUI() {
        payStream.currentAccount = this.currentAccount;
        payStream.web3 = this.web3;
        payStream.updateWalletUI();
    }

    disconnectWallet() {
        this.currentAccount = null;
        this.web3 = null;
        this.provider = null;
        
        // Clear any wallet-specific connections
        if (this.provider && this.provider.disconnect) {
            this.provider.disconnect();
        }
        
        this.updateWalletUI();
        this.showNotification('Wallet disconnected', 'info');
    }

    showNotification(message, type) {
        payStream.showNotification(message, type);
    }

    // Utility methods for blockchain interactions
    async getBalance(address = null) {
        if (!this.web3) throw new Error('No wallet connected');
        
        const account = address || this.currentAccount;
        const balance = await this.web3.eth.getBalance(account);
        return this.web3.utils.fromWei(balance, 'ether');
    }

    async getNetwork() {
        if (!this.web3) throw new Error('No wallet connected');
        
        const networkId = await this.web3.eth.net.getId();
        const networks = {
            1: 'Ethereum Mainnet',
            137: 'Polygon',
            56: 'Binance Smart Chain',
            42161: 'Arbitrum',
            10: 'Optimism',
            43114: 'Avalanche'
        };
        
        return networks[networkId] || `Unknown Network (${networkId})`;
    }

    async signMessage(message) {
        if (!this.web3) throw new Error('No wallet connected');
        
        const signature = await this.web3.eth.personal.sign(
            message,
            this.currentAccount,
            ''
        );
        
        return signature;
    }

    async sendTransaction(to, value, data = '') {
        if (!this.web3) throw new Error('No wallet connected');
        
        const tx = {
            from: this.currentAccount,
            to: to,
            value: this.web3.utils.toWei(value.toString(), 'ether'),
            data: data,
            gas: 21000
        };
        
        const txHash = await this.web3.eth.sendTransaction(tx);
        return txHash;
    }

    // Enhanced wallet detection for mobile and desktop
    detectWalletEnvironment() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        
        return {
            isMobile,
            isDesktop: !isMobile,
            isIOS: /iphone|ipad|ipod/i.test(userAgent),
            isAndroid: /android/i.test(userAgent),
            isWeb: !isMobile
        };
    }

    // Get recommended wallets based on environment
    getRecommendedWallets() {
        const env = this.detectWalletEnvironment();
        const recommendations = [];
        
        if (env.isMobile) {
            if (env.isIOS) {
                recommendations.push('metamask', 'trust', 'coinbase');
            } else if (env.isAndroid) {
                recommendations.push('metamask', 'trust', 'binance');
            }
        } else {
            recommendations.push('metamask', 'walletconnect', 'coinbase');
        }
        
        return recommendations;
    }
}

    // Set global reference
    window.walletManager = this;

// Make it globally accessible for the app
window.walletManager = walletManager;