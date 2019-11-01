"use strict";
const express = require('express');
var router = express.Router();
const checkAuth = require('../../utilities/checkAuth');
const multipartUpload = require('../../middlewares/uploadFilemulter');
const uploadController = require('../../controllers/v0/upload.controllers');

router.post("/", multipartUpload, uploadController.updateFile);

module.exports = router;