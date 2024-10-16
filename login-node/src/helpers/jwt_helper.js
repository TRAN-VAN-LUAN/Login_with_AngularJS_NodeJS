const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;
console.log(secret)

// Sign access token
const signAccessToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = { userId };
    const options = { expiresIn: '1h' };
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};

// Sign refresh token
const signRefreshToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = { userId };
    const options = { expiresIn: '7d' };
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded.userId);
    });
  });
};

module.exports = { signAccessToken, signRefreshToken, verifyRefreshToken };
