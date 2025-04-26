/**
 * Formats a value based on the specified type
 * @param {*} value - The value to format
 * @param {string} type - The type of formatting to apply ('datetime', 'date', 'currency', etc.)
 * @returns {string} The formatted value
 */
export const formatDisplayValue = (value, type = 'text') => {
  if (value === null || value === undefined) {
    return '-';
  }

  switch (type) {
    case 'datetime':
      return new Date(value).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    
    case 'date':
      return new Date(value).toLocaleDateString('en-US', {
        dateStyle: 'medium'
      });
    
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    
    case 'number':
      return new Intl.NumberFormat('en-US').format(value);
    
    default:
      return String(value);
  }
}; 