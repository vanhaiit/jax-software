"use strict";
const successResult = require('../../utilities/successResult');
const errorResult = require('../../utilities/errorResult');

module.exports = class {

    static async updateFile(req, res) {
        try {
            return res.json(new successResult(true, "Thêm mới ảnh thành công", req.file));
        } catch (ex) {
            return res.json(new errorResult(500, "Có lỗi xảy ra. Xin vui lòng thử lại.!"));
        }
    }
}