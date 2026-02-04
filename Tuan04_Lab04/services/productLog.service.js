const { v4: uuidv4 } = require('uuid');
const productLogRepository = require('../repositories/productLog.repository');

exports.logAction = async (productId, action, user) => {
  if (!user) return; // nếu chưa đăng nhập thì bỏ qua log
  const log = {
    logId: uuidv4(),
    productId,
    action, // CREATE / UPDATE / DELETE
    userId: user.userId || user.username,
    time: new Date().toISOString(),
  };
  await productLogRepository.createLog(log);
};
