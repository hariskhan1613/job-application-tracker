require("dotenv").config(); //dotenv package ko load karta hai iska use karke .env file ke andar jo bhi environment variables define kiye hai unko access karne ke liye use kiya hai.
/*
iske baad-
process.env.PORT
process.env.MONGO_URI
process.env.JWT_SECRET
available ho jate hai. ye variables .env file ke andar define kiye gaye hai.
important- Isko MongoDB connection import/use hone se pehle load karna zaroori hai.
*/
const express = require("express"); //express package ko load karta hai iska use karke hum backend server create karte hai aur routes define karte hai.
const cors = require("cors");//cors package ko load karta hai iska use karke hum frontend aur backend ke beech mein cross-origin resource sharing enable karte hai and dono ke beech requests allow karta hai.

/*
development mein fronted likely-
http://localhost:5173
backend likely-
http://localhost:5000
ye hoga jo ke  diffrent origins hain
*/

const connectDB = require("./config/db"); //jo connectDB function humne config/db.js file mein define kiya hai usko import karne ke liye use kiya hai. ye function MongoDB database ke saath connection establish karta hai.

const authRoutes = require("./routes/authRoutes");//authRoutes file ke andar define kiye gaye routes ko import karne ke liye use kiya hai. ye routes user authentication ke liye use hote hai jaise ki login, register, logout etc.

const applicationRoutes = require("./routes/applicationRoutes");//applicationRoutes file ke andar define kiye gaye routes ko import karne ke liye use kiya hai. ye routes job applications ke liye use hote hai jaise ki create, read, update, delete etc.

const app = express(); // express application create karne ke liye use kiya hai. ye app variable ke andar express application ka instance store hota hai jisko hum routes define karne ke liye use karte hai.
//app- ab hamara backend server/application hai.

const PORT = process.env.PORT || 5000; //pehle .env se port access karne ki koshish karega agar .env file mein PORT variable define nahi hai to default port 5000 use karega.

connectDB(); // MongoDB connection establish karta hai.

app.use(
    cors({
        origin: true,
        credentials: true
    })
); // abhi development ke liye flexible cors configuration hai, and later deployment ke liye specific origin set karenge. ye cors middleware enable karta hai jisse frontend aur backend ke beech mein cross-origin requests allow hoti hai.

app.use(express.json()); // frontend se aane wale requests ke body ko json format mein parse karne ke liye use kiya hai. ye middleware enable karta hai jisse hum frontend se json data receive kar sakte hai.

app.get("/", (req, res) => { // browser/postman se "/" route pe GET request aane par ye callback function execute hoga. ye route backend server ke root route ko handle karta hai.
    res.status(200).json({ // response status 200 means request successful hai. ye json format mein response bhejega.
        success: true,
        message: "Job Application Tracker API is running"
    });// json response ke andar success true hai aur message mein "Job Application Tracker API is running" print karega.
});

app.use("/api/auth", authRoutes); // ye route backend server ke liye "/api/auth" route ko handle karta hai. ye authRoutes file ke andar define kiye gaye routes ko use karta hai. ye route user authentication ke liye use hota hai jaise ki login, register, logout etc.

app.use("/api/applications", applicationRoutes); // ye route backend server ke liye "/api/applications" route ko handle karta hai. ye applicationRoutes file ke andar define kiye gaye routes ko use karta hai. ye route job applications ke liye use hote hai jaise ki create, read, update, delete etc.

app.use((req, res) => {
    res.status(404).json({ // agar koi request aati hai jo defined routes mein match nahi hoti to ye callback function execute hoga. ye route backend server ke liye 404 not found error ko handle karta hai.
        success: false,
        message: "Route not found"
    }); //ye future mein debugging ke liye helpful hoga. ye json format mein response bhejega jisme success false hai aur message mein "Route not found" print karega.
});

app.listen(PORT, "0.0.0.0", () => { //iska matlab hai ki server ko specified PORT pe listen karne ke liye start kar diya hai. ye callback function execute hoga jab server successfully start ho jayega aur specified PORT pe listen karne lagega.
    console.log(`Server running on port ${PORT}`); // ye terminal mein print karega ki server successfully start ho gaya hai aur specified PORT pe listen kar raha hai.
});