const express = require("express");
const path = require("path");
const Link = require("./model/link.js");
const app = express();
const cookieParser = require("cookie-parser");
const router = require("./routes/viewRouter.js");
const userRoutes = require("./routes/userRoutes.js");
const userApiRoute = require("./routes/linkApiRoutes");
const errorMiddleware = require(`${__dirname}/errorHandles/errorMiddleware`);
const morgan = require("morgan");
app.use(morgan("dev"));
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static(`${__dirname}/public`));
app.use(cookieParser());

// app.get("/", async (req, res) => {
//   const linkRes = await Link.find();
//   res.render("index", { linkRes: linkRes });
// });
// app.post("/shortUrls", async (req, res) => {
//   await Link.create({ full: req.body.fullUrl });
//   res.redirect("/");
// });

// app.get("/:shortUrl", async (req, res) => {
//   const url = req.params.shortUrl;
//   const find = await Link.findOne({ short: url });
//   if (find == null) {
//     res.status(404);
//   } else {
//     find.clicks++;
//     find.save();
//     res.redirect(find.full);
//   }
// });
app.use(errorMiddleware);
app.use("/", router);
app.use("/ap1/v1/link", userApiRoute);
app.use("/api/v1/user", userRoutes);
module.exports = app;
