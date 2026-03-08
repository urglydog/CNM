require('dotenv').config();

const express = require('express');
const app = express();

const productRoutes = require('./controllers/productController');

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/', productRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server đang chạy ở PORT ${PORT}`);
});