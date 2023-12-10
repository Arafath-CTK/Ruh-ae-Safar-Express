const express = require("express");
const ejs = require("ejs");
const bodyparser = require("body-parser"); //for the easy conversion of JSON string to JavaScript Object. use a middleware for achieve that
const path = require("path");
const fs = require("fs");

const app = express(); //now we can access express function through this variable.
app.set("view engine", "ejs"); //ejs is set as the default template engine.
app.set("views", "./views"); //declared the view folder in which the ejs files are stored.

app.use(bodyparser.json()); //Its a middleware, it automatically convert all JSON data to JS object. no need to do it manually using body and chunks

// Home Page.
app.get("/" && "/home", (req, res) => {
  const data = {
    pageTitle: "Ruh Ae Safar | Your Travel Partner",
    user: null,
  };
  res.render("index", data);
});

// Table Page
app.get("/bookingstable", (req, res) => {
  res.render("table");
});

// New user sumit
app.post("/submit", (req, res) => {
  const userData = req.body; // The bodyparse middleware alredy converted the incoming json data into JS object, we can use it directly.

  fs.readFile("./data/users.json", "utf-8", (err, data) => {
    if (err) {
      console.error("Error while reading users.json");
      res.status(500).send("Error while reading users.json");
    } else {
      try {
        const existingData = JSON.parse(data); // parsing will return array bcs the json datas are already in an array.
        userData.id = existingData.length + 1;
        existingData.push(userData);

        fs.writeFile(
          "./data/users.json",
          JSON.stringify(existingData, null, 2),
          (writeError) => {
            if (writeError) {
              console.error(
                "Error while adding new user to database",
                writeError
              );
              res
                .status(500)
                .send(
                  `Error while adding new user to database : ${writeError}`
                );
            } else {
              console.log("New user added successfully");
              res
                .status(200)
                .send("New user has been added to the database succecssfully");
            }
          }
        );
      } catch (error) {
        console.error("Unexpected error occured", error);
        res.status(500).send(`Unexpected error occured : ${error}`);
      }
    }
  });
});

// Reading the updated database for displaying that into the table.
app.get("/getdata", (req, res) => {
  fs.readFile("./data/users.json", "utf-8", (err, data) => {
    if (err) {
      console.error(
        "Error occured while reading database for adding datas to table"
      );
      res
        .status(500)
        .send("Error occured while reading database for adding datas to table");
    } else {
      try {
        const existingData = JSON.parse(data); // Converting the JSON string to JS object in the server itself.
        res.status(200).json(existingData); // Passing the converted data.
      } catch (error) {
        console.error(
          "Unexpected error occured while adding data to table",
          error
        );
        res
          .status(500)
          .send(
            `Unexpected error occured while adding data to table : ${error}`
          );
      }
    }
  });
});

// Modify button redirect the page to the home page in which the input fields already filled with datas already entered.
app.get("/modifyuserpage/:id", (req, res) => {
  const userId = parseInt(req.params.id); // Easily extracted the user id passed from client side.

  fs.readFile("./data/users.json", "utf-8", (err, data) => {
    if (err) {
      console.error(
        "Error occured while reading database for modifying an entry"
      );
      res
        .status(500)
        .send("Error occured while reading database for modifying an entry");
    } else {
      try {
        const existingData = JSON.parse(data);
        const user = existingData.find((user) => user.id === userId); // Finding the user id in the database.

        if (user) {
          res.render("index", { user }); // Here we are showing the same page of home in this route and also passing the value for user to index.ejs, so the input values will be dislayed already, as we written in index.
        } else {
          console.log(`User with Id ${userId} not found`);
          res.status(500).send(`User with Id ${userId} not found`);
        }
      } catch (error) {
        console.error(
          "Unexpected error occured while adding modified data",
          error
        );
        res
          .status(500)
          .send(
            `Unexpected error occured while adding modified data : ${error}`
          );
      }
    }
  });
});

//Modify section
app.put("/modifyuser/:id", (req, res) => {
  const userId = parseInt(req.params.id); // User id extracted from the url.
  const modifiedData = req.body; // The data already converted to JS by middleware.

  fs.readFile("./data/users.json", "utf-8", (err, data) => {
    if (err) {
      console.error(
        "Error occured while reading database for updating the modified data"
      );
      res
        .status(500)
        .send(
          "Error occured while reading database for updating the modified data"
        );
    } else {
      try {
        const existingData = JSON.parse(data);
        const modifyingUser = existingData.findIndex(
          (user) => user.id === userId
        ); // The findIndex method returns the index if its true and returns "-1" if its false.
        if (modifyingUser !== -1) {
          existingData[modifyingUser] = modifiedData;

          // Then rewrite the new data to the Data base.
          fs.writeFile(
            "./data/users.json",
            JSON.stringify(existingData, null, 2),
            (writeError) => {
              if (writeError) {
                console.error("Error while writing modified data to database");
                res
                  .status(500)
                  .send("Error while writing modified data to database");
              } else {
                console.log("Data modified in the database successfully");
                res
                  .status(200)
                  .send("Data modified in the database successfully");
              }
            }
          );
        } else {
          console.log("Booking not found for modifying data");
          res.status(404).send("Booking not for modifying");
        }
      } catch (error) {
        console.error(
          "Unexpected error occured while updating the modified data",
          error
        );
        res
          .status(500)
          .send(
            `Unexpected error occured while updating the modified data due to ${error}`
          );
      }
    }
  });
});

//Server hosting locally
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server runs at ${port}`);
});
