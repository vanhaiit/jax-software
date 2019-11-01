"use strict";
const express = require('express');
var router = express.Router();
const checkAuth = require('../../utilities/checkAuth');
var moduleControllers = require('../../controllers/v0/module.controllers');

router.post("/", checkAuth, moduleControllers.create);

router.get("/", checkAuth, moduleControllers.getList);

router.get("/:Id", checkAuth, moduleControllers.getDetail);

router.put("/:Id", checkAuth, moduleControllers.update);

module.exports = router;