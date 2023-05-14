const Link = require(`${__dirname}/../model/link.js`);
const User = require(`${__dirname}/../model/user.js`);
const catchAsync = require(`${__dirname}/../errorHandles/errorAsync.js`);
const errorClass = require(`${__dirname}/../errorHandles/errorClass.js`);
exports.postPage = async (req, res) => {
  try {
    await Link.create({ full: req.body.fullUrl });
    res.redirect("/");
  } catch (err) {
    res.send(err);
  }
};
exports.landingPage = async (req, res) => {
  try {
    const linkRes = await Link.find();
    res.render("index", { linkRes: linkRes });
  } catch (err) {
    res.send(err);
  }
};

exports.createShortLink = catchAsync(async (req, res, next) => {
  const createSlink = await Link.create({
    fullLink: req.body.fullLink,
    user: req.user._id,
  });
  if (!createSlink) {
    return next(new errorClass("FAILED TO CREATE SHORT LINK ", 400));
  }
  res.status(201).json({
    status: "success",
    data: {
      createSlink,
    },
  });
});

exports.deleteLink = catchAsync(async (req, res, next) => {
  const deleteID = req.params.linkId;
  const deleteSlink = await Link.findByIdAndDelete(deleteID);
  if (!deleteSlink) {
    return next(new errorClass("FAILED TO DELETE SHORT LINK ", 400));
  }
  res.status(200).json({
    status: "success",
    data: {
      deleteSlink,
    },
  });
});

exports.getAllLinks = catchAsync(async (req, res, next) => {
  const findLink = await Link.find().populate("user");
  if (!findLink) {
    return next(new errorClass("FAILED to FIND ALL THE LINKS ", 400));
  }
  res.status(200).json({
    status: "success",
    size: findLink.length,
    data: {
      findLink,
    },
  });
});

exports.redirect = async (req, res) => {
  try {
    const url = req.params.shortUrl;
    const find = await Link.findOne({ short: url });
    if (find == null) {
      res.status(404).json({
        status: "failed",
      });
    } else {
      find.clicks++;
      find.save();
      res.redirect(find.full);
    }
  } catch (err) {
    res.status(400).json({
      status: "error",
      error: { err },
    });
  }
};
