const mongoose = require("mongoose");
const shortId = require("shortid");
const validator = require("validator");

const linkSchema = new mongoose.Schema(
  {
    fullLink: {
      type: String,
      required: true,
      validate: [validator.isURL, "this needs to be a valid url"],
    },
    short: {
      type: String,
      default: shortId.generate,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "shortifyuser",
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// linkSchema.pre(/^find/, function (next) {
//   this.populate({ path: "user" });
//   next();
// });

module.exports = mongoose.model("LinkS", linkSchema);
