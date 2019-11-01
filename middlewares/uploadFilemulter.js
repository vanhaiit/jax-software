// JavaScript source code
var multer = require('multer')
const multipartUpload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, '../JAX-SOFTWARE/uploads/images');
        },
        filename: function (req, file, cb) {
            cb(null, req.query.type + '-' + Date.now() + '-' + file.originalname);
        }
    })
}).single('files');

module.exports = multipartUpload;
