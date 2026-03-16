const { Product } = require("../models/productModel");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

// Hàm xóa ảnh trỏ về thư mục img ở gốc
const deleteOldImage = (imagePath) => {
    if (imagePath && imagePath !== '/images/default.png') {
        const fileName = path.basename(imagePath);
        const fullPath = path.join(__dirname, '../img', fileName);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
};

const productController = {
    getAll: async(req, res) => {
        try {
            let products = await Product.getAll();
            const searchQuery = req.query.search;

            if (searchQuery) {
                products = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
            }

            res.render("index", {
                products,
                searchQuery,
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            res.render("index", { products: [], error: "Lỗi tải dữ liệu" });
        }
    },

    getDetail: async(req, res) => {
        const product = await Product.getById(req.params.id);
        res.render("detail", { product });
    },

    getAddForm: (req, res) => {
        res.render("add");
    },

    add: async(req, res) => {
        try {
            const { name, price, unit_in_stock } = req.body;
            // Đổi /uploads/ thành /img/
            const url_image = req.file ? `/img/${req.file.filename}` : '/images/default.png';

            const newProduct = {
                id: uuidv4(),
                name,
                price: Number(price),
                unit_in_stock: Number(unit_in_stock),
                url_image
            };
            await Product.add(newProduct);
            res.redirect("/?success=Thêm sản phẩm thành công");
        } catch (error) {
            res.redirect("/?error=Lỗi khi thêm sản phẩm");
        }
    },

    getEditForm: async(req, res) => {
        const product = await Product.getById(req.params.id);
        res.render("edit", { product });
    },

    update: async(req, res) => {
        try {
            const { id } = req.params;
            const { name, price, unit_in_stock } = req.body;
            const updateData = { name, price, unit_in_stock };

            if (req.file) {
                const oldProduct = await Product.getById(id);
                deleteOldImage(oldProduct.url_image);
                // Đổi /uploads/ thành /img/
                updateData.url_image = `/img/${req.file.filename}`;
            }

            await Product.update(id, updateData);
            res.redirect("/?success=Cập nhật thành công");
        } catch (error) {
            res.redirect("/?error=Lỗi cập nhật");
        }
    },

    delete: async(req, res) => {
        try {
            const product = await Product.getById(req.params.id);
            if (product) {
                deleteOldImage(product.url_image);
                await Product.delete(req.params.id);
            }
            res.redirect("/?success=Xóa sản phẩm thành công");
        } catch (error) {
            res.redirect("/?error=Lỗi khi xóa");
        }
    }
};

module.exports = productController;