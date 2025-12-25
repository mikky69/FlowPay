// Production-ready Local Storage Adapter for FlowPay
// Replaces the RESTful Table API with browser localStorage

class LocalStorageAdapter {
    constructor() {
        this.storageKeys = {
            companies: 'flowpay_companies',
            employees: 'flowpay_employees',
            payments: 'flowpay_payments'
        };
        
        this.init();
    }

    init() {
        // Initialize storage if empty
        Object.keys(this.storageKeys).forEach(key => {
            const storageKey = this.storageKeys[key];
            if (!localStorage.getItem(storageKey)) {
                localStorage.setItem(storageKey, JSON.stringify([]));
            }
        });
    }

    // Simulate REST API calls
    async request(url, options = {}) {
        const [_, table, id] = url.split('/');
        const method = options.method || 'GET';
        const data = options.body ? JSON.parse(options.body) : null;

        switch (method) {
            case 'GET':
                return this.get(table, id, url);
            case 'POST':
                return this.post(table, data);
            case 'PATCH':
                return this.patch(table, id, data);
            case 'DELETE':
                return this.delete(table, id);
            default:
                throw new Error(`Method ${method} not supported`);
        }
    }

    async get(table, id, url) {
        const data = JSON.parse(localStorage.getItem(this.storageKeys[table]) || '[]');
        
        // Handle search parameters
        if (url.includes('?search=')) {
            const searchTerm = url.split('?search=')[1];
            const filtered = data.filter(item => 
                Object.values(item).some(val => 
                    String(val).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
            return { data: filtered, total: filtered.length };
        }
        
        if (id) {
            const item = data.find(item => item.id === id);
            if (!item) throw new Error('Item not found');
            return item;
        }
        
        return { data, total: data.length };
    }

    async post(table, data) {
        const existing = JSON.parse(localStorage.getItem(this.storageKeys[table]) || '[]');
        data.id = data.id || this.generateId();
        existing.push(data);
        localStorage.setItem(this.storageKeys[table], JSON.stringify(existing));
        return data;
    }

    async patch(table, id, updates) {
        const data = JSON.parse(localStorage.getItem(this.storageKeys[table]) || '[]');
        const index = data.findIndex(item => item.id === id);
        if (index === -1) throw new Error('Item not found');
        
        data[index] = { ...data[index], ...updates };
        localStorage.setItem(this.storageKeys[table], JSON.stringify(data));
        return data[index];
    }

    async delete(table, id) {
        const data = JSON.parse(localStorage.getItem(this.storageKeys[table]) || '[]');
        const filtered = data.filter(item => item.id !== id);
        localStorage.setItem(this.storageKeys[table], JSON.stringify(filtered));
        return { success: true };
    }

    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    // Helper method to simulate fetch API
    async fetch(url, options = {}) {
        try {
            const result = await this.request(url, options);
            return {
                ok: true,
                status: 200,
                json: async () => result,
                text: async () => JSON.stringify(result)
            };
        } catch (error) {
            return {
                ok: false,
                status: 400,
                statusText: error.message,
                json: async () => ({ error: error.message })
            };
        }
    }
}

// Production-ready FlowPay App with Local Storage
class FlowPay {
    constructor() {
        this.currentCompany = null;
        this.employees = [];
        this.currentAccount = null;
        this.web3 = null;
        this.db = new LocalStorageAdapter(); // Use local storage instead of REST API
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.loadCompanyData();
        this.loadEmployees();
        this.updateDashboard();
        
        // Set global reference
        window.flowPay = this;
    }

    // Replace all API calls with local storage calls
    async createRecord(table, data) {
        return await this.db.post(table, data);
    }

    async updateRecord(table, id, data) {
        return await this.db.patch(table, id, data);
    }

    async deleteRecord(table, id) {
        return await this.db.delete(table, id);
    }

    async fetch(url, options = {}) {
        return await this.db.fetch(url, options);
    }

    // ... rest of the app.js methods remain the same ...
    // Just replace all fetch() calls with this.fetch()
}

// Export for global use
window.FlowPay = FlowPay;
window.LocalStorageAdapter = LocalStorageAdapter;