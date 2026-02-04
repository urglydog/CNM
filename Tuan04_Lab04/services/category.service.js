const { v4: uuidv4 } = require('uuid');
const categoryRepository = require('../repositories/category.repository');

exports.listCategories = () => categoryRepository.getAllCategories();

exports.getCategory = (id) => categoryRepository.getCategoryById(id);

exports.createCategory = async (name, description) => {
  const category = {
    categoryId: uuidv4(),
    name,
    description,
  };
  await categoryRepository.createCategory(category);
};

exports.updateCategory = async (id, name, description) => {
  await categoryRepository.updateCategory(id, { name, description });
};

exports.deleteCategory = async (id) => {
  await categoryRepository.deleteCategory(id);
};
