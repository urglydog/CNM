const client = require('../config/db');
const { PutItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const bcrypt = require('bcrypt');

// --- THÊM CÁC HÀM NÀY ĐỂ HẾT LỖI 404/TYPEERROR ---

exports.loginPage = (req, res) => {
    res.render('login'); // Trả về file login.ejs
};

exports.registerPage = (req, res) => {
    res.render('register'); // Trả về file register.ejs
};

exports.logout = (req, res) => {
    req.session.destroy(); // Xóa session khi logout
    res.redirect('/login');
};

// --- CÁC HÀM CŨ CỦA BẠN ---

exports.register = async (req, res) => {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    try {
        await client.send(new PutItemCommand({
    TableName: process.env.TABLE_USERS, // Nó sẽ lấy chữ "Users" từ .env
    Item: marshall({ username, password: hash })
}));
        res.redirect('/login');
    } catch (err) { res.send('Error creating user'); }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const { Item } = await client.send(new GetItemCommand({
            TableName: "Users",
            Key: marshall({ username })
        }));

        if (!Item) return res.send('User not found');
        const user = unmarshall(Item);
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.send('Wrong password');

        req.session.user = user;
        res.redirect('/products');
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi đăng nhập DynamoDB");
    }
};