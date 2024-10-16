const { DataTypes, Sequelize  } = require('sequelize');
const sequelize = require('../helpers/init_db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.fn('GETDATE'), // Sử dụng SQL Server để lấy thời gian hiện tại
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.fn('GETDATE'),
  },
}, {
  tableName: 'Users', // Tên bảng trong SQL Server
  timestamps: true, // Thêm thời gian tạo và cập nhật
  hooks: {
    // Băm password 
    async beforeSave(user) {
      if (user.changed('password')) {
        const hashedPassword = await bcrypt.hash(user.password, 10); // băm password with  rounds of 10
        user.password = hashedPassword;
        console.log('Hashed password:', user.password);
      }
    }
  },
});

User.prototype.isValidPassword = async function (password) {
  try {
    // compare two password
    const match = await bcrypt.compare(password, this.password);
    return match;
  } catch (err) {
    console.error('Error comparing passwords:', err);
    return false;
  }
};

module.exports = User;
