require('dotenv').config();
const express = require('express');
const app = express();
const productRoutes = require('./controllers/productController');

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use('/', productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server đang chạy ở PORT ${PORT}`));
