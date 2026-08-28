//importinng mongoose package
//mongoose help us to work in mongodb with javascript/node.js
const mongoose = require("mongoose");

//connectDB is an asynchronous function which i create
//mongodb is a connection network operation so we can use async/await appropriately to handle it.
const connectDB = async () => {
    try { //we kept connection code in try block because if connection fails then it will throw an error and we can catch it in catch block.
        const connection = await mongoose.connect(process.env.MONGO_URI); //await is used to wait for the connection to be established before moving on to the next line of code.
        //.env se mongodb connection string ko access karne ke liye process.env.MONGO_URI ka use kiya hai.

        console.log(
            //connection successful hone par terminal mein MongoDb host print karega.
            `MongoDB connected: ${connection.connection.host}`
            // connection.connection.host se mongodb ka host name print karne ke liye use kiya hai.
            
        );
    } catch (error) { //agar MongoDB connection fail ho jata hai to catch block mein error message print karega.
        console.error(`MongoDB connection failed: ${error.message}`); //actual error terminal mein print karega.

        process.exit(1); // agar database connect nahi hua to server ko running rakhne ka koi sense nahi hai 
        //isi liye application terminate karne ke liye process.exit(1) ka use kiya hai. 1 ka matlab hai ki application exit with failure.

    }
};

module.exports = connectDB; //function ko doosri file like server.js mein use karne ke liye export kiya hai.