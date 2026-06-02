// backend/middleware/authMiddleware.js

export const protect = async (req, res, next) => {
  let providedKey;
  
  // 1. Check for standard HTTP Authorization Header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    providedKey = req.headers.authorization.split(' ')[1];
  } 
  // 2. Fallback check for custom x-api-key header properties
  else if (req.headers['x-api-key']) {
    providedKey = req.headers['x-api-key'];
  }

  if (!providedKey) {
    return res.status(401).json({ success: false, message: 'Access Denied: Operational Key Missing.' });
  }
  console.log(providedKey)
  // 3. Fallback tracking to catch both key naming styles used across server.js and .env
  const MASTER_KEY = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_API_KEY;
  if (providedKey !== MASTER_KEY) {
    return res.status(403).json({ success: false, message: 'Authentication Refused: Key is unauthorized.' });
  }

  next();
};