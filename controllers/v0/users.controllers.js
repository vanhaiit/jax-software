// "use strict";
const successResult = require('../../utilities/successResult');
const errorResult = require('../../utilities/errorResult');
const dbConfig = require('../../utilities/dbConfig');
const mongodb = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var userModel = require('../../models/v0/users.model');
const upload = require('../../utilities/uploadFile');

module.exports = class {
    //create user
    static async userSignup(req, res) {
        try {
            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));
            var result;
            const emails = req.body.email;
            //verify email
            result = await userModel.getUserByEmail(emails);
            if (result.success) return res.json(new errorResult(409, "Tài khoản đã tồn tại .!"));
            //create usser
            const id = new mongodb.ObjectId().toString();
            const email = req.body.email;
            const password = req.body.password;
            const username = req.body.username;
            var birthdays = req.body.birthday;
            if (birthdays) birthdays = new Date(birthdays);
            if (!email || !password || !username) return res.json(new errorResult(417, "Tham số không hợp lệ .!"));
            bcrypt.hash(req.body.password, 10, async (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    let user = await db.collection('Users').insert({
                        _id: id,
                        Email: email,
                        UserName: username,
                        EmailConfirmed: false,
                        Password: hash,
                        Status: false,
                        Provider: req.body.provider ? req.body.provider : "UserCreate",
                        Role: ["Normal"],
                        __v: 0,
                    });
                    await db.collection('Profile').insert({
                        _id: new mongodb.ObjectId().toString(),
                        User: id,
                        Birthday: birthdays,
                        Gender: req.body.gender,
                        Address: req.body.address,
                        Phone: req.body.phone,
                        PhoneConfirmed: false,
                        Avatar: req.body.avatar,
                        City: req.body.city,
                        Name: username,
                        Position: "Normal",
                        __v: 0,
                    });
                    return res.json(new successResult(true, "Thêm mới hành công", user));
                }
            });

        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!"));
        }
    }
    //login user
    static async userSignin(req, res) {
        try {
            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));
            let user = await db.collection('Users').findOne({ Email: req.body.email });
            if (!user) {
                return res.json(new errorResult(401, "Auth failed"));
            }
            bcrypt.compare(req.body.password, user.Password, (err, result) => {
                if (err) {
                    return res.json(new errorResult(401, "Auth failed"));
                }
                if (result) {
                    const token = jwt.sign(
                        {
                            email: user.Email,
                            userId: user._id,
                            username: user.UserName,
                        },
                        "secret",
                        {
                            expiresIn: 60 * 60 * 24 * 30
                        }
                    );
                    return res.json(new successResult(true, "Đăng nhập thành công", {
                        token: 'Bearer ' + token,
                        username: user.UserName,
                        email: user.Email,
                        id: user._id
                    }));
                }
                return res.json(new errorResult(401, "Auth failed"));
            });
        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!"));
        }
    }
    //get list user
    static async getListUsers(req, res) {
        try {
            const keyword = req.query.keyword;
            const skip = parseInt(req.query.skip);
            const limit = parseInt(req.query.limit);
            if (skip < 0 || !limit)
                return res.json(new errorResult(100, "Tham số không hợp lệ.!"));

            const db = await dbConfig.getConnections();
            if (!db) return res.json(new errorResult(429, "Hệ thống đang quá tải.!"));

            let result = await db.collection('Users').aggregate([
                {
                    $lookup:
                    {
                        from: 'Profile',
                        localField: '_id',
                        foreignField: 'User',
                        as: 'Profile'
                    }
                },
                { $unwind: '$Profile' },
                {
                    $match: {
                        $and: [
                            {
                                $or: [
                                    { Email: !keyword ? { $exists: true } : new RegExp(keyword, 'i') }
                                ]
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

}