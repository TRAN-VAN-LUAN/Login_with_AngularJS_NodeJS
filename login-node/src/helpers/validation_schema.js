const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().required(), // Name là bắt buộc
  email: Joi.string().email().required(), // Email là bắt buộc và phải đúng định dạng
  password: Joi.string().min(6).required() // Password phải ít nhất 6 ký tự
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(), // Email là bắt buộc và phải đúng định dạng
  password: Joi.string().min(6).required() // Password phải ít nhất 6 ký tự
});

module.exports = { registerSchema, loginSchema };
