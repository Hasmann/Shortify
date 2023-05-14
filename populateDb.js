const mongoose = require("mongoose");
const dotenv = require("dotenv").config({ path: "./config.env" });
const Link = require(`${__dirname}/model/model.js`);

let DB = process.env.DATABASE.replaceAll(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("DB CONNECTION SUCCESSFUL...");
});

async function deleteDb() {
  try {
    await Link.deleteMany();
  } catch (err) {
    console.log(err);
  }
}

async function populateDb() {
  try {
    await Link.create();
  } catch (err) {
    console.log(err);
  }
}

if (process.argv[2] === "--delete") {
  deleteDb();
  console.log("DELETED SUCCESSFULLY");
  process.exit();
} else if (process.argv[2] === "--populate") {
  populateDb();
  console.log("DB POPULATED SUCCESSFULLY");
  process.exit();
} else {
  console.log("NOTHING WAS DONE HERE");
}
