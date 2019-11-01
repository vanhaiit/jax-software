"use strict"
const dbConfig = require('../../utilities/dbConfig');

module.exports = class {

    static async getlistModule(id) {
        try {
            const db = await dbConfig.getConnections();
            if (!db) return { success: false, code: 429, message: "Hệ thống đang quá tải. Vui lòng thử lại sau ít phút.!" }

            const result = await db.collection('Module').aggregate(
                [
                    {
                        $lookup: {
                            from: 'Issue',
                            localField: 'Tests',
                            foreignField: '_id',
                            as: 'TestIssues'
                        }
                    }, {
                        $match: {
                            _id: id
                        }
                    }, {
                        $project: {
                            __v: 0
                        }
                    }

                ]
            ).toArray();
            return { success: true, data: result };
        } catch (ex) {
            return { success: false, code: 500, message: "Có lỗi xảy ra. Xin vui lòng thử lại.!" }
        }
    }

    static async getModuleById(id) {
        try {
            const db = await dbConfig.getConnections();
            if (!db) return { success: false, code: 429, message: "Hệ thống đang quá tải. Vui lòng thử lại sau ít phút.!" }

            const result = await db.collection('Module').aggregate(
                [
                    {
                        $lookup: {
                            from: 'Issue',
                            localField: 'Tests',
                            foreignField: '_id',
                            as: 'TestIssues'
                        }
                    },
                    {
                        $lookup:
                        {
                            from: 'Profile',
                            localField: 'AssignTo',
                            foreignField: 'User',
                            as: 'AssignToUser'
                        }
                    },
                    {
                        $match: {
                            _id: id
                        }
                    }, {
                        $project: {
                            __v: 0
                        }
                    }

                ]
            ).toArray();
            if (!result[0]) return { success: false, code: 404, message: "Không tìm thấy thông tin.!" };
            return { success: true, data: result[0] };
        } catch (ex) {
            return { success: false, code: 500, message: "Có lỗi xảy ra. Xin vui lòng thử lại.!" }
        }
    }
}