require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");


const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/userDB");

//create a new schema to store user data
const userSchema = new mongoose.Schema({
  email:{
    type:String,
    required:(true,"no email input")
  },
  password:{
    type:String,
    required:(true,"no password set")
  }
});
// a test to get the API_KEY written in .env
// console.log(process.env.API_KEY);

//to encrypt data (only password)
//but to keep our app.js file safe, a new file .env is created to keep all sensitive info
// const secret = "Thisisourlittlesecret.";
userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields: ["password"]});

const User = new mongoose.model("User",userSchema);

app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});
//handle register data
app.post("/register",function(req,res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  //if the user's data is saved in database successfully, take user to the secrets page
  newUser.save(function(err){
    if(!err){
      res.render("secrets");
    }else{
      console.log(err);
    }
  });
});

//check if the user typed in the right password
app.post("/login",function(req,res){
  const username = req.body.username;
  const userpw = req.body.password;
  User.findOne({email: username},function(err,foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        if(userpw === foundUser.password){
          res.render("secrets");
        }else{
          res.render("Wrong password");
        }
      }
    }
  });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
