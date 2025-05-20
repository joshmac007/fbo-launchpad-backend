import { useOrdersContext } from '../contexts/OrderContext';

export const useOrders = () => {
  return useOrdersContext();
}; 