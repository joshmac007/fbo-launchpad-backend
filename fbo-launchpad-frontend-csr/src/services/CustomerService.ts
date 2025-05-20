import apiService from './apiService'; // Import shared apiService

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

const CUSTOMERS_ENDPOINT = '/customers'; // No API_BASE_URL prefix needed

const CustomerService = {
  async getCustomers(): Promise<CustomerListResponse> { 
    const response = await apiService.get<CustomerListResponse>(CUSTOMERS_ENDPOINT);
    return response.data;
  },
  async getCustomerById(id: string | number): Promise<Customer> {
    const response = await apiService.get<Customer>(`${CUSTOMERS_ENDPOINT}/${id}`);
    return response.data;
  },
  async createCustomer(data: CustomerCreateDto): Promise<Customer> {
    const response = await apiService.post<Customer>(CUSTOMERS_ENDPOINT, data);
    return response.data;
  },
  async updateCustomer(id: string | number, data: CustomerUpdateDto): Promise<Customer> {
    const response = await apiService.put<Customer>(`${CUSTOMERS_ENDPOINT}/${id}`, data);
    return response.data;
  },
  async deleteCustomer(id: string | number): Promise<void> {
    await apiService.delete(`${CUSTOMERS_ENDPOINT}/${id}`);
  },
  // Add any other customer-related service methods here
};

export default CustomerService; 