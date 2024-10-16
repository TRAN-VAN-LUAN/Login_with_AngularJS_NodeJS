const createError = require('http-errors');
const User = require('../Models/User.model');
const { loginSchema, registerSchema } = require('../helpers/validation_schema');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../helpers/jwt_helper');
const client = require('../helpers/init_redis');

module.exports = {
  register: async (req, res, next) => {
    try {
      const result = await registerSchema.validateAsync(req.body);
      console.log(result)
      const doesExist = await User.findOne({ where: { email: result.email } });
      if (doesExist)
        throw createError.Conflict(`${result.email} is already been registered`);

      const user = await User.create({
        email: result.email,
        password: result.password,
        name: result.name,
      }).catch(error => {
        console.error("Sequelize error:", error);
        return res.status(500).json({ error: "Failed to create user", details: error });
      });
      const accessToken = await signAccessToken(user.id);
      const refreshToken = await signRefreshToken(user.id);

      res.send({ accessToken, refreshToken });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await loginSchema.validateAsync(req.body);
      console.log(result)
      const user = await User.findOne({ where: { email: result.email } });
      console.log(user)
      if (!user) throw createError.NotFound('User not registered');

      const isMatch = await user.isValidPassword(result.password);
      console.log(isMatch)
      if (!isMatch)
        throw createError.Unauthorized('Username/password not valid');

      const accessToken = await signAccessToken(user.id);
      const refreshToken = await signRefreshToken(user.id);

      res.send({ accessToken, refreshToken });
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest('Invalid Username/Password'));
      next(error);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest();
      const userId = await verifyRefreshToken(refreshToken);

      const accessToken = await signAccessToken(userId);
      const refToken = await signRefreshToken(userId);
      res.send({ accessToken: accessToken, refreshToken: refToken });
    } catch (error) {
      next(error);
    }
  },

  logout: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest();
      const userId = await verifyRefreshToken(refreshToken);
      client.DEL(userId, (err, val) => {
        if (err) {
          console.log(err.message);
          throw createError.InternalServerError();
        }
        console.log(val);
        res.sendStatus(204);
      });
    } catch (error) {
      next(error);
    }
  },
};
