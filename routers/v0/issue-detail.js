"use strict";
const express = require('express');
var router = express.Router();
const checkAuth = require('../../utilities/checkAuth');
var issueDetailControllers = require('../../controllers/v0/issue-detail.controllers');

router.post("/", checkAuth, issueDetailControllers.createIssueDetail);

router.get("/:isid", checkAuth, issueDetailControllers.getListIssueDetail);

router.put("/:Id", checkAuth, issueDetailControllers.updateIssueDetail);

router.delete("/:Id", checkAuth, issueDetailControllers.deleteIssueDetail);

module.exports = router;