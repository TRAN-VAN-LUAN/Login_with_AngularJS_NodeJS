const createError = require('http-errors');
const User = require('../Models/User.model');
const { loginSchema, registerSchema } = require('../helpers/validation_schema');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signVerificationToken,
  verifyVerificationToken
} = require('../helpers/jwt_helper');
const client = require('../helpers/init_redis');
const sendVerificationEmail = require('../helpers/email_helper');

module.exports = {
  register: async (req, res, next) => {
    try {
        const result = await registerSchema.validateAsync(req.body);
        console.log(result);
        
        const doesExist = await User.findOne({ where: { email: result.email } });
        if (doesExist)
        throw createError.Conflict(`${result.email} is already registered`);

        // Tạo user trong DB (vẫn chưa xác thực)
        const user = await User.create({
        email: result.email,
        password: result.password,
        name: result.name,
        isVerified: false, // Đặt trạng thái isVerified là false cho đến khi họ xác thực email
        });

        // Tạo token xác thực email
        const verificationToken = await signVerificationToken(user.id);
        console.log('token:',verificationToken)

        // Gửi email xác thực
        await sendVerificationEmail(user.email, verificationToken);

        // Trả về response bao gồm token để người dùng có thể dùng token trong bước verifyEmail
        res.status(201).json({
            message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản của bạn.",
            verificationToken, // Trả về token xác thực
        });
    } catch (error) {
        if (error.isJoi === true) error.status = 422;
        next(error);
    }
  },

  verifyEmail: async (req, res, next) => {
    try {
        const { token } = req.params; // Lấy token từ URL

        // Xác thực token
        const userId = await verifyVerificationToken(token);

        // Tìm user và cập nhật trạng thái xác thực
        const user = await User.findByPk(userId);
        if (!user) throw createError.NotFound('User not found');

        // Đánh dấu người dùng đã xác thực
        user.isVerified = true;
        await user.save();

        res.status(200).json({
        message: "Xác thực email thành công!",
        });
    } catch (error) {
        next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await loginSchema.validateAsync(req.body);
      console.log(result);
  
      const user = await User.findOne({ where: { email: result.email } });
      console.log(user);
  
      // Nếu không tìm thấy người dùng, ném lỗi NotFound
      if (!user) throw createError.NotFound('User not registered');
  
      // Kiểm tra mật khẩu có khớp không
      const isMatch = await user.isValidPassword(result.password);
      console.log(isMatch);
      if (!isMatch) throw createError.Unauthorized('Username/password not valid');
  
      // Kiểm tra xem người dùng có xác thực email hay không
      if (!user.isVerified) {
        throw createError.Unauthorized('Email not verified');
      }
  
      // Tạo access token và refresh token nếu mọi điều kiện hợp lệ
      const accessToken = await signAccessToken(user.id);
      const refreshToken = await signRefreshToken(user.id);
  
      // Gửi kết quả trả về với token
      res.send({ accessToken, refreshToken });
    } catch (error) {
      if (error.isJoi === true) return next(createError.BadRequest('Invalid Username/Password'));
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
