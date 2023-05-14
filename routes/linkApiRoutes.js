const express = require("express");
const linkCon = require(`${__dirname}/../controller/linkController.js`);
const authCon = require(`${__dirname}/../controller/authController.js`);
const router = express.Router();
router.route("/createLink").post(authCon.protect, linkCon.createShortLink);
router
  .route("/:linkId/deleteSlink")
  .delete(authCon.protect, linkCon.deleteLink);

router.route("/").get(linkCon.getAllLinks);

module.exports = router;
