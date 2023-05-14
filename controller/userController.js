const Link = require(`${__dirname}/../model/link.js`);
const User = require(`${__dirname}/../model/user.js`);
const catchAsync = require(`${__dirname}/../errorHandles/errorAsync.js`);
const errorClass = require(`${__dirname}/../errorHandles/errorClass.js`);

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  if (!users) {
    return next(new errorClass("FAILED to FIND ALL THE USERS ", 400));
  }
  res.status(200).json({
    status: "success",
    size: users.length,
    data: {
      users,
    },
  });
});

exports.getoneUser = catchAsync(async (req, res, next) => {
  const id = req.params.userId;
  const user = await User.findById(id);
  if (!user) {
    return next(new errorClass("FAILED to FIND USER ", 400));
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const id = req.params.userId;
  const user = await User.findById(id);
  user.active = false;
  await user.save({ validateBeforeSave: true });
  if (!user) {
    return next(new errorClass("FAILED to FIND USER ", 400));
  }
  res.status(204).json({
    status: "success",
    data: {
      user,
    },
  });
});
