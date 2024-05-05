require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const {
  makeDBConnection,
  City,
  Division,
  SubDivision,
  Country,
} = require("./database");

const countriesJson = require("./json/countries.json");

const { fetchCityAndDivisions } = require("./api/scrapio");

const getCountries = () => {
  return countriesJson;
};

const countries = getCountries();

let v = {
  j: 0,
  k: 0,
  l: 0,
  m: 0,
};
try {
  v = JSON.parse(fs.readFileSync("history.json", "utf8"));
} catch (err) {
  console.error(err);
}

const main = async () => {
  await makeDBConnection();
  for (let j = v.j; j < countries.length; j++) {
    let country = countries[j].cca2;
    console.log("Country:", country);
    let c = await Country.updateOne(
      { country: countries[j] },
      { country: countries[j] },
      { upsert: true }
    );
    let primaryDivisions = await fetchCityAndDivisions("admin1", country);
    for (let k = v.k; k < primaryDivisions.length; k++) {
      let primaryDivision = primaryDivisions[k];
      console.log("Country:", country, "Division:", primaryDivision.text);
      let pd = await Division.updateOne(
        {
          country: c._id,
          division: primaryDivision,
        },
        {
          country: c._id,
          division: primaryDivision,
        },
        { upsert: true }
      );
      let secondaryDivisions = await fetchCityAndDivisions(
        "admin2",
        country,
        primaryDivision.id
      );
      if (secondaryDivisions.length != 0)
        for (let l = v.l; l < secondaryDivisions.length; l++) {
          let secondaryDivision = secondaryDivisions[l];
          console.log(
            "Country:",
            country,
            "Division:",
            primaryDivision.text,
            "Division:",
            secondaryDivision.text
          );
          let sd = await SubDivision.updateOne(
            {
              country: c._id,
              division: pd._id,
              sub_division: secondaryDivision,
            },
            {
              country: c._id,
              division: pd._id,
              sub_division: secondaryDivision,
            },
            { upsert: true }
          );
          let cities = await fetchCityAndDivisions(
            "city",
            country,
            primaryDivision.id,
            secondaryDivision.id
          );
          for (let m = v.m; m < cities.length; m++) {
            let city = cities[m];
            console.log(
              "Country:",
              country,
              "Division:",
              primaryDivision.text,
              "Division:",
              secondaryDivision.text,
              "City:",
              city.text
            );
            await City.updateOne(
              {
                country: c._id,
                division: pd._id,
                sub_division: sd._id,
                city: city,
              },
              {
                country: c._id,
                division: pd._id,
                sub_division: sd._id,
                city: city,
              },
              { upsert: true }
            );
            fs.writeFileSync(
              "history.json",
              JSON.stringify({
                j,
                k,
                l,
                m,
              })
            );
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      else {
        let cities = await fetchCityAndDivisions(
          "city",
          country,
          primaryDivision.id,
          null
        );
        for (let m = v.m; m < cities.length; m++) {
          let city = cities[m];
          console.log(
            "Country:",
            country,
            "Division:",
            primaryDivision.text,
            "Division:",
            secondaryDivisions.text,
            "City:",
            city.text
          );
          await City.updateOne(
            {
              country: c._id,
              division: pd._id,
              // sub_division: sd._id,
              city: city,
            },
            {
              country: c._id,
              division: pd._id,
              // sub_division: sd._id,
              city: city,
            },
            { upsert: true }
          );
          /**  */
          fs.writeFileSync(
            "history.json",
            JSON.stringify({
              j,
              k,
              l: 0,
              m,
            })
          );
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

main();
