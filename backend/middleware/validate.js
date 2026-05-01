// middleware/validate.js - Input sanitization and validation helpers

/**
 * Sanitize a string: trim whitespace, remove HTML tags
 */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/<[^>]*>/g, '');
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate registration inputs
 */
function validateRegister(req, res, next) {
  const { name, email, password } = req.body;

  if (!name || sanitize(name).length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters.' });
  }
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  // Sanitize and pass along
  req.body.name = sanitize(name);
  req.body.email = email.toLowerCase().trim();
  next();
}

/**
 * Validate bid amount - must be positive integer greater than current
 */
function validateBid(amount, currentBid) {
  const parsed = parseInt(amount, 10);
  if (isNaN(parsed) || parsed <= 0) return 'Invalid bid amount.';
  if (parsed <= currentBid) return `Bid must be greater than current bid of ${currentBid}.`;

  // Dynamic increment rules
  let minIncrement = 5;
  if (currentBid >= 1000) minIncrement = 100;
  else if (currentBid >= 500) minIncrement = 50;
  else if (currentBid >= 100) minIncrement = 10;

  if (parsed < currentBid + minIncrement) {
    return `Minimum bid increment is ${minIncrement}. Next valid bid is at least ${currentBid + minIncrement}.`;
  }
  
  if (parsed % minIncrement !== 0 && parsed !== currentBid + minIncrement) {
    return `Bid increment must align with minimum increment of ${minIncrement}.`;
  }

  return null; // null = valid
}

module.exports = { sanitize, isValidEmail, validateRegister, validateBid };
