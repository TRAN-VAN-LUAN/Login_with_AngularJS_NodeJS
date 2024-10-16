const { Sequelize } = require('sequelize');

// Cấu hình thông tin kết nối
const dbUsername = 'sa'; // username của SQL Server
const dbPassword = '123456'; // mật khẩu của SQL Server
const dbHost = 'localhost'; // địa chỉ của SQL Server
const dbPort = 1433; // cổng mặc định của SQL Server
const dbName = 'Users'; // tên cơ sở dữ liệu

// Tạo kết nối đến SQL Server
const sequelize = new Sequelize(dbName, dbUsername, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: true, // Nếu SQL Server không yêu cầu kết nối được mã hóa
      trustServerCertificate: true, // Bật nếu bạn đang phát triển cục bộ với chứng chỉ tự ký
    },
  },
  logging: false, // tắt logging các câu lệnh SQL
});

// Kiểm tra kết nối
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
