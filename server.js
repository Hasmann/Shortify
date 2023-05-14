const app = require("./app.js");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({ path: "./config.env" });
const port = process.env.port;

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
});

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DATABASE CONNECTION SUCCESSFUL");
  });

app.listen(port, () => {
  console.log(`Server Running On Port ${port}`);
});
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
});
