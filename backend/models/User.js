const mongoose = require("mongoose"); //mongoose package ko load karta hai iska use karke hum MongoDB ke saath interact karte hai. mongoose ek ODM (Object Data Modeling) library hai jo MongoDB ke saath kaam karne ke liye use hoti hai.
//mongoose se MongoDB shema/model create karenge.

const userSchema = new mongoose.Schema(
    { //schema define karta hai ki MongoDB database mein user document ka structure kya hoga.
        name: { //user ka naam.
            type: String,
            required: [true, "Name is required"], //name field required hai aur agar name field empty hoga to error message "Name is required" print karega.
            trim: true, //agar user accidentally name ke aage ya peeche space de deta hai to trim: true usko remove kar dega.
            minlength: [2, "Name must be at least 2 characters long"],
            maxlength: [50, "Name cannot exceed 50 characters"]
        },

        email: { //user ka email address.
            type: String,
            required: [true, "Email is required"], //email field required hai aur agar email field empty hoga to error message "Email is required" print karega.
            unique: true, //email field unique hai aur agar user same email address se register karne ki koshish karega to error message "Email already exists" print karega.
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please provide a valid email address"
            ], //email field valid email address hona chahiye aur agar user invalid email address provide karega to error message "Please provide a valid email address" print karega.  
            trim: true,
            lowercase: true
        },

        password: { //user ka password.
            type: String,
            required: [true, "Password is required"],//password field required hai aur agar password field empty hoga to error message "Password is required" print karega.
            minlength: [6, "Password must be at least 6 characters long"],// password ki minimum length 6 characters honi chahiye.
            select: false //password field ko default select nahi karega jab user document fetch karega. iska matlab hai ki password field ko default response mein nahi bhejega. ye security ke liye important hai.
        }
        // ye schema ke andar user document ke fields define kiye gaye hai jaise name, email, password etc.
    },
    {
        timestamps: true
        //mongoose automatically createdAt and updatedAt fields add karega user document mein. ye fields user document ke creation aur update time ko track karne ke liye use hote hai.
    }
);

const User = mongoose.model("User", userSchema); 
//schema ko actual MongoDB model mein convert karta hai, //User model ke andar user document ke saare methods aur properties available honge.

module.exports = User; //User model ko doosri file like controllers/authController.js mein use karne ke liye export kiya hai.