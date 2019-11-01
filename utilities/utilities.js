'use strict';
var jwt = require('jsonwebtoken');

module.exports = class {

    static async verifyToken(token) {
        try {

            const decoded = jwt.verify(token.split(" ")[1], 'secret');
            const data = {
                Email: decoded.email,
                UserName: decoded.username,
                UserId: decoded.userId,
            };
            return { success: true, data: data };
        } catch (ex) {
            return { success: false, code: 2, message: "SESSION_EXPIRED" };
        }
    }
}