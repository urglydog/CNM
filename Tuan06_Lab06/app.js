const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
require("dotenv").config();
const { initTable } = require("./models/productModel");
const productController = require("./controllers/productController");

const app = express();

// Khởi tạo thư mục img ở thư mục gốc nếu chưa có
const uploadDir = path.join(__dirname, 'img');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình Multer để upload ảnh thẳng vào thư mục img/
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "img/"),
    // Giữ nguyên tên gốc của file
    filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// Cấu hình Express
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Vẫn giữ public cho CSS/JS nếu có
app.use('/img', express.static(path.join(__dirname, 'img'))); // Cho phép truy cập ảnh qua route /img

// Routes
app.get("/", productController.getAll);
app.get("/add", productController.getAddForm);
app.post("/add", upload.single("image"), productController.add);
app.get("/detail/:id", productController.getDetail);
app.get("/edit/:id", productController.getEditForm);
app.post("/edit/:id", upload.single("image"), productController.update);
app.post("/delete/:id", productController.delete);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async() => {
    console.log(`Server is running on http://localhost:${PORT}`);
    await initTable();
});