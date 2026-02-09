const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // User endpoints
  async getUser(walletAddress: string) {
    return this.request<{ type: string; data: any }>(`/users/${walletAddress}`);
  }

  async registerBorrower(data: {
    walletAddress: string;
    name: string;
    email?: string;
    phone?: string;
    country: string;
    city?: string;
  }) {
    return this.request('/users/borrower', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async registerBankUser(data: {
    walletAddress: string;
    bankType: 'national' | 'local';
    nationalBankId?: number;
    localBankId?: number;
    name: string;
    email?: string;
    role?: 'approver' | 'viewer';
  }) {
    return this.request('/users/bank-user', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Bank endpoints
  async getWorldBank() {
    return this.request('/banks/world');
  }

  async getNationalBanks() {
    return this.request<any[]>('/banks/national');
  }

  async getLocalBanks(nationalBankId?: number) {
    const query = nationalBankId ? `?nationalBankId=${nationalBankId}` : '';
    return this.request<any[]>(`/banks/local${query}`);
  }

  // Loan endpoints
  async getBorrowerLoans(walletAddress: string) {
    return this.request<any[]>(`/loans/borrower/${walletAddress}`);
  }

  async getPendingLoans(localBankId: number) {
    return this.request<any[]>(`/loans/pending/${localBankId}`);
  }

  async createLoanRequest(data: {
    walletAddress: string;
    localBankId: number;
    amount: string;
    purpose: string;
    blockchainTxHash?: string;
  }) {
    return this.request('/loans/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveLoan(loanId: number, data: {
    bankUserId: number;
    blockchainTxHash?: string;
    deadline?: string;
  }) {
    return this.request(`/loans/approve/${loanId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async rejectLoan(loanId: number, data: {
    bankUserId: number;
    rejectionReason?: string;
  }) {
    return this.request(`/loans/reject/${loanId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Transaction endpoints
  async getBorrowerTransactions(walletAddress: string, period?: '6months' | '1year') {
    const query = period ? `?period=${period}` : '';
    return this.request<any[]>(`/transactions/borrower/${walletAddress}${query}`);
  }

  async getBorrowingLimits(walletAddress: string) {
    return this.request<any>(`/transactions/limits/${walletAddress}`);
  }
}

export const api = new ApiService();

