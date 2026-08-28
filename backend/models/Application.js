const mongoose = require("mongoose"); //mongoose package ko load karta hai iska use karke hum MongoDB ke saath interact karte hai aur data ko define karte hai.

const APPLICATION_STATUSES = [ //Ye status values ko ek single place par define kiya hai
    //isse controller mein baar baar statuses likhne ki zarurat nahi hai aur agar future mein status values change karni ho to sirf yahan change karna hoga.
    "Applied",
    "OA/Assessment",
    "Interview Scheduled",
    "Interview Done",
    "Offer",
    "Rejected",
    "Withdrawn"
];

const applicationSchema = new mongoose.Schema(
    { //ye applicationSchema define karta hai jisme application ke fields aur unke validation rules define kiye gaye hai. ye schema MongoDB collection ke structure ko define karta hai.
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", //mongoose ko batata hai ki ye ObjectId User model ko refer karta hai. iska matlab hai ki ye field User model ke documents ke saath relation establish karta hai.
            required: [true, "User is required"], //user based queries frequently hongi isi liye user field indexed hai.
            index: true
        },

        company: {
            type: String,
            required: [true, "Company name is required"],
            trim: true,
            minlength: [1, "Company name cannot be empty"],
            maxlength: [100, "Company name cannot exceed 100 characters"]
        },

        role: {
            type: String,
            required: [true, "Job role is required"],
            trim: true,
            minlength: [1, "Job role cannot be empty"],
            maxlength: [150, "Job role cannot exceed 150 characters"]
        },

        status: {
            type: String,
            enum: {
                values: APPLICATION_STATUSES,
                message: "Invalid application status"
            },
            default: "Applied"
        },

        appliedDate: {
            type: Date,
            required: [true, "Applied date is required"]
        }, // ye application kab submit hui thi ye batayega. aur later follow-up reminders ke liye use hoga and analytics ke liye bhi use hoga.

        jobLink: {
            type: String,
            trim: true,
            maxlength: [500, "Job link cannot exceed 500 characters"],
            default: ""
        },

        salaryRange: {
            type: String,
            trim: true,
            maxlength: [100, "Salary range cannot exceed 100 characters"],
            default: ""
        },

        notes: {
            type: String,
            trim: true,
            maxlength: [2000, "Notes cannot exceed 2000 characters"],
            default: ""
        }
    },
    {
        timestamps: true //ye automatically createdAt aur updatedAt fields ko add karta hai jisse application ke creation aur last update time ko track kar sakte hai.
    }
);

applicationSchema.index({
    user: 1,
    appliedDate: -1
});//ye compound index create karta hai jisme user field ascending order mein aur appliedDate field descending order mein index hoti hai. ye queries ko optimize karta hai jisme user aur appliedDate fields ka use hota hai.

const Application = mongoose.model(
    "Application",
    applicationSchema
);

module.exports = Application;