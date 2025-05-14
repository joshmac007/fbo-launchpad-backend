import { API_BASE_URL } from '../config';
import { getAuthToken } from '../utils/auth';

// Define the Customer interface based on CustomerTable.jsx usage
export interface Customer {
  id: string | number;
  name: string;
  // Add other fields as necessary, e.g., email, phone, address, company_info, etc.
  created_at?: string; // from CustomerTable.jsx
  updated_at?: string;
}

export interface CustomerListResponse {
  customers: Customer[];
  // Add pagination info if API supports it
  total?: number;
  page?: number;
  per_page?: number;
}

// Define DTOs for create and update operations
export type CustomerCreateDto = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
export type CustomerUpdateDto = Partial<CustomerCreateDto>;

const CUSTOMERS_ENDPOINT = `${API_BASE_URL}/customers`;

// Basic fetchApi helper (can be moved to a shared util)
async function fetchApi(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
    throw new Error(errorData.message || `HTTP error ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
}

const CustomerService = {
  async getCustomers(): Promise<CustomerListResponse> { // Adjust if API returns Customer[] directly
    return fetchApi(CUSTOMERS_ENDPOINT);
  },
  async getCustomerById(id: string | number): Promise<Customer> {
    return fetchApi(`${CUSTOMERS_ENDPOINT}/${id}`);
  },
  async createCustomer(data: CustomerCreateDto): Promise<Customer> {
    return fetchApi(CUSTOMERS_ENDPOINT, { method: 'POST', body: JSON.stringify(data) });
  },
  async updateCustomer(id: string | number, data: CustomerUpdateDto): Promise<Customer> {
    return fetchApi(`${CUSTOMERS_ENDPOINT}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  async deleteCustomer(id: string | number): Promise<void> {
    await fetchApi(`${CUSTOMERS_ENDPOINT}/${id}`, { method: 'DELETE' });
  },
  // Add any other customer-related service methods here
};

export default CustomerService; 