const db = require('../config/db');

exports.list = (req, res) => {
  db.query('SELECT * FROM products', (err, rows) => {
    res.render('products', { products: rows });
  });
};

exports.addPage = (req, res) => {
  res.render('add');
};

exports.add = (req, res) => {
  const { name, price } = req.body;
  db.query(
    'INSERT INTO products(name, price) VALUES (?,?)',
    [name, price],
    () => res.redirect('/products')
  );
};

exports.editPage = (req, res) => {
  db.query(
    'SELECT * FROM products WHERE id=?',
    [req.params.id],
    (err, rows) => {
      res.render('edit', { product: rows[0] });
    }
  );
};

exports.update = (req, res) => {
  const { name, price } = req.body;
  db.query(
    'UPDATE products SET name=?, price=? WHERE id=?',
    [name, price, req.params.id],
    () => res.redirect('/products')
  );
};

exports.delete = (req, res) => {
  db.query(
    'DELETE FROM products WHERE id=?',
    [req.params.id],
    () => res.redirect('/products')
  );
};
