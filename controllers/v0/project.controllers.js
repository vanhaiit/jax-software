"use strict";
const successResult = require('../../utilities/successResult');
const errorResult = require('../../utilities/errorResult');
const dbConfig = require('../../utilities/dbConfig');
const utilities = require('../../utilities/utilities');
const projectModel = require('../../models/v0/project.model');
const mongodb = require("mongodb");

module.exports = class {

    static async createProject(req, res) {
        try {
            const account = req.headers['authorization'];
            const name = req.body.name;
            const key = req.body.key;
            if (!name || !key) return res.json(new errorResult(100, "Tham số không hợp lệ. Xin vui lòng kiểm tra lại thông tin.!"));
            //verify token
            var result = await projectModel.getProjectByKey(key);
            if (result.success) return res.json(new errorResult(409, "Key đã tồn tại vui lòng chọn key khác .!"));

            //verify token 
            let tk_user;
            result = await utilities.verifyToken(account);
            if (!result.success) return res.json(new errorResult(result.code, result.message));
            tk_user = result.data;
            //connect bd
            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));
            let id = new mongodb.ObjectId().toString();
            let project = await db.collection('Project').insert({
                _id: id,
                Name: name,
                Key: key,
                Url: null,
                Type: 0,
                Category: 0,
                Avatar: null,
                Description: null,
                ProjectLead: tk_user || null,
                DefaultAssignee: 0,
                Users: tk_user ? [tk_user.UserId] : [],
                CreateBy: tk_user ? tk_user : {},
                DateCreate: new Date(),
            });
            await db.collection('History').insert({
                _id: new mongodb.ObjectId().toString(),
                Id: id,
                Type: 0,
                Content: `Tạo mới dự án ${name}`,
                Value: null,
                UserCreate: tk_user.UserId,
                SubUser: null
            });
            return res.json(new successResult(true, "Tạo thành công", project));
        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!" + ex));
        }
    }
    //get list project
    static async getListProject(req, res) {
        try {
            const keyword = req.query.keyword;
            const skip = parseInt(req.query.skip);
            const limit = parseInt(req.query.limit);
            const user = req.query.user;
            if (skip < 0 || !limit)
                return res.json(new errorResult(100, "Tham số không hợp lệ.!"));

            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));

            let result = await db.collection('Project').aggregate([
                {
                    $match: {
                        $and: [
                            {
                                $or: [
                                    { Name: !keyword ? { $exists: true } : new RegExp(keyword, 'i') }
                                ]
                            },
                            {
                                Users: !user ? { $exists: true } : { $in: [user, "$User"] }
                            }
                        ]
                    }
                }, { $sort: { _id: -1 } }, { $skip: skip }, { $limit: limit }
            ]).toArray();

            return res.json(new successResult(true, "", result));
        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!"));
        }
    }
    //post detail
    static async getProjectDetail(req, res) {
        try {
            const project_id = req.params.Id;
            if (!project_id) return res.json(new errorResult(429, "Tham số truyên lên không hợp lệ.!"));
            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));
            //verify id match
            var result = await projectModel.getProjectById(project_id);
            if (!result.success) return res.json(new errorResult(result.code, result.message));
            //update match
            return res.json(new successResult(true, "", result.data));
        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!"));
        }
    }
    //update post
    static async updateProject(req, res) {
        try {
            const account = req.headers['authorization'];
            let tk_user;
            result = await utilities.verifyToken(account);
            if (!result.success) return res.json(new errorResult(result.code, result.message));
            tk_user = result.data;
            var result;
            const project_id = req.params.Id;
            if (!project_id) return res.json(new errorResult(417, "Tham số không hợp lệ .!"));
            //verify id post
            result = await projectModel.getProjectById(project_id);
            if (!result.success) return res.json(new errorResult(result.code, result.message));
            //update match
            var map = req.body;
            let query = {};
            if (map.name) query["Name"] = map.name;
            if (map.url) query["Url"] = map.url;
            if (map.type) query["Type"] = map.type;
            if (map.category) query["Category"] = map.category;
            if (map.project_lead) query["ProjectLead"] = map.project_lead;
            if (map.default_assignee) query["DefaultAssignee"] = map.default_assignee;
            if (map.users) query["Users"] = map.users;
            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));

            let project = await db.collection('Project').updateOne(
                { _id: req.params.Id }, { $set: query }
            );
            await db.collection('History').insert({
                _id: new mongodb.ObjectId().toString(),
                Id: req.params.Id,
                Type: 0,
                Content: `Chỉnh sửa dự án ${result.data.Name}`,
                Value: query,
                UserCreate: tk_user.UserId,
                SubUser: null
            });
            return res.json(new successResult(true, "Chỉnh sửa thành công.!", project));

        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!"));
        }
    }
    //update post
    static async deleteProject(req, res) {
        try {
            const account = req.headers['authorization'];
            let tk_user;
            result = await utilities.verifyToken(account);
            if (!result.success) return res.json(new errorResult(result.code, result.message));
            tk_user = result.data;
            var result;
            const id = req.params.Id;
            if (!id) return res.json(new errorResult(429, "Tham số truyên lên không hợp lệ.!"));
            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));
            let project = await db.collection('Project').deleteOne({ "_id": id });
            await db.collection('History').insert({
                _id: new mongodb.ObjectId().toString(),
                Id: id,
                Type: 0,
                Content: `Xóa dự án ${project.name}`,
                Value: null,
                UserCreate: tk_user.UserId,
                SubUser: null
            });
            return res.json(new successResult(true, "Xóa thành công.!", project));
        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!"));
        }
    }

}