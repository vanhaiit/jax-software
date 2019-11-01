"use strict"
module.exports = class {

    static async getRandomArbitrary(min, max) {
        try {
            min = Math.ceil(min);
            max = Math.floor(max);
            var number = Math.floor(Math.random() * (max - min)) + min;
            //return { success: true, data: number };
            return number; //The maximum is exclusive and the minimum is inclusive

        } catch (ex) {
            return { success: false, code: 500, message: "Có lỗi xảy ra. Xin vui lòng thử lại.!" }
        }
    }
}