"use strict"
const errorResult = require('./errorResult');
module.exports = class {

    static UploadImage(data, type, name) {
        try {

            let base64Image = data.split(';base64,').pop();
            var binaryData = new Buffer(base64Image, 'base64').toString('binary');
            if (type == 1) var pacth = 'C://Users/Public/Pictures/Avatar';
            if (type == 2) var pacth = 'C://Users/Public/Pictures/Profile';
            if (type == 3) var pacth = 'C://Users/Public/Pictures/Player';
            if (type == 4) var pacth = 'C://Users/Public/Pictures/Imager_Player';
            var fs = require('fs');
            if (!fs.existsSync(pacth)) {
                fs.mkdirSync(pacth);
            }
            fs.writeFile(`${pacth}/${name}.png`, binaryData, "binary", function (err) {
                if (err) return res.json(new errorResult(417, "Upload ảnh thất bại. Vui lòng thử lại sau ít phút.!"));
                // writes out file without error, but it's not a valid image
            });
            return { success: true, data: `${pacth}/${name}.png` };
        } catch (ex) {
            return { success: false, code: 500, message: "Có lỗi xảy ra. Xin vui lòng thử lại.!" }
        }
    }
}