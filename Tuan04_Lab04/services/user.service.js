const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository');

exports.registerUser = async (username, password, role = 'staff') => {
  const hash = await bcrypt.hash(password, 10);
  const user = {
    userId: uuidv4(),
    username,
    password: hash,
    role,
    createdAt: new Date().toISOString(),
  };
  console.log("Dữ liệu gửi sang Repo:", user);
  await userRepository.createUser(user);
};

exports.validateUserLogin = async (username, password) => {
  // Ở đây tạm dùng username làm PK để đơn giản (tuỳ cách tạo bảng)
  const user = await userRepository.getUserByUsername(username);
  if (!user) return null;
  const match = await bcrypt.compare(password, user.password);
  if (!match) return null;
  return user;
};
