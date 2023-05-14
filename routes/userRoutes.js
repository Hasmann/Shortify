const express = require("express");
const authCon = require(`${__dirname}/../controller/authController.js`);
const userCon = require(`${__dirname}/../controller/userController.js`);
const router = express.Router();

// authCon.protect,

router.post("/signUp", authCon.signUp);
router.post("/login", authCon.login);
router.post("/sendReset", authCon.sendpasswordReset);
router.post("/passwordReset/:resetToken", authCon.passwordReset);
router
  .route("/")
  .get(
    authCon.protect,
    authCon.authorized("admin", "dev"),
    userCon.getAllUsers
  );

router
  .route("/:userId")
  .get(authCon.protect, authCon.authorized("admin", "dev"), userCon.getoneUser)
  .delete(
    authCon.protect,
    authCon.authorized("admin", "dev"),
    userCon.deleteUser
  );
module.exports = router;
