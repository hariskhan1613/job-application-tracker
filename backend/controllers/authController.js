const bcrypt = require("bcryptjs"); //password hashing/comparison ke liye
//mai password ko plain text mein DB mein save nahi karunga
const jwt = require("jsonwebtoken"); // jwt token generate karne ke liye hai.

const User = require("../models/User"); //mongoose model ko import kar raha hai jisse hum user data ko MongoDB mein save karenge aur retrieve karenge.

const generateToken = (userId) => { //ek reusabe function hai jo userId ko input lega aur ek JWT token generate karega. ye token user ke authentication ke liye use hoga.
    //har jagah jwt token generate karne ka code repeate nahi karna padega, isliye ek function bana diya hai.
    return jwt.sign( //jwt create karta hai.
        {
            userId //token ke ander user ki identity store hogi. ye userId ko payload ke roop mein store karega. ye userId ko token ke andar encrypt karke bhejega.
        },
        process.env.JWT_SECRET, //ye secret .env se aa raha hai, isi liye secret ke ander hard code nahi hai.
        {
            expiresIn: "7d" //token 7 din ke liye valid hoga. iska matlab hai ki user ko 7 din ke baad dobara login karna padega. ye security ke liye important hai.
        }
    );
};

const registerUser = async (req, res) => { //signup ke liye user ka data receive karega aur DB mein save karega. ye async function hai kyunki DB ke saath interact karne ke liye asynchronous operations perform karne honge.
    try { //try catch block ka use kiya hai kyunki DB ke saath interact karte waqt errors aa sakte hai. agar error aata hai to catch block mein handle karenge.
        const { name, email, password } = req.body; //frontend/postman se aane wale json ko extract karta hai. 
        //ye data user ke signup form se aayega. 
        // //ye data req.body ke ander hoga kyunki hum express.json() middleware use kar rahe hai jo json data ko parse karta hai.

        if (!name || !email || !password) { //koi required field missing ho to request reject and throw an error.
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase(); //ye email ko normalize karta hai. ye ensure karega ki email ke aage ya peeche space na ho aur email lowercase mein ho. ye important hai kyunki email unique hona chahiye aur case sensitive nahi hona chahiye.

        const existingUser = await User.findOne({ //duplicate email ko check karega. agar same email se user already exist karta hai to request reject karega.
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            }); //agar user already exist karega to 409 status code return karega. ye status code conflict ko indicate karta hai. ye error message frontend/postman mein show hoga.
        }

        const hashedPassword = await bcrypt.hash(password, 12); //password ko hash karega. ye security ke liye important hai kyunki agar DB hack ho jata hai to plain text password leak nahi hoga.

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        }); //mongodb mein user create hoga. ye user document ko create karega aur DB mein save karega. ye operation asynchronous hai isliye await ka use kiya hai.

        const token = generateToken(user._id); //user create hone ke baad JWT token generate hoga. ye token user ke authentication ke liye use hoga. ye token ko frontend/postman mein bhejega.

        return res.status(201).json({ //201 status code ka matlab hai ki resource successfully create ho gaya hai. ye response frontend/postman mein show hoga.
            success: true,
            message: "Registration successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                },
                token
            }
        });
    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during registration"
        });
    }
};

const loginUser = async (req, res) => { //login ke liye user ka data receive karega aur DB mein check karega. ye async function hai kyunki DB ke saath interact karne ke liye asynchronous operations perform karne honge.
    try {
        const { email, password } = req.body; //frontend/postman se aane wale json ko extract karta hai. ye data user ke login form se aayega. ye data req.body ke ander hoga kyunki hum express.json() middleware use kar rahe hai jo json data ko parse karta hai.

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            }); //agar email ya password missing ho to request reject and throw an error. ye error message frontend/postman mein show hoga.
        }

        const normalizedEmail = email.trim().toLowerCase(); //ye email ko normalize karta hai. ye ensure karega ki email ke aage ya peeche space na ho aur email lowercase mein ho. ye important hai kyunki email unique hona chahiye aur case sensitive nahi hona chahiye.

        const user = await User.findOne({
            email: normalizedEmail
        }).select("+password"); //ye user ko DB mein find karega. ye operation asynchronous hai isliye await ka use kiya hai. ye user document ko return karega. ye select("+password") ka matlab hai ki password field ko bhi select karega kyunki password field ko default select nahi karega. ye security ke liye important hai.

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            }); //agar user exist nahi karta hai to request reject and throw an error. ye error message frontend/postman mein show hoga.
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        ); //ye password ko compare karega. ye operation asynchronous hai isliye await ka use kiya hai. ye boolean value return karega.

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });//agar password incorrect hai to request reject and throw an error. ye error message frontend/postman mein show hoga.
        }

        const token = generateToken(user._id); //user login hone ke baad JWT token generate hoga. ye token user ke authentication ke liye use hoga. ye token ko frontend/postman mein bhejega.

        return res.status(200).json({ //200 status code ka matlab hai ki request successful hai. ye response frontend/postman mein show hoga.
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                },
                token
            }
        });
    } catch (error) {//try catch block ka use kiya hai kyunki DB ke saath interact karte waqt errors aa sakte hai. agar error aata hai to catch block mein handle karenge.
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during login"
        });//agar server error aata hai to request reject and throw an error. ye error message frontend/postman mein show hoga.
    }
};

module.exports = {
    registerUser,
    loginUser
}; //ye functions ko doosri file like routes/authRoutes.js mein use karne ke liye export kiya hai.