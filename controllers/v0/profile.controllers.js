"use strict";
const successResult = require('../../utilities/successResult');
const errorResult = require('../../utilities/errorResult');
const dbConfig = require('../../utilities/dbConfig');
var profileModel = require('../../models/v0/profile.model');
var userModel = require('../../models/v0/users.model');
const upload = require('../../utilities/uploadFile');
const utilities = require('../../utilities/utilities');

module.exports = class {

    static async updateProfile(req, res) {
        try {
            //verify id 
            const userId = req.params.Id;
            if (!userId) return res.json(new errorResult(417, "Tham số không hợp lệ .!"));
            const account = req.headers['authorization'];
            let user = await utilities.verifyToken(account);
            if (!user.success) return res.json(new errorResult(result.code, result.message));
            let tk_user = user.data;
            if (tk_user.UserId !== userId) return res.json(new errorResult(500, "Bạn không có quền chỉnh sửa người dùng này.!"));
            //connect db
            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));
            //verify id user
            var check = await userModel.getUserById(userId);
            if (!check.success) return res.json(new errorResult(check.code, check.message));
            //update profile
            var map = req.body;
            let query = {};
            if (map.avatar) query["Avatar"] = map.avatar;
            if (map.city) query["City"] = map.city;
            if (map.birthday) query["Birthday"] = map.birthday;
            if (map.gender) query["Gender"] = map.gender;
            if (map.address) query["Address"] = map.address;
            if (map.phone) query["Phone"] = map.phone;
            if (map.name) query["Name"] = map.name;
            let result = await db.collection('Profile').updateOne(
                { User: userId }, { $set: query }
            );
            return res.json(new successResult(true, "Chỉnh sửa thành công.!", result));

        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!"));
        }
    }
    static async getProfileById(req, res) {
        try {
            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));
            var result = await profileModel.getProfileByUserId(req.params.Id);
            if (!result) return res.json(new errorResult(409, "Tài khoản đã tồn tại .!"));
            return res.json(new successResult(true, "", result.data));
        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!"));
        }
    }

    static async getProfileId(req, res) {
        try {
            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));
            var result = await profileModel.getProfileId(req.params.Id);
            if (!result) return res.json(new errorResult(409, "Tài khoản đã tồn tại .!"));
            return res.json(new successResult(true, "", result.data));
        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!"));
        }
    }
}