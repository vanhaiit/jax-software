"use strict";
const express = require('express');
var router = express.Router();
const checkAuth = require('../../utilities/checkAuth');
var subIssueControllers = require('../../controllers/v0/sub-issue.controllers');

router.get("/follow/:Id", checkAuth, subIssueControllers.getListSubIssueFollowId);

router.post("/", checkAuth, subIssueControllers.createSubIssue);

router.get("/", checkAuth, subIssueControllers.getListSubIssue);

router.get("/:Id", checkAuth, subIssueControllers.getSubIssueDetail);

router.put("/:Id", checkAuth, subIssueControllers.updateSubIssue);



module.exports = router;