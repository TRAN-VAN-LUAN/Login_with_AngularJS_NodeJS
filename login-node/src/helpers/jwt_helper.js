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

const signVerificationToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = { userId };
    const secret = process.env.JWT_SECRET;
    const options = { expiresIn: '1h' };

    jwt.sign(payload, secret, options, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};

const verifyVerificationToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) return reject(err);
      resolve(payload.userId);
    });
  });
};

module.exports = { signAccessToken, signRefreshToken, verifyRefreshToken, signVerificationToken, verifyVerificationToken };
