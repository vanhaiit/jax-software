"use strict";
const successResult = require('../../utilities/successResult');
const errorResult = require('../../utilities/errorResult');
const dbConfig = require('../../utilities/dbConfig');
const utilities = require('../../utilities/utilities');
const issueModel = require('../../models/v0/issue.model');
const userModel = require('../../models/v0/users.model');
var templateModel = require('../../models/v0/template.models');
const sendEmail = require('../../utilities/sendEmail');
const mongodb = require("mongodb");

module.exports = class {

    static async createIssue(req, res) {
        try {
            const account = req.headers['authorization'];
            const project = req.body.project;
            const type = req.body.type;
            const summary = req.body.summary;
            const components = req.body.components;
            const description = req.body.description;
            const fix_versions = req.body.fix_versions;
            const priority = req.body.priority;
            const labels = req.body.labels;
            const environment = req.body.environment;
            const attachment = req.body.attachment;
            const affects_versions = req.body.affects_versions;
            const linked_issues = req.body.linked_issues;
            const assignee = req.body.assignee;
            const start_time = req.body.start_time;
            const end_time = req.body.end_time;
            const images = req.body.images;
            const reporter = req.body.reporter;
            const key = req.body.key;
            if (!project || !type || !summary || !key) return res.json(new errorResult(100, "Tham số không hợp lệ. Xin vui lòng kiểm tra lại thông tin.!"));
            // //verify token 
            let result = await utilities.verifyToken(account);
            if (!result.success) return res.json(new errorResult(result.code, result.message));
            const tk_user = result.data;
            //connect bd
            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));
            let id = new mongodb.ObjectId().toString()
            let issue = await db.collection('Issue').insert({
                _id: id,
                Key: key,
                Project: project,
                Type: type ? type : 0,
                Summary: summary,
                Status: 0,
                Components: components ? components : null,
                Description: description ? description : null,
                FixVersions: fix_versions ? fix_versions : "None",
                Priority: priority ? priority : "Highest",
                Labels: labels ? labels : null,
                Environment: environment ? environment : null,
                Attachment: attachment ? attachment : null,
                AffectsVersions: affects_versions ? affects_versions : null,
                LinkedIssues: linked_issues ? linked_issues : null,
                Assignee: assignee ? assignee : tk_user.UserId,
                Reporter: reporter ? reporter : tk_user.UserId,
                StartTime: start_time ? start_time : null,
                EndTime: end_time ? end_time : null,
                Images: images ? images : [],
                Sub: [],
                DateCreate: new Date(),
                CreateBy: tk_user ? tk_user : null,
            });
            await db.collection('History').insertOne({
                _id: new mongodb.ObjectId().toString(),
                Id: id,
                Type: 1,
                Content: `Tạo mới công việc ${summary}`,
                Value: null,
                UserCreate: tk_user.UserId,
                SubUser: null
            });
            return res.json(new successResult(true, "Tạo thành công", issue));
        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!" + ex));
        }
    }
    //get list project
    static async getListIssue(req, res) {
        try {
            const keyword = req.query.keyword;
            const skip = parseInt(req.query.skip);
            const limit = parseInt(req.query.limit);
            const type = req.query.type;
            const status = parseInt(req.query.status);
            const user = req.query.user;
            const project = req.query.project;
            if (skip < 0 || !limit)
                return res.json(new errorResult(100, "Tham số không hợp lệ.!"));

            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));

            let result = await db.collection('Issue').aggregate([
                {
                    $match: {
                        $and: [
                            {
                                $or: [
                                    {
                                        Summary: !keyword ? { $exists: true } : new RegExp(keyword, 'i')
                                    }
                                ]
                            }, {
                                Type: type || type === 0 ? { $eq: type } : { $exists: true }
                            },
                            {
                                Status: status || status === 0 ? { $eq: status } : { $exists: true }
                            },
                            {
                                $or: [
                                    {
                                        "CreateBy.UserId": !user ? { $exists: true } : { $eq: user }
                                    },
                                    {
                                        Assignee: !user ? { $exists: true } : { $eq: user }
                                    },
                                    {
                                        Reporter: !user ? { $exists: true } : { $eq: user }
                                    }
                                ]
                            },
                            {
                                Project: !project ? { $exists: true } : { $eq: project }
                            }
                        ]
                    }
                }, {
                    $lookup: {
                        from: 'IssueDetail',
                        localField: '_id',
                        foreignField: 'IssueId',
                        as: 'Detail'
                    }
                }, { $sort: { _id: -1 } }, { $skip: skip }, { $limit: limit }
            ]).toArray();

            return res.json(new successResult(true, "", result));
        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!"));
        }
    }
    //post detail
    static async getIssueDetail(req, res) {
        try {
            const issue_id = req.params.Id;
            if (!issue_id) return res.json(new errorResult(500, "Tham số không hợp lệ vui lòng thử lại.!"));
            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));
            //verify id match
            var result = await issueModel.getIssueById(issue_id);
            if (!result.success) return res.json(new errorResult(result.code, result.message));
            //update match
            return res.json(new successResult(true, "", result.data));
        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!"));
        }
    }
    //update post
    static async updateIssue(req, res) {
        try {
            const account = req.headers['authorization'];
            let tk_user;
            let user = await utilities.verifyToken(account);
            if (!user.success) return res.json(new errorResult(result.code, result.message));
            tk_user = user.data;
            const issue_id = req.params.Id;
            if (!issue_id) return res.json(new errorResult(417, "Tham số không hợp lệ .!"));
            //verify id post
            let _issue = await issueModel.getIssueById(issue_id);
            if (!_issue.success) return res.json(new errorResult(_issue.code, _issue.message));
            let issue_data = _issue.data;
            //update match
            var map = req.body;
            let query = {};
            if (map.summary) query["Summary"] = map.summary;
            if (map.status || map.status === 0) query["Status"] = map.status;
            if (map.components) query["Components"] = map.components;
            if (map.description) query["Description"] = map.description;
            if (map.fixVersions) query["FixVersions"] = map.fixVersions;
            if (map.priority) query["Priority"] = map.priority;
            if (map.labels) query["Labels"] = map.labels;
            if (map.environment) query["Environment"] = map.environment;
            if (map.attachment) query["Attachment"] = map.attachment;
            if (map.affectsVersions) query["AffectsVersions"] = map.affectsVersions;
            if (map.linkedIssues) query["LinkedIssues"] = map.linkedIssues;
            if (map.assignee) query["Assignee"] = map.assignee;
            if (map.reporter) query["Reporter"] = map.reporter;
            if (map.startTime) query["StartTime"] = map.startTime;
            if (map.endTime) query["EndTime"] = map.endTime;
            if (map.images) query["Images"] = map.images;
            if (Object.keys(query).length === 0) res.json(new errorResult(500, "Không thấy thay đổi dữ liệu.!"));
            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));
            let issue = await db.collection('Issue').updateOne(
                { _id: issue_id }, { $set: query }
            );
            if (query.Assignee) {
                await db.collection('History').insert({
                    _id: new mongodb.ObjectId().toString(),
                    Id: issue_id,
                    Type: 1,
                    Content: `Chuyển giao công việc cho`,
                    Value: query,
                    UserCreate: tk_user.UserId,
                    SubUser: map.assignee
                });
                let result = await userModel.getUserById(map.assignee);
                if (!result.success) return res.json(new errorResult(result.code, result.message));
                let data = {
                    value: query,
                    user: tk_user,
                    subuser: result.data,
                    name: issue_data.Summary
                }
                var conten = templateModel.emailTeamplate(data);
                var mailOptions = {
                    to: issue_data.CreateBy.Email,
                    subject: 'Thông tin cập nhật công việc Mtester',
                    html: conten
                }
                sendEmail.sendEmail(mailOptions);
            }
            if (query.Status && Object.keys(query).length === 1) {
                let data = {
                    value: query,
                    user: tk_user,
                    subuser: null,
                    name: issue_data.Summary
                }
                var conten = templateModel.emailTeamplate(data);
                var mailOptions = {
                    to: issue_data.CreateBy.Email,
                    subject: 'Thông tin cập nhật công việc Mtester',
                    html: conten
                }
                sendEmail.sendEmail(mailOptions);
            }
            await db.collection('History').insert({
                _id: new mongodb.ObjectId().toString(),
                Id: issue_id,
                Type: 1,
                Content: `Chỉnh sửa công việc`,
                Value: query,
                UserCreate: tk_user.UserId,
                SubUser: null
            });
            return res.json(new successResult(true, "Chỉnh sửa thành công.!", issue));

        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!" + ex));
        }
    }

}