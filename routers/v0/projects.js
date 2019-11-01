"use strict";
const express = require('express');
var router = express.Router();
const checkAuth = require('../../utilities/checkAuth');
var profileControllers = require('../../controllers/v0/project.controllers');

router.post("/", checkAuth, profileControllers.createProject);

router.get("/", checkAuth, profileControllers.getListProject);

router.get("/:Id", checkAuth, profileControllers.getProjectDetail);

router.put("/:Id", checkAuth, profileControllers.updateProject);

router.delete("/:Id", checkAuth, profileControllers.deleteProject);

module.exports = router;