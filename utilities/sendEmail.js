var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ngocto1405@gmail.com',
        pass: 'maingoctu2'
    }
});

module.exports = class {

    static async sendEmail(mailOptions) {
        try {
            mailOptions.from = 'vanhaiit2018@gmail.com';
            var result = await transporter.sendMail(mailOptions);
            return result;
        } catch (ex) {
            return { success: false, code: 500, message: "Có lỗi xảy ra. Xin vui lòng thử lại.!" }
        }
    }

}



