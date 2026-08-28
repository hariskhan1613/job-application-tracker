const jwt = require("jsonwebtoken"); // jwt token generate karne ke liye hai.

const protect = (req, res, next) => { // ye middleware function hai jo user ke request ko protect karega. ye function check karega ki user ke request mein valid JWT token hai ya nahi. agar valid token hai to next() function call hoga aur request aage process hogi. agar valid token nahi hai to error response bhejega.
    try {
        const authHeader = req.headers.authorization; //request ka authorization header read karta hai

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            }); //agar token nahi hai to 401 status code ke saath error response bhejega jisme message "Authentication required" hoga.
        }

        const token = authHeader.split(" ")[1]; //token ko authorization header se extract karta hai. authorization header ka format "Bearer <token>" hota hai. isliye split(" ")[1] ka use karke token ko extract kiya hai.

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        /*
        JWT verify karta hai.
        Agar token:
        fake hai
        tampered hai
        expired hai
        toh error throw hoga aur catch execute hoga.
        */
        req.user = {
            id: decoded.userId
        }; // ye line request object mein user ka id add kar rahi hai taki aage ke middleware ya route handler mein user ka id access kiya ja sake.
        //Important- Ye bahut important hai, kyunki applications ko user-specific rakhna hai. 
        //Spec ke according application queries mein user's ID ke basis par filtering honi chahiye taaki ek user doosre user ka data na dekh sake.

        next(); // agar token valid hai to next() function call hoga aur request aage process hogi.
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });// agar token invalid ya expired hai to 401 status code ke saath error response bhejega jisme message "Invalid or expired token" hoga.
    }
};

module.exports = protect; // ye middleware function ko export karta hai taki isse dusre files mein use kiya ja sake.