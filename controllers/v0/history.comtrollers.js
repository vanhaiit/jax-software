"use strict";
const successResult = require('../../utilities/successResult');
const errorResult = require('../../utilities/errorResult');
const dbConfig = require('../../utilities/dbConfig');

module.exports = class {

    static async getHistory(req, res) {
        try {
            const type = parseInt(req.query.type);
            const id = req.query.id;
            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));

            let result = await db.collection('History').aggregate([
                {
                    $lookup: {
                        from: 'Profile',
                        localField: 'UserCreate',
                        foreignField: 'User',
                        as: 'UserView'
                    },
                }, {
                    $lookup: {
                        from: 'Profile',
                        localField: 'SubUser',
                        foreignField: 'User',
                        as: 'SubUserView'
                    },
                }, {
                    $match: {
                        $and: [
                            { Id: { $eq: id } },
                            { Type: { $eq: type } }
                        ]
                    }
                },
                { $unwind: '$UserView' },
            ]).toArray();
            return res.json(new successResult(true, "", result));
        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!"));
        }
    }
}