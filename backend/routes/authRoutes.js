const express = require("express"); //express package ko load karta hai jisse hum backend mein routes create karenge. express ek web framework hai jo Node.js ke upar kaam karta hai aur HTTP requests ko handle karta hai.

const { //registerUser, loginUser } = require("../controllers/authController"); //authController.js file ke andar registerUser aur loginUser functions ko import karta hai. ye functions user registration aur login ke liye use honge.
    registerUser,
    loginUser
} = require("../controllers/authController");

const router = express.Router(); //express.Router() ka use karke ek router object create kiya hai jisse hum routes define karenge. ye router object ke andar hum different HTTP methods ke liye routes define karenge jaise POST, GET, PUT, DELETE etc.

router.post("/register", registerUser); //ye route POST request ke liye hai aur "/register" endpoint ke liye hai. jab user "/register" endpoint par POST request bhejega to registerUser function execute hoga jo user registration ke liye responsible hoga.

router.post("/login", loginUser); //ye route POST request ke liye hai aur "/login" endpoint ke liye hai. jab user "/login" endpoint par POST request bhejega to loginUser function execute hoga jo user login ke liye responsible hoga.

module.exports = router; //ye router object ko doosri file like server.js mein use karne ke liye export kiya hai. server.js file ke andar ye router object ko import karke use kiya jayega jisse hum backend ke liye routes define karenge.