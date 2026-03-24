const multer = require("multer");

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!file || !file.mimetype) {
    return cb(new Error("File khong hop le"));
  }

  if (file.mimetype.startsWith("image/")) {
    return cb(null, true);
  }

  return cb(new Error("Chi chap nhan file anh"));
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;
