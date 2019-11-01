// JavaScript source code
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, 'secret');
        req.userData = decoded;
        // if (req.baseUrl == "/api/v0/users" && req.method == "GET") var checkRoles = "get_all_user";
        // const results = decoded.roles.find(x => x == checkRoles);
        // if (!results) return res.status(403).json({ message: 'Auth failed requet token false' });
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed requet token false'
        });
    }
};
