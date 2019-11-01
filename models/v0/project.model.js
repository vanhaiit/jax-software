"use strict"
const dbConfig = require('../../utilities/dbConfig');

module.exports = class {

    static async getProjectById(id) {
        try {
            const db = await dbConfig.getConnections();
            if (!db) return { success: false, code: 429, message: "Hệ thống đang quá tải. Vui lòng thử lại sau ít phút.!" }

            const result = await db.collection('Project').aggregate([
                {
                    $lookup:
                    {
                        from: 'Profile',
                        localField: 'Users',
                        foreignField: 'User',
                        as: 'Users'
                    }
                }, {

                    $lookup: {
                        from: "Issue",
                        let: { pid: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ["$Project", "$$pid"]
                                            }
                                        ]
                                    }
                                }
                            }

                        ],
                        as: "Issue"
                    }

                },
                {
                    $project: {
                        "Users.Position": 0,
                        "Users.City": 0,
                        "Users.PhoneConfirmed": 0,
                        "Users.Phone": 0,
                        "Users.Birthday": 0,
                        "Users._id": 0,
                        "Users.__v": 0
                    }
                }, {
                    $match: {
                        _id: id,
                    }
                }
            ]).toArray();

            return { success: true, data: result[0] };
        } catch (ex) {
            return { success: false, code: 500, message: "Có lỗi xảy ra. Xin vui lòng thử lại.!" }
        }
    }

    static async getProjectByKey(key) {
        try {
            const db = await dbConfig.getConnections();
            if (!db) return { success: false, code: 429, message: "Hệ thống đang quá tải. Vui lòng thử lại sau ít phút.!" }

            const result = await db.collection('Project').find({
                $and: [
                    { Key: key }
                ]
            }).toArray();
            if (!result[0]) return { success: false, code: 404, message: "Không tìm thấy thông tin.!" };
            return { success: true, data: result[0] };
        } catch (ex) {
            return { success: false, code: 500, message: "Có lỗi xảy ra. Xin vui lòng thử lại.!" }
        }
    }

}