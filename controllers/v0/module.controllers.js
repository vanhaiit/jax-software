"use strict";
const successResult = require('../../utilities/successResult');
const errorResult = require('../../utilities/errorResult');
const dbConfig = require('../../utilities/dbConfig');
const utilities = require('../../utilities/utilities');
const moduleModel = require('../../models/v0/module.model');
const mongodb = require("mongodb");

module.exports = class {

    static async create(req, res) {
        try {
            const account = req.headers['authorization'];
            const version = req.body.version;
            const name = req.body.name;
            const description = req.body.description;
            const environment = req.body.environment;
            const build = req.body.build;
            const from = req.body.from;
            const to = req.body.to;
            const project_id = req.body.project_id;
            const assign_to = req.body.assign_to;

            if (!name || !project_id) return res.json(new errorResult(100, "Tham số không hợp lệ. Xin vui lòng kiểm tra lại thông tin.!"));

            // //verify token 

            let result = await utilities.verifyToken(account);
            if (!result.success) return res.json(new errorResult(result.code, result.message));
            const tk_user = result.data;

            //connect bd

            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));
            let id = new mongodb.ObjectId().toString()
            let _module = await db.collection('Module').insert({
                _id: id,
                ProjectId: project_id,
                Version: version ? version : null,
                Name: name,
                Description: description ? description : null,
                Build: build ? build : null,
                Environment: environment ? environment : null,
                From: from ? from : null,
                To: to ? to : null,
                Tests: [],
                DateCreate: new Date(),
                AssignTo: assign_to ? assign_to : null,
                CreateBy: tk_user ? tk_user : null,

            });
            return res.json(new successResult(true, "Tạo thành công", _module));
        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!" + ex));
        }
    }
    //get list project
    static async getList(req, res) {
        try {

            const keyword = req.query.keyword;
            const projectId = req.query.projectId;
            const skip = parseInt(req.query.skip);
            const limit = parseInt(req.query.limit);
            if (skip < 0 || !limit || !projectId)
                return res.json(new errorResult(100, "Tham số không hợp lệ.!"));

            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));

            let result = await db.collection('Module').aggregate([
                {
                    $match: {
                        $and: [
                            {
                                $or: [
                                    {
                                        Name: !keyword ? { $exists: true } : new RegExp(keyword, 'i')
                                    }
                                ]
                            }, {
                                ProjectId: projectId
                            }
                        ]
                    }
                },
                {
                    $sort: {
                        _id: -1
                    }
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }
            ]).toArray();

            return res.json(new successResult(true, "", result));

        } catch (ex) {

            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!"));

        }
    }
    //post detail
    static async getDetail(req, res) {
        try {

            const issue_id = req.params.Id;
            if (!issue_id) return res.json(new errorResult(500, "Tham số không hợp lệ vui lòng thử lại.!"));

            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));

            var result = await moduleModel.getModuleById(issue_id);
            if (!result.success) return res.json(new errorResult(result.code, result.message));

            return res.json(new successResult(true, "", result.data));

        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!"));
        }
    }
    //update post
    static async update(req, res) {
        try {

            const id = req.params.Id;
            if (!id) return res.json(new errorResult(417, "Tham số không hợp lệ .!"));

            let _issue = await moduleModel.getModuleById(id);
            if (!_issue.success) return res.json(new errorResult(_issue.code, _issue.message));

            var map = req.body;
            let query = {};

            if (map.version) query["Version"] = map.version;
            if (map.name) query["Name"] = map.name;
            if (map.description) query["Description"] = map.description;
            if (map.build) query["Build"] = map.build;
            if (map.environment) query["Environment"] = map.environment;
            if (map.from) query["From"] = map.from;
            if (map.to) query["To"] = map.to;
            if (map.tests) query["Tests"] = map.tests;
            if (map.assign_to) query["AssignTo"] = map.assign_to;

            if (Object.keys(query).length === 0) res.json(new errorResult(500, "Không thấy thay đổi dữ liệu.!"));
            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));

            let _module = await db.collection('Module').updateOne(
                { _id: id }, { $set: query }
            );
            return res.json(new successResult(true, "Chỉnh sửa thành công.!", _module));

        } catch (ex) {

            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!" + ex));

        }
    }

}