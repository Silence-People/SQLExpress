const express = require("express");
const { faker } = require('@faker-js/faker');
const mysql = require("mysql2");
const app = express();
const methodOverride = require("method-override");
const { v4: uuidv4 } = require('uuid');
const port = 8080;
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password: "Kingdom@987"
});
let getRandomUser = () => {
  return [
     faker.string.uuid(),
     faker.internet.userName(),
     faker.internet.email(),
     faker.internet.password(),
  ];
}

app.get("/" , (req, res) =>{
  let q =  "SELECT COUNT(*) FROM user"; 
  try{
    connection.query(q, (err, result) => {
      if(err) throw err;
      let count = result[0]["COUNT(*)"];
      res.render("index.ejs", {count}); //ALways pass onject in render
    });
    } catch (err) {
      console.log(err);
      res.send("Error in database");
    };
});

//SHow
app.get("/users", (req, res) =>{
  let q = "SELECT id, username, email FROM user";
  try{
    connection.query(q, (err, users) => {
      if(err) throw err;
      res.render("show.ejs", {users});
       //ALways pass onject in render
    });
    } catch (err) {
      console.log(err);
      res.send("Error in database");
    };
});

//edit route
app.get("/user/:id/edit" , (req,res) =>{
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id = "${id}"`;
  try{
    connection.query(q, (err, result) => {
      if(err) throw err;
      let user = result[0];
      res.render("edit.ejs", {user});
       //ALways pass onject in render
    });
    } catch (err) {
      console.log(err);
      res.send("Error in database");
    };
});

//update route
app.patch("/user/:id", (req, res) =>{
  let {id} = req.params;
  let { password: formPass, username : newUsername} = req.body;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try{
    connection.query(q, (err, result) => {
      if(err) throw err;
      let user = result[0];
      
      if(formPass != user.password){
        res.send("Password is incorrect");
      } else {
        let q2 = `UPDATE user SET username='${newUsername}' WHERE id = '${id}'`;
        connection.query(q2, (err, result) => {
                  if(err) throw err;
                  res.redirect("/users");
                });
      }
    });
    } catch (err) {
      console.log(err);
      res.send("Error in database");
    };
});
//Add a route
app.get("/user/add", (req, res) =>{
  res.render("add.ejs");
});

app.post("/users" , (req, res) =>{
  let id = uuidv4();
  let {username, email , password} = req.body;
  let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}', '${username}', '${email}', '${password}')`;
  try{
    connection.query(q, (err, result) => {
      if(err) throw err;
      res.redirect("/users");
    });
    } catch (err) {
      console.log(err);
      res.send("Error in database");
    };
});

app.get("/user/:id/delete", (req, res) =>{
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id = "${id}"`;
  try{
    connection.query(q, (err, result) => {
      if(err) throw err;
      let user = result[0];
      res.render("delete.ejs", {user});
       //ALways pass onject in render
    });
    } catch (err) {
      console.log(err);
      res.send("Error in database");
    };
})

app.delete("/user/:id", (req, res) =>{

  let {id} = req.params;
  let {password : givenPass} = req.body;
  console.log(givenPass);
  let q = `SELECT * FROM user WHERE id = '${id}'`;

  try{
    connection.query(q, (err, result) =>{
      if(err) throw err;
      let user = result[0];
      
      if(givenPass != user.password){
        res.send("Password is incorrect");
      } else {
        let q2 = `DELETE FROM user WHERE id = '${id}'`;
        connection.query(q2, (err, result) => {
                  if(err) throw err;
                  res.redirect("/users");
                });
      }
    });
  }
  catch(err){
    console.log(err);
    res.send("Error in database");
  }
});
app.listen(port, () =>{
  console.log("Server is running on port 8080");
});
