const userService = require('../services/user.service');

exports.loginPage = (req, res) => {
    res.render('login');
};

exports.registerPage = (req, res) => {
    res.render('register');
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};

exports.register = async (req, res) => {
    const { username, password, confirmPassword, role } = req.body;
    if (password !== confirmPassword) {
        return res.status(400).send('Mật khẩu xác nhận không khớp');
    }

    try {
        await userService.registerUser(username, password, role || 'staff');
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi tạo tài khoản');
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await userService.validateUserLogin(username, password);
        if (!user) {
            return res.status(401).send('Sai tài khoản hoặc mật khẩu');
        }

        req.session.user = {
            userId: user.userId,
            username: user.username,
            role: user.role || 'staff',
        };

        res.redirect('/products');
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi đăng nhập');
    }
};