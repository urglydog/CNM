const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.loginPage = (req, res) => {
  res.render('login');
};

exports.registerPage = (req, res) => {
  res.render('register');
};

exports.register = async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  db.query(
    'INSERT INTO users(username, password) VALUES (?,?)',
    [username, hash],
    err => {
      if (err) return res.send('User exists!');
      res.redirect('/login');
    }
  );
};

exports.login = (req, res) => {
  const { username, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE username=?',
    [username],
    async (err, results) => {
      if (results.length === 0) return res.send('User not found');

      const match = await bcrypt.compare(password, results[0].password);
      if (!match) return res.send('Wrong password');

      req.session.user = results[0];
      res.redirect('/products');
    }
  );
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};
