"use strict"
const dbConfig = require('../../utilities/dbConfig');

module.exports = class {

    static async getCommentById(id) {
        try {
            const db = await dbConfig.getConnections();
            if (!db) return { success: false, code: 429, message: "Hệ thống đang quá tải. Vui lòng thử lại sau ít phút.!" }

            const result = await db.collection('Comment').find({
                $and: [
                    { IssueId: id }
                ]
            }).toArray();
            if (!result) return { success: false, code: 404, message: "Không tìm thấy thông tin.!" };
            return { success: true, data: result };
        } catch (ex) {
            return { success: false, code: 500, message: "Có lỗi xảy ra. Xin vui lòng thử lại.!" }
        }
    }
}