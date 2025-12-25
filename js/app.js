// FlowPay Main Application
class FlowPay {
    constructor() {
        this.currentCompany = null;
        this.employees = [];
        this.currentAccount = null;
        this.web3 = null;
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

    setupEventListeners() {
        // Wallet connection
        document.getElementById('connectWalletBtn').addEventListener('click', () => this.connectWallet());
        document.getElementById('disconnectWallet').addEventListener('click', () => this.disconnectWallet());
        
        // Company registration
        document.getElementById('registerCompanyBtn').addEventListener('click', () => this.showCompanyModal());
        document.getElementById('closeCompanyModal').addEventListener('click', () => this.hideCompanyModal());
        document.getElementById('companyForm').addEventListener('submit', (e) => this.registerCompany(e));
        
        // Employee management
        document.getElementById('addEmployeeBtn').addEventListener('click', () => this.showEmployeeModal());
        document.getElementById('closeEmployeeModal').addEventListener('click', () => this.hideEmployeeModal());
        document.getElementById('employeeForm').addEventListener('submit', (e) => this.addEmployee(e));
        
        // Analytics
        document.getElementById('viewAnalyticsBtn').addEventListener('click', () => this.showAnalytics());
    }

    async connectWallet() {
        try {
            this.showLoading(true);
            
            if (window.ethereum) {
                // Request account access
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                this.currentAccount = accounts[0];
                this.web3 = new Web3(window.ethereum);
                
                this.updateWalletUI();
                this.showLoading(false);
            } else {
                // Show wallet selection modal
                document.getElementById('walletModal').classList.remove('hidden');
                this.showLoading(false);
            }
        } catch (error) {
            console.error('Wallet connection error:', error);
            this.showLoading(false);
            payStream.showNotification('Failed to connect wallet', 'error');
        }
    }

    disconnectWallet() {
        this.currentAccount = null;
        this.web3 = null;
        this.updateWalletUI();
        this.showNotification('Wallet disconnected', 'info');
    }

    updateWalletUI() {
        const connectBtn = document.getElementById('connectWalletBtn');
        const walletInfo = document.getElementById('walletInfo');
        const walletAddress = document.getElementById('walletAddress');

        if (this.currentAccount) {
            connectBtn.classList.add('hidden');
            walletInfo.classList.remove('hidden');
            walletAddress.textContent = `${this.currentAccount.substring(0, 6)}...${this.currentAccount.substring(38)}`;
        } else {
            connectBtn.classList.remove('hidden');
            walletInfo.classList.add('hidden');
        }
    }

    showCompanyModal() {
        document.getElementById('companyModal').classList.remove('hidden');
    }

    hideCompanyModal() {
        document.getElementById('companyModal').classList.add('hidden');
        document.getElementById('companyForm').reset();
    }

    async registerCompany(e) {
        e.preventDefault();
        
        if (!this.currentAccount) {
            flowPay.showNotification('Please connect your wallet first', 'warning');
            return;
        }

        this.showLoading(true);

        try {
            const formData = {
                name: document.getElementById('companyName').value,
                email: document.getElementById('companyEmail').value,
                wallet_address: this.currentAccount,
                payment_schedule: document.getElementById('paymentSchedule').value,
                total_monthly_budget: parseFloat(document.getElementById('monthlyBudget').value),
                is_active: true
            };

            // Generate unique ID
            formData.id = this.generateId();
            formData.created_at = new Date().toISOString();

            // Save to database
            await this.createRecord('companies', formData);
            
            this.currentCompany = formData;
            this.hideCompanyModal();
            this.updateDashboard();
            this.showNotification('Company registered successfully!', 'success');
            
        } catch (error) {
            console.error('Company registration error:', error);
            this.showNotification('Failed to register company', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showEmployeeModal() {
        if (!this.currentCompany) {
            this.showNotification('Please register a company first', 'warning');
            return;
        }
        document.getElementById('employeeModal').classList.remove('hidden');
    }

    hideEmployeeModal() {
        document.getElementById('employeeModal').classList.add('hidden');
        document.getElementById('employeeForm').reset();
    }

    async addEmployee(e) {
        e.preventDefault();
        
        this.showLoading(true);

        try {
            const formData = {
                company_id: this.currentCompany.id,
                name: document.getElementById('employeeName').value,
                email: document.getElementById('employeeEmail').value,
                wallet_address: document.getElementById('employeeWallet').value,
                position: document.getElementById('employeePosition').value,
                department: document.getElementById('employeeDepartment').value,
                salary: parseFloat(document.getElementById('employeeSalary').value),
                join_date: new Date().toISOString(),
                is_active: true
            };

            // Generate unique ID
            formData.id = this.generateId();

            // Save to database
            await this.createRecord('employees', formData);
            
            this.hideEmployeeModal();
            this.loadEmployees();
            this.showNotification('Employee added successfully!', 'success');
            
        } catch (error) {
            console.error('Add employee error:', error);
            this.showNotification('Failed to add employee', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadCompanyData() {
        try {
            if (this.currentAccount) {
                const response = await fetch(`tables/companies?search=${this.currentAccount}`);
                const data = await response.json();
                
                if (data.data && data.data.length > 0) {
                    this.currentCompany = data.data[0];
                }
            }
        } catch (error) {
            console.error('Load company data error:', error);
        }
    }

    async loadEmployees() {
        try {
            if (this.currentCompany) {
                const response = await fetch(`tables/employees?search=${this.currentCompany.id}`);
                const data = await response.json();
                
                this.employees = data.data || [];
                this.renderEmployeeTable();
                this.updateEmployeeStats();
            }
        } catch (error) {
            console.error('Load employees error:', error);
        }
    }

    renderEmployeeTable() {
        const tbody = document.getElementById('employeeTableBody');
        
        if (this.employees.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                        <i class="fas fa-users text-4xl mb-2"></i>
                        <p>No employees added yet</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.employees.map(employee => `
            <tr class="border-b hover:bg-gray-50">
                <td class="px-4 py-3">${employee.name}</td>
                <td class="px-4 py-3">${employee.email}</td>
                <td class="px-4 py-3">${employee.position}</td>
                <td class="px-4 py-3">${employee.salary.toLocaleString()}</td>
                <td class="px-4 py-3">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${employee.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <button onclick="payStream.toggleEmployeeStatus('${employee.id}')" 
                            class="text-${employee.is_active ? 'red' : 'green'}-600 hover:text-${employee.is_active ? 'red' : 'green'}-800">
                        <i class="fas fa-${employee.is_active ? 'pause' : 'play'}"></i>
                    </button>
                    <button onclick="payStream.removeEmployee('${employee.id}')" 
                            class="text-red-600 hover:text-red-800 ml-2">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async toggleEmployeeStatus(employeeId) {
        try {
            const employee = this.employees.find(emp => emp.id === employeeId);
            if (!employee) return;

            employee.is_active = !employee.is_active;
            
            await this.updateRecord('employees', employeeId, { is_active: employee.is_active });
            
            this.loadEmployees();
            this.showNotification(`Employee ${employee.is_active ? 'activated' : 'deactivated'} successfully!`, 'success');
            
        } catch (error) {
            console.error('Toggle employee status error:', error);
            this.showNotification('Failed to update employee status', 'error');
        }
    }

    async removeEmployee(employeeId) {
        if (!confirm('Are you sure you want to remove this employee?')) return;

        try {
            await this.deleteRecord('employees', employeeId);
            this.loadEmployees();
            this.showNotification('Employee removed successfully!', 'success');
        } catch (error) {
            console.error('Remove employee error:', error);
            this.showNotification('Failed to remove employee', 'error');
        }
    }

    updateDashboard() {
        this.updateCompanyInfo();
        this.updateEmployeeStats();
        this.updatePaymentStatus();
    }

    updateCompanyInfo() {
        const companyInfo = document.getElementById('companyInfo');
        
        if (this.currentCompany) {
            companyInfo.innerHTML = `
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Name:</span>
                        <span class="font-semibold">${this.currentCompany.name}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Schedule:</span>
                        <span class="font-semibold capitalize">${this.currentCompany.payment_schedule}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Budget:</span>
                        <span class="font-semibold">${this.currentCompany.total_monthly_budget.toLocaleString()} MNEE</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Status:</span>
                        <span class="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Active</span>
                    </div>
                </div>
            `;
        } else {
            companyInfo.innerHTML = `
                <div class="text-center text-gray-500">
                    <i class="fas fa-building text-4xl mb-2"></i>
                    <p>No company registered yet</p>
                </div>
            `;
        }
    }

    updateEmployeeStats() {
        const totalEmployees = this.employees.length;
        const activeEmployees = this.employees.filter(emp => emp.is_active).length;
        const monthlyBudget = this.employees.reduce((sum, emp) => sum + (emp.is_active ? emp.salary : 0), 0);

        document.getElementById('totalEmployees').textContent = totalEmployees;
        document.getElementById('activeEmployees').textContent = activeEmployees;
        document.getElementById('monthlyBudget').textContent = `${monthlyBudget.toLocaleString()} MNEE`;
    }

    updatePaymentStatus() {
        // This would be updated with actual blockchain data
        const lastPayment = new Date();
        const nextPayment = new Date();
        nextPayment.setMonth(nextPayment.getMonth() + 1);

        document.getElementById('lastPayment').textContent = lastPayment.toLocaleDateString();
        document.getElementById('nextPayment').textContent = nextPayment.toLocaleDateString();
        document.getElementById('successRate').textContent = '100%';
    }

    showAnalytics() {
        document.getElementById('analyticsSection').classList.remove('hidden');
        this.loadAnalytics();
    }

    async loadAnalytics() {
        try {
            // Load payment data for charts
            const response = await fetch(`tables/payments?search=${this.currentCompany?.id || ''}`);
            const data = await response.json();
            
            this.renderAnalytics(data.data || []);
        } catch (error) {
            console.error('Load analytics error:', error);
        }
    }

    renderAnalytics(payments) {
        // Payment trends chart
        const ctx1 = document.getElementById('paymentChart').getContext('2d');
        new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Monthly Payments (MNEE)',
                    data: [12000, 15000, 18000, 22000, 25000, 28000],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Department distribution chart
        const ctx2 = document.getElementById('departmentChart').getContext('2d');
        const departments = this.getDepartmentData();
        
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: Object.keys(departments),
                datasets: [{
                    data: Object.values(departments),
                    backgroundColor: [
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(239, 68, 68)',
                        'rgb(147, 51, 234)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        });
    }

    getDepartmentData() {
        const departments = {};
        this.employees.forEach(emp => {
            if (emp.is_active) {
                departments[emp.department] = (departments[emp.department] || 0) + 1;
            }
        });
        return departments;
    }

    // API Helper Methods
    async createRecord(table, data) {
        const response = await fetch(`tables/${table}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    }

    async updateRecord(table, id, data) {
        const response = await fetch(`tables/${table}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    }

    async deleteRecord(table, id) {
        const response = await fetch(`tables/${table}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    }

    // Utility Methods
    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    showLoading(show) {
        document.getElementById('loadingSpinner').classList.toggle('hidden', !show);
    }

    showNotification(message, type = 'info') {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Global helper methods
    getDepartmentData() {
        const departments = {};
        this.employees.forEach(emp => {
            if (emp.is_active) {
                departments[emp.department] = (departments[emp.department] || 0) + 1;
            }
        });
        return departments;
    }
}

// Initialize the application
const flowPay = new FlowPay();