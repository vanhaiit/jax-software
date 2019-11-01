"use strict"
const dbConfig = require('../../utilities/dbConfig');

module.exports = class {

    static async getProfileByUserId(id) {
        try {
            const db = await dbConfig.getConnections();
            if (!db) return { success: false, code: 429, message: "Hệ thống đang quá tải. Vui lòng thử lại sau ít phút.!" }

            const result = await db.collection('Profile').aggregate(
                [
                    {
                        $lookup: {
                            from: "Project",
                            let: { uid: "$User" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                {
                                                    $in: ["$$uid", "$Users"]
                                                }
                                            ]
                                        }
                                    }
                                },
                                {
                                    $project: {
                                        Name: 1,
                                        Key: 1,
                                        _id: 1
                                    }
                                }
                            ],
                            as: "Users"
                        }
                    }, {
                        $lookup: {
                            from: "Issue",
                            let: { uid: "$User" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                {
                                                    $eq: ["Assignee", "$$uid"]
                                                }
                                            ]
                                        }
                                    }
                                },
                                {
                                    $project: {
                                        Summary: 1,
                                        Project: 1,
                                        _id: 1
                                    }
                                }
                            ],
                            as: "Issues"
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
            if (!result[0]) return { success: false, code: 404, message: "Không tìm thấy thông tin.!" };
            return { success: true, data: result[0] };
        } catch (ex) {
            return { success: false, code: 500, message: "Có lỗi xảy ra. Xin vui lòng thử lại.!" }
        }
    }

    static async getProfileId(id) {
        try {
            const db = await dbConfig.getConnections();
            if (!db) return { success: false, code: 429, message: "Hệ thống đang quá tải. Vui lòng thử lại sau ít phút.!" }

            const result = await db.collection('Profile').find({
                $and: [
                    { User: id }
                ]
            }).toArray();
            if (!result[0]) return { success: false, code: 404, message: "Không tìm thấy thông tin.!" };
            return { success: true, data: result[0] };
        } catch (ex) {
            return { success: false, code: 500, message: "Có lỗi xảy ra. Xin vui lòng thử lại.!" }
        }
    }

}