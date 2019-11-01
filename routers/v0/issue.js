"use strict";
const express = require('express');
var router = express.Router();
const checkAuth = require('../../utilities/checkAuth');
var issueControllers = require('../../controllers/v0/issue.controllers');

router.post("/", checkAuth, issueControllers.createIssue);

router.get("/", checkAuth, issueControllers.getListIssue);

router.get("/:Id", checkAuth, issueControllers.getIssueDetail);

router.put("/:Id", checkAuth, issueControllers.updateIssue);

module.exports = router;