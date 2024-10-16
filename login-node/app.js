const express = require('express');
const createError = require('http-errors');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config()
const bodyParser = require('body-parser');
const sequelize = require('./src/helpers/init_db.js');  // Kết nối với SQL Server
const userRoutes = require('./src/Routes/Auth.route.js'); // Định nghĩa các routes

const app = express();

// Middleware
app.use(morgan('dev'));  // Log requests to the console

// CORS configuration
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức HTTP được phép
  allowedHeaders: ['Content-Type', 'Authorization'] // Các header được phép
}));

app.use(bodyParser.json()); // Chuyển đổi request body thành JSON
app.use(bodyParser.urlencoded({ extended: true })); // Parse x-www-form-urlencoded

// Routes
app.use('/api/users', userRoutes); // Đường dẫn API cho users

// Trang chủ
app.get('/', (req, res) => {
  res.send('Welcome to the Express App');
});

// Xử lý lỗi 404 nếu không tìm thấy route
app.use((req, res, next) => {
  next(createError(404, 'Not Found'));
});

// Xử lý các lỗi khác (server errors, database errors, v.v.)
app.use((err, req, res, next) => {
  if (err.isJoi) { // Xử lý lỗi validation Joi (nếu có)
    return res.status(422).json({ error: err.details[0].message });
  }
  res.status(err.status || 500).json({ error: err.message });
});

// Kết nối đến cơ sở dữ liệu và khởi động server
sequelize.sync()
  .then(() => {
    console.log('Database connected successfully');
    
    // Khởi động server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = app;
