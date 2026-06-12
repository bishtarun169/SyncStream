const jwt = require('jsonwebtoken');

// Verifyng authentication
const authMiddle = (req, res, next) => {
     try {
          const token = req.header('Authorization')?.replace('Bearer ', '');
          if (!token) {
               return res.status(401).json({ message: 'No token, authorization denied' });
          }

          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          
          req.user = {
               userId: decoded.userId
          };
          next();
     } catch (error) {
          console.error(error.message);
          res.status(401).json({ message: 'Token is not valid' });
     }
};

module.exports = authMiddle;