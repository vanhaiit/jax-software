"use strict"
const dbConfig = require('../../utilities/dbConfig');

module.exports = class {
    //get user id
    static async getUserById(usersId) {
        try {
            const db = await dbConfig.getConnections();
            if (!db) return { success: false, code: 429, message: "Hệ thống đang quá tải. Vui lòng thử lại sau ít phút.!" }

            const result = await db.collection('Users').find({
                $and: [
                    { _id: usersId }
                ]
            }).toArray();
            if (!result[0]) return { success: false, code: 404, message: "Không tìm thấy thông tin tài khoản này.!" };
            return { success: true, data: result[0] };
        } catch (ex) {
            return { success: false, code: 500, message: "Có lỗi xảy ra. Xin vui lòng thử lại.!" }
        }
    }
    //get gmail user
    static async getUserByEmail(email) {
        try {
            const db = await dbConfig.getConnections();
            if (!db) return { success: false, code: 429, message: "Hệ thống đang quá tải. Vui lòng thử lại sau ít phút.!" }

            const result = await db.collection('Users').find({
                $and: [
                    { Email: email }
                ]
            }).toArray();
            if (!result[0]) return { success: false, code: 404, message: "Không tìm thấy thông tin tài khoản này.!" };
            return { success: true, data: result[0] };
        } catch (ex) {
            return { success: false, code: 500, message: "Có lỗi xảy ra. Xin vui lòng thử lại.!" }
        }
    }



}