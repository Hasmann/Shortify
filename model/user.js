const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Link = require("./link.js");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [validator.isEmail, "ENTER A VALID EMAIL"],
    },
    password: {
      type: String,
      require: [true, "please provide a password"],
      minlength: [10, "password must have a minimum of 10 characters"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      require: [true, "please confirm your password"],
      //validating if the passwordsMatch
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: `${this.passwordConfirm} does not match ${this.password}`,
      },
    },
    role: {
      type: String,
      enum: ["admin", "user", "dev"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: "true",
    },
    iscreatedAt: {
      type: Date,
      default: Date.now(),
    },
    passwordResetToken: {
      type: String,
      default: undefined,
    },
    passwordChangedAfter: {
      type: Date,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("myLinks", {
  ref: "LinkS",
  localField: "_id",
  foreignField: "user",
});

userSchema.pre(/^find/, function (next) {
  this.find().populate("myLinks");
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.checkPass = async function (EnteredEmail) {
  return await bcrypt.compare(EnteredEmail, this.password);
};
userSchema.methods.checkiat = function (iat) {
  if (this.passwordChangedAfter) {
    const changedPass = parseInt(
      this.passwordChangedAfter.getTime() / 1000,
      10
    );

    return iat > changedPass;
  }
  return true;
};
userSchema.methods.setResetVariables = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, "DB RESET", this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("shortifyuser", userSchema);
