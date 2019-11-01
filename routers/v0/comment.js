"use strict";
const express = require('express');
var router = express.Router();
const checkAuth = require('../../utilities/checkAuth');
var commentControllers = require('../../controllers/v0/comment.controllers');

router.post("/", checkAuth, commentControllers.createComment);

router.get("/:Id", checkAuth, commentControllers.getCommnet);

router.put("/:Id", checkAuth, commentControllers.updateComment);

router.delete("/:Id", checkAuth, commentControllers.deleteComment);

module.exports = router;