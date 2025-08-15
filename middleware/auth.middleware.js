// Import the jsonwebtoken library to handle JWT signing and verification
import jwt from 'jsonwebtoken';

// Import the User model to retrieve user info from the database
import User from '../model/user.model.js';

// Middleware to verify the JWT token and attach the user info to the request object
// This middleware is meant to protect routes that require authentication
const auth = async (req, res, next) => {
  // Extract the Authorization header from the incoming HTTP request
  const authHeader = req.headers.authorization;

  // Check if the Authorization header exists and starts with "Bearer "
  // "Bearer <token>" is the standard format for sending JWTs in HTTP headers
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res.status(401).json({ message: 'Unauthorized' }); // Respond with 401 if missing or malformed
  }

  // Extract the token string from the Authorization header
  // Example: "Bearer abc123" → token = "abc123"
  const token = authHeader.split(' ')[1];

  try {
    // Decode and verify the token using the secret key stored in environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user in the database using the ID from the decoded token payload
    // Exclude the password field from the returned user object for security
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) return res.status(401).json({ message: 'User not found' });

    // Move to the next middleware or route handler
    next();
  } catch (err) {
    // If token verification fails or any error occurs, respond with 403 Forbidden
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Export the middleware so it can be used in other files (e.g., in route protection)
export default auth;
