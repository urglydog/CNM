const categoryService = require('../services/category.service');

exports.listPage = async (req, res) => {
  try {
    const categories = await categoryService.listCategories();
    const user = req.session.user;
    res.render('categories', { categories, user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi tải danh mục');
  }
};

exports.addPage = (req, res) => {
  res.render('category-add');
};

exports.add = async (req, res) => {
  const { name, description } = req.body;
  try {
    await categoryService.createCategory(name, description);
    res.redirect('/categories');
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi tạo danh mục');
  }
};

exports.editPage = async (req, res) => {
  try {
    const category = await categoryService.getCategory(req.params.id);
    if (!category) return res.status(404).send('Không tìm thấy danh mục');
    res.render('category-edit', { category });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi tải danh mục');
  }
};

exports.update = async (req, res) => {
  const { name, description } = req.body;
  try {
    await categoryService.updateCategory(req.params.id, name, description);
    res.redirect('/categories');
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi cập nhật danh mục');
  }
};

exports.delete = async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.redirect('/categories');
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi xoá danh mục');
  }
};
