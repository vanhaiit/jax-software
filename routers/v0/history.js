"use strict";
const express = require('express');
var router = express.Router();
const checkAuth = require('../../utilities/checkAuth');
var historyControllers = require('../../controllers/v0/history.comtrollers');


router.get("/", checkAuth, historyControllers.getHistory);

module.exports = router;