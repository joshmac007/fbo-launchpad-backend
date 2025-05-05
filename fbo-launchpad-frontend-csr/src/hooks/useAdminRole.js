import { useAuth } from '../contexts/AuthContext';

export default function useAdminRole() {
  const { user } = useAuth();
  // Remove role check - rely on backend permissions
  return true;
}
