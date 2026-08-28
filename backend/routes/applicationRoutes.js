const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    createApplication,
    getApplications,
    getApplicationStats,
    getApplicationById,
    updateApplication,
    deleteApplication
} = require("../controllers/applicationController");

const router = express.Router();

router.use(protect); // Apply authentication middleware to all routes ,iska matlab is router ke saare routes protected hain.

/* 
Therefore-
GET /
GET /:id
POST /
PUT /:id
DELETE /:id
sab JWT require karenge
*/

router.get("/", getApplications);

router.get("/stats", getApplicationStats);

router.get("/:id", getApplicationById);

router.post("/", createApplication);

router.put("/:id", updateApplication);

router.delete("/:id", deleteApplication);

module.exports = router;