"use strict"
const express = require('express');
const port = process.env.PORT || 8080;
const bodyparser = require('body-parser');
const path = require('path')
const app = express();
app.use(bodyparser.json({ limit: "5mb" }));
var http = require("http").Server(app);

//START:: REQUEST ACCESS CONTROL
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization,Cache-Control,Pragma,Expires");
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        res.header("Cache-Control", "no-cache");
        return res.status(200).json({});
    }
    next();
});
//END:: REQUEST ACCESS CONTROL

//START::ROUTER CONNECT
app.use("/api/v0/users", require('./routers/v0/users'));

app.use("/api/v0/project", require('./routers/v0/projects'));

app.use("/api/v0/issue", require('./routers/v0/issue'));

app.use("/api/v0/sub-issue", require('./routers/v0/sub-issue'));

app.use("/api/v0/detail-issue", require('./routers/v0/issue-detail'));

app.use("/api/v0/module", require('./routers/v0/module'));

app.use("/api/v0/upload", require('./routers/v0/upload'));

app.use("/api/v0/comment", require('./routers/v0/comment'));

app.use("/api/v0/history", require('./routers/v0/history'));
//END:: ROUTER CONNECT

app.use(express.static(path.join(__dirname, 'view', 'dist', 'M-TESTER')));

app.use(express.static(__dirname + '/uploads'));

//START:: EX ERROR REQUETS FALSE
app.use((req, res, next) => {
    const error = new Error("404 - Not found");
    error.status = 404;
    next(error);
});

//END:: EX ERROR REQUERS FALSE
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

//SERVER LISTEN PORT
http.listen(port, '127.0.0.1', () => { console.log(`APP LISTENING ON PORT http://127.0.0.1:${port}`) });
return http;

