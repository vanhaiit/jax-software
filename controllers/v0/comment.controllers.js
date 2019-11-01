"use strict";
const successResult = require('../../utilities/successResult');
const errorResult = require('../../utilities/errorResult');
const dbConfig = require('../../utilities/dbConfig');
const utilities = require('../../utilities/utilities');
const commnetModel = require('../../models/v0/comment.model');
const mongodb = require("mongodb");

module.exports = class {

    static async createComment(req, res) {
        try {
            const account = req.headers['authorization'];
            const issue_id = req.body.issue_id;
            const content = req.body.content;
            if (!issue_id || !content) return res.json(new errorResult(100, "Tham số không hợp lệ. Xin vui lòng kiểm tra lại thông tin.!"));
            // //verify token 
            let result = await utilities.verifyToken(account);
            if (!result.success) return res.json(new errorResult(result.code, result.message));
            const tk_user = result.data;
            //connect bd
            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));

            let issue = await db.collection('Comment').insert({
                _id: new mongodb.ObjectId().toString(),
                IssueId: issue_id,
                Content: content ? content : null,
                CreateBy: tk_user ? tk_user : null,
                DateCreate: new Date(),
            });
            return res.json(new successResult(true, "Tạo thành công", issue));
        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!" + ex));
        }
    }
    //post detail
    static async getCommnet(req, res) {
        try {
            const issue_id = req.params.Id;
            if (!issue_id) return res.json(new errorResult(500, "Tham số không hợp lệ vui lòng thử lại.!"));
            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));
            //verify id match
            var result = await commnetModel.getCommentById(issue_id);
            if (!result.success) return res.json(new errorResult(result.code, result.message));
            //update match
            return res.json(new successResult(true, "", result.data));
        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!"));
        }
    }
    //update post
    static async updateComment(req, res) {
        try {
            const id_comment = req.params.Id;
            if (!id_comment) return res.json(new errorResult(417, "Tham số không hợp lệ .!"));
            //update match
            var map = req.body;
            let query = {};
            if (map.content) query["Content"] = map.content;
            if (Object.keys(query).length === 0) res.json(new errorResult(500, "Không thấy thay đổi dữ liệu.!"));
            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));

            let issue = await db.collection('Comment').updateOne(
                { _id: id_comment }, { $set: query }
            );
            return res.json(new successResult(true, "Chỉnh sửa thành công.!", issue));

        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!" + ex));
        }
    }
    //update post
    static async deleteComment(req, res) {
        try {
            const id = req.params.Id;
            if (!id) return res.json(new errorResult(429, "Tham số truyên lên không hợp lệ.!"));
            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));
            let project = await db.collection('Comment').deleteOne({ "_id": id });
            return res.json(new successResult(true, "Xóa thành công.!", project));
        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!"));
        }
    }

}