const express = require("express");
const TlCon = require(`${__dirname}/../controller/linkController.js`);
const router = express.Router();
router.route("/").get(TlCon.landingPage);
router.route("/shortUrls").post(TlCon.postPage);
router.route("/:shortUrl").get(TlCon.redirect);

module.exports = router;
