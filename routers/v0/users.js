"use strict";
const express = require('express');
var router = express.Router();
var usersControllers = require('../../controllers/v0/users.controllers');
const checkAuth = require('../../utilities/checkAuth');
var profileControllers = require('../../controllers/v0/profile.controllers');

router.post("/signup", usersControllers.userSignup);

router.post("/signin", usersControllers.userSignin);

router.get("/", checkAuth, usersControllers.getListUsers);

router.get("/:Id", checkAuth, profileControllers.getProfileById);

router.get("/profile/:Id", checkAuth, profileControllers.getProfileId);

router.put("/:Id", checkAuth, profileControllers.updateProfile);

module.exports = router;