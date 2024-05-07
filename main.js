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

function findArrayDifference(array1, array2) {
  // Find items in array1 not in array2
  const diff1 = array1.filter(item => !array2.includes(item));
  
  // Find items in array2 not in array1
  const diff2 = array2.filter(item => !array1.includes(item));
  
  // Combine the unique elements from both arrays
  const combinedDiff = diff1.concat(diff2);
  
  return combinedDiff;
}

const main = async () => {
  await makeDBConnection();
  for (let j = v.j; j < countries.length; j++) {
    let country = countries[j].cca2;
    console.log("Country:", country);
    let c = await Country.findOne({ country: countries[j] });
    if (c == null) {
      c = await Country.create({
        country: countries[j],
      });
    }
    let pc = await Division.countDocuments({ country: c._id });
    if (pc == 0) {
      let secondaryDivisions = await fetchCityAndDivisions(
        "admin2",
        country,
        null
      );
      if (secondaryDivisions.length != 0)
        for (let l = v.l; l < secondaryDivisions.length; l++) {
          let secondaryDivision = secondaryDivisions[l];
          console.log(
            "Country:",
            country,
            "Division:",
            null,
            "Division:",
            secondaryDivision.text
          );
          let sd = await SubDivision.findOne({
            country: c._id,
            sub_division: secondaryDivision,
          });
          if (sd == null) {
            sd = await SubDivision.create({
              country: c._id,
              sub_division: secondaryDivision,
            });
          }
          let cities = await fetchCityAndDivisions(
            "city",
            country,
            null,
            secondaryDivision.id
          );
          for (let m = v.m; m < cities.length; m++) {
            let city = cities[m];
            console.log(
              "Country:",
              country,
              "Division:",
              null,
              "Division:",
              secondaryDivision.text,
              "City:",
              city.text
            );
            await City.updateOne(
              {
                country: c._id,
                sub_division: sd._id,
                city: city,
              },
              {
                country: c._id,
                sub_division: sd._id,
                city: city,
              },
              { upsert: true }
            );
            fs.writeFileSync(
              "history.json",
              JSON.stringify({
                j,
                k: 0,
                l,
                m,
              })
            );
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      else {
        let cities = await fetchCityAndDivisions("city", country, null, null);
        for (let m = v.m; m < cities.length; m++) {
          let city = cities[m];
          console.log(
            "Country:",
            country,
            "Division:",
            null,
            "Division:",
            secondaryDivisions.text,
            "City:",
            city.text
          );
          await City.updateOne(
            {
              country: c._id,
              // sub_division: sd._id,
              city: city,
            },
            {
              country: c._id,
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
              k: 0,
              l: 0,
              m,
            })
          );
        }
      }
    }
    // let primaryDivisions = await fetchCityAndDivisions("admin1", country);
    // for (let k = v.k; k < primaryDivisions.length; k++) {
    //   let primaryDivision = primaryDivisions[k];
    //   console.log("Country:", country, "Division:", primaryDivision.text);
    //   let pd = await Division.findOne({
    //     country: c._id,
    //     division: primaryDivision,
    //   });
    //   if (pd == null) {
    //     pd = await Division.create({
    //       country: c._id,
    //       division: primaryDivision,
    //     });
    //   }
    //   let secondaryDivisions = await fetchCityAndDivisions(
    //     "admin2",
    //     country,
    //     primaryDivision.id
    //   );
    //   if (secondaryDivisions.length != 0)
    //     for (let l = v.l; l < secondaryDivisions.length; l++) {
    //       let secondaryDivision = secondaryDivisions[l];
    //       console.log(
    //         "Country:",
    //         country,
    //         "Division:",
    //         primaryDivision.text,
    //         "Division:",
    //         secondaryDivision.text
    //       );
    //       let sd = await SubDivision.findOne({
    //         country: c._id,
    //         division: pd._id,
    //         sub_division: secondaryDivision,
    //       });
    //       if (sd == null) {
    //         sd = await SubDivision.create({
    //           country: c._id,
    //           division: pd._id,
    //           sub_division: secondaryDivision,
    //         });
    //       }
    //       let cities = await fetchCityAndDivisions(
    //         "city",
    //         country,
    //         primaryDivision.id,
    //         secondaryDivision.id
    //       );
    //       for (let m = v.m; m < cities.length; m++) {
    //         let city = cities[m];
    //         console.log(
    //           "Country:",
    //           country,
    //           "Division:",
    //           primaryDivision.text,
    //           "Division:",
    //           secondaryDivision.text,
    //           "City:",
    //           city.text
    //         );
    //         await City.updateOne(
    //           {
    //             country: c._id,
    //             division: pd._id,
    //             sub_division: sd._id,
    //             city: city,
    //           },
    //           {
    //             country: c._id,
    //             division: pd._id,
    //             sub_division: sd._id,
    //             city: city,
    //           },
    //           { upsert: true }
    //         );
    //         fs.writeFileSync(
    //           "history.json",
    //           JSON.stringify({
    //             j,
    //             k,
    //             l,
    //             m,
    //           })
    //         );
    //       }
    //       await new Promise((resolve) => setTimeout(resolve, 1000));
    //     }
    //   else {
    //     let cities = await fetchCityAndDivisions(
    //       "city",
    //       country,
    //       primaryDivision.id,
    //       null
    //     );
    //     for (let m = v.m; m < cities.length; m++) {
    //       let city = cities[m];
    //       console.log(
    //         "Country:",
    //         country,
    //         "Division:",
    //         primaryDivision.text,
    //         "Division:",
    //         secondaryDivisions.text,
    //         "City:",
    //         city.text
    //       );
    //       await City.updateOne(
    //         {
    //           country: c._id,
    //           division: pd._id,
    //           // sub_division: sd._id,
    //           city: city,
    //         },
    //         {
    //           country: c._id,
    //           division: pd._id,
    //           // sub_division: sd._id,
    //           city: city,
    //         },
    //         { upsert: true }
    //       );
    //       /**  */
    //       fs.writeFileSync(
    //         "history.json",
    //         JSON.stringify({
    //           j,
    //           k,
    //           l: 0,
    //           m,
    //         })
    //       );
    //     }
    //   }
    //   await new Promise((resolve) => setTimeout(resolve, 1000));
    // }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

main();
