"use strict";
const successResult = require('../../utilities/successResult');
const errorResult = require('../../utilities/errorResult');
const dbConfig = require('../../utilities/dbConfig');
const utilities = require('../../utilities/utilities');
const mongodb = require("mongodb");

module.exports = class {

    static async createIssueDetail(req, res) {
        try {
            const account = req.headers['authorization'];
            const issue_id = req.body.issue_id;
            const belong = parseInt(req.body.belong);
            const step = req.body.step;
            const data = req.body.data;
            const result_in = req.body.result_in;
            if (!step || !data || !result_in || !issue_id) return res.json(new errorResult(100, "Tham số không hợp lệ. Xin vui lòng kiểm tra lại thông tin.!"));
            // //verify token 
            let result = await utilities.verifyToken(account);
            if (!result.success) return res.json(new errorResult(result.code, result.message));
            const tk_user = result.data;
            //connect bd
            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));
            let id = new mongodb.ObjectId().toString()
            let _req = await db.collection('IssueDetail').insert({
                _id: id,
                IssueId: issue_id,
                BeLong: belong ? belong : 0,
                Step: step,
                Data: data,
                ResultIn: result_in,
                Status: 0,
                Comment: null,
                DateCreate: new Date(),
                CreateBy: tk_user
            });
            return res.json(new successResult(true, "Tạo thành công", _req));
        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!" + ex));
        }
    }

    static async getListIssueDetail(req, res) {
        try {
            const issue_id = req.params.isid;
            const db = await dbConfig.getConnections();
            if (!db) return { success: false, code: 429, message: "Hệ thống đang quá tải. Vui lòng thử lại sau ít phút.!" }

            const result = await db.collection('IssueDetail').find({
                $and: [
                    { IssueId: issue_id }
                ]
            }).toArray();
            return res.json(new successResult(true, "", result));
        } catch (ex) {
            return { success: false, code: 500, message: "Có lỗi xảy ra. Xin vui lòng thử lại.!" }
        }
    }

    static async updateIssueDetail(req, res) {
        try {
            const id = req.params.Id;
            if (!id) return res.json(new errorResult(417, "Tham số không hợp lệ .!"));
            //update match
            var map = req.body;
            let query = {};
            if (map.step) query["Step"] = map.step;
            if (map.data) query["Data"] = map.data;
            if (map.result_in) query["ResultIn"] = map.result_in;
            if (map.status) query["Status"] = parseInt(map.status);
            if (map.comment) query["Comment"] = map.comment;
            if (Object.keys(query).length === 0) res.json(new errorResult(500, "Không thấy thay đổi dữ liệu.!"));
            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));

            let issue = await db.collection('IssueDetail').updateOne(
                { _id: id }, { $set: query }
            );
            return res.json(new successResult(true, "Chỉnh sửa thành công.!", issue));

        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!" + ex));
        }
    }

    static async deleteIssueDetail(req, res) {
        try {
            const id = req.params.Id;
            if (!id) return res.json(new errorResult(429, "Tham số truyên lên không hợp lệ.!"));
            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));
            let project = await db.collection('IssueDetail').deleteOne({ "_id": id });
            return res.json(new successResult(true, "Xóa thành công.!", project));
        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!"));
        }
    }

}