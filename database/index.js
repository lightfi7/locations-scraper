const mongoose = require("mongoose");
const City = require("./model/city.model");
const SubDivision = require("./model/sub_division.model");
const Division = require("./model/division.model");
const Country = require("./model/country.model");
mongoose.Promise = global.Promise;

const makeDBConnection = () =>
  new Promise((resolve, reject) => {
    mongoose;
    mongoose
      .connect("mongodb://127.0.0.1:27017/homestood")
      .then(() => {
        console.log("Connected to the database!");
        resolve();
      })
      .catch((err) => {
        console.log("Cannot connect to the database!", err);
        reject(err);
      });
  });

module.exports = { makeDBConnection, City, Division, SubDivision, Country };
