/**
 * Format number to Indian currency format
 * e.g., 1234567 -> ₹12,34,567
 */
const formatIndianCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  
  const parts = absNum.toFixed(2).split('.');
  let intPart = parts[0];
  const decPart = parts[1];
  
  // Indian numbering: last 3 digits, then groups of 2
  if (intPart.length > 3) {
    const last3 = intPart.slice(-3);
    const remaining = intPart.slice(0, -3);
    const formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    intPart = formatted + ',' + last3;
  }
  
  const result = `₹${intPart}.${decPart}`;
  return isNegative ? `-${result}` : result;
};

/**
 * Format number to compact Indian format
 * e.g., 1234567 -> ₹12.3L
 */
const formatCompactIndian = (amount) => {
  if (amount == null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toFixed(0)}`;
};

module.exports = { formatIndianCurrency, formatCompactIndian };
