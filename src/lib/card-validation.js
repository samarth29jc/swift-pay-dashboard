/**
 * Validates a credit card number using the Luhn algorithm
 * @param {string} cardNumber The credit card number to validate
 * @returns {boolean} boolean indicating if the card number is valid
 */
export function validateCardNumber(cardNumber) {
  // Remove all non-digit characters
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }
  
  // Implement Luhn algorithm
  let sum = 0;
  let shouldDouble = false;
  
  // Starting from the rightmost digit and moving left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
}

/**
 * Formats a credit card number with spaces for readability
 * @param {string} cardNumber The raw card number input
 * @returns {string} Formatted card number with spaces
 */
export function formatCardNumber(cardNumber) {
  const digits = cardNumber.replace(/\D/g, '');
  const groups = [];
  
  for (let i = 0; i < digits.length; i += 4) {
    groups.push(digits.substring(i, i + 4));
  }
  
  return groups.join(' ');
}

/**
 * Masks a credit card number, showing only the last 4 digits
 * @param {string} cardNumber The full card number
 * @returns {string} Masked card number (e.g., "•••• •••• •••• 1234")
 */
export function maskCardNumber(cardNumber) {
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 4) {
    return '•'.repeat(digits.length);
  }
  
  // Keep last 4 digits visible, mask the rest
  const lastFour = digits.slice(-4);
  const maskedSection = '•'.repeat(digits.length - 4);
  
  // Format with spaces for readability
  let masked = '';
  for (let i = 0; i < maskedSection.length; i++) {
    masked += maskedSection[i];
    if ((i + 1) % 4 === 0 && i !== maskedSection.length - 1) {
      masked += ' ';
    }
  }
  
  // Add space before last 4 if needed
  if (maskedSection.length > 0) {
    masked += ' ';
  }
  
  return masked + lastFour;
}

/**
 * Validates expiry date format and ensures it's not expired
 * @param {string} month Expiry month (1-12)
 * @param {string} year Expiry year (2 or 4 digits)
 * @returns {boolean} boolean indicating if the expiry date is valid
 */
export function validateExpiryDate(month, year) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // JS months are 0-indexed
  
  // Convert to numbers
  const expMonth = parseInt(month, 10);
  let expYear = parseInt(year, 10);
  
  // Handle 2-digit years
  if (year.length === 2) {
    expYear += 2000;
  }
  
  // Basic validation
  if (isNaN(expMonth) || isNaN(expYear)) {
    return false;
  }
  
  if (expMonth < 1 || expMonth > 12) {
    return false;
  }
  
  // Check if card is expired
  if (expYear < currentYear) {
    return false;
  }
  
  if (expYear === currentYear && expMonth < currentMonth) {
    return false;
  }
  
  return true;
}

/**
 * Validates a CVV/CVC code
 * @param {string} cvv The CVV/CVC code
 * @returns {boolean} boolean indicating if the CVV is valid
 */
export function validateCVV(cvv) {
  const digits = cvv.replace(/\D/g, '');
  return /^\d{3,4}$/.test(digits);
}

/**
 * Generates a random order ID
 * @returns {string} A random order ID string
 */
export function generateOrderId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `order-${timestamp}-${randomStr}`;
}
