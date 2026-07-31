import jwt from 'jsonwebtoken';

/**
 * Middleware: Verify JWT token and extract user from payload
 * Sets req.user with decoded token data
 */
export function authenticateToken(req, res, next) {
  try {
    // Get token from Authorization header (Bearer <token>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token after "Bearer "

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided',
      });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('🔴 Token verification failed:', err.message);
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Invalid or expired token',
        });
      }

      // Token valid, attach user to request
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('🔴 Auth middleware error:', error.message);
    res.status(500).json({
      error: 'Server error',
      message: 'Authentication failed',
    });
  }
}

/**
 * Middleware: Check if user has required role
 * Usage: app.get('/admin', requireRole('admin'), handler)
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        console.warn(`⚠️  User ${req.user.id} attempted unauthorized access with role ${req.user.role}`);
        return res.status(403).json({
          error: 'Forbidden',
          message: `This action requires one of: ${allowedRoles.join(', ')}`,
        });
      }

      next();
    } catch (error) {
      console.error('🔴 Role check error:', error.message);
      res.status(500).json({
        error: 'Server error',
        message: 'Authorization check failed',
      });
    }
  };
}

/**
 * Optional: Middleware for optional authentication
 * Doesn't fail if no token, but attaches user if valid token provided
 */
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (!err) {
          req.user = user;
        }
      });
    }

    next();
  } catch (error) {
    // Optional auth, so continue even if there's an error
    next();
  }
}
