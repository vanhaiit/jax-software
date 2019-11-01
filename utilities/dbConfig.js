"use strict";
let db;
const dbClient = require('mongodb').MongoClient;
 dbClient.connect('mongodb://admin:vanhaiit@cluster0-shard-00-00-ntnbc.mongodb.net:27017,cluster0-shard-00-01-ntnbc.mongodb.net:27017,cluster0-shard-00-02-ntnbc.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true',
//dbClient.connect('mongodb://localhost:27017',

    { useNewUrlParser: true, useUnifiedTopology: true },
    function (ex, database) {
        try {
            db = !ex ? database.db("MTESTER") : false;
            return db;
        } catch (ex) {
            database.close();
        }
    });

module.exports = class {
    static async getConnections() {
        try {
            return !db ? false : db;
        } catch (ex) {
            return false;
        }
    }
}