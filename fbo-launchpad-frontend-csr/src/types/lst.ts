export interface LST {
  id: number;
  name: string; // Example: "John Doe" or "LST Team 1"
  // Add other relevant LST properties if they become known, e.g.:
  // user_id?: number; // If LSTs are linked to system users
  // contact_info?: string;
  // current_load?: number; // Number of active orders
  // capabilities?: string[]; // e.g., ["Jet A", "100LL"]
}

// Potentially, a list of LSTs if fetched for a dropdown
export interface LSTListResponse {
  lsts: LST[];
  message?: string;
} 