const jwt = require("jsonwebtoken");
const User = require(`${__dirname}/../model/user.js`);
const dotenv = require("dotenv").config({ path: `${__dirname}/../config.env` });
const { promisify } = require("util");
const catchAsync = require(`${__dirname}/../errorHandles/errorAsync.js`);
const errorClass = require(`${__dirname}/../errorHandles/errorClass.js`);
const crypto = require("crypto");
const sendMail = require(`${__dirname}/../sendMail.js`);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TIME,
  });
};
const sendToken = (user, res, statusCode) => {
  const token = generateToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  res.cookie("shortifyToken", token, cookieOptions);
  res.status(statusCode).json({
    status: "SUCCESS",
    token: token,
    data: {
      user,
    },
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation,
    role: req.body.role,
  });
  //login the new user
  sendToken(newUser, res, 201);
  if (!newUser) {
    next(new errorClass("FAILED TO SAVE THIS USER"), 400);
  }
  // res.status(200).json({
  //   status: 'success',
  //   token: token,
  //   data: {
  //     user: newUser,
  //   },
  // });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new errorClass("ENTER BOTH EMAIL AND PASSWORD", 400));
  }
  const user = await User.findOne({ email: email }).select("+password");
  if (!user || !(await user.checkPass(password))) {
    next(new errorClass("WRONG INPUT DATA", 400));
  }
  sendToken(user, res, 201);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.Authorization &&
    req.headers.Authorization.startsWith("Bearer")
  ) {
    token = Authorization.split(" ")[1];
  } else if (req.cookies.shortifyToken) {
    token = req.cookies.shortifyToken;
  }
  if (!token) {
    next(new errorClass("please try to log in Again", 400));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) {
    next(new errorClass("User Does Not Exist", 400));
  }
  if (!user.checkiat(decoded.iat)) {
    next(new errorClass("PLEASE RELOGIN YOU CHANGED YOUR PASSWORD", 400));
  }
  req.user = user;
  next();
});

exports.authorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(new errorClass("YOU ARE NOT AUTHORIZED FOR THIS PAGE", 401));
    } else {
      next();
    }
  };
};
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  let token;

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next();
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  if (!user.checkiat(decoded.iat)) {
    return next();
  }
  const user = await User.findbyId(decoded.id);
  if (!user) {
    return next();
  }
  res.locals.user = user;
});

exports.sendpasswordReset = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  console.log(user);
  if (!user) {
    return next(new errorClass("THIS USER DOES NOT EXIST", 500));
  }
  const resetToken = user.setResetVariables();
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/passwordReset/${resetToken}`;

  console.log(user);
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  try {
    await sendMail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(400).json({
      status: "fail",
      message: "Failed to send email",
      error: {
        err,
      },
    });
    return next(
      new errorClass(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});
exports.passwordReset = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");
  console.log("hasedToken", hashedToken);
  const user = await User.findOne({
    email: "abdulazizkadeem@gmail.com",
  }).select("+password");
  console.log("User ----", user);
  if (!user) {
    return next(new errorClass("THIS LINK HAS EXPIRED", 400));
  }
  3;

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
});

exports.loggedInPasswordChange = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { password, newPassword, passwordConfirm } = req.body;
  if (!(await user.checkPass(password))) {
    next(new errorClass("this password does not match the User", 400));
  }
  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;
  user.save({ validateBeforeSave: true });
});
