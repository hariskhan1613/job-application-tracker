const mongoose = require("mongoose");

const Application = require("../models/Application");

const APPLICATION_STATUSES = [
    "Applied",
    "OA/Assessment",
    "Interview Scheduled",
    "Interview Done",
    "Offer",
    "Rejected",
    "Withdrawn"
];

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

const createApplication = async (req, res) => {
    try {
        const {
            company,
            role,
            status,
            appliedDate,
            jobLink,
            salaryRange,
            notes
        } = req.body || {}; // Destructure with default to empty object

        if (!company || !role || !appliedDate) { // Check for required fields
            return res.status(400).json({
                success: false,
                message: "Company, role and applied date are required"
            });
        }

        if (
            status &&
            !APPLICATION_STATUSES.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid application status"
            });
        }

        const parsedAppliedDate = new Date(appliedDate);

        if (Number.isNaN(parsedAppliedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid applied date"
            });
        }

        const application = await Application.create({
            user: req.user.id,
            company: company.trim(),
            role: role.trim(),
            status: status || "Applied",
            appliedDate: parsedAppliedDate,
            jobLink: jobLink?.trim() || "",
            salaryRange: salaryRange?.trim() || "",
            notes: notes?.trim() || ""
        });

        return res.status(201).json({
            success: true,
            message: "Application created successfully",
            data: {
                application
            }
        });
    } catch (error) {
        console.error("Create application error:", error);

        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(
                (validationError) => validationError.message
            );

            return res.status(400).json({
                success: false,
                message: messages[0] || "Validation failed"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error while creating application"
        });
    }
};

const getApplications = async (req, res) => { // Get all applications with optional filters and pagination
    try {
        const {
            status,
            search,
            page: pageQuery,
            limit: limitQuery
        } = req.query;

        const filter = {
            user: req.user.id
        };

        // -------------------------
        // STATUS FILTER
        // -------------------------

        if (status !== undefined) {
            if (!APPLICATION_STATUSES.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid application status"
                });
            }

            filter.status = status;
        }

        // -------------------------
        // SEARCH FILTER
        // -------------------------

        if (search !== undefined) {
            const searchTerm = search.trim();

            if (searchTerm) {
                filter.$or = [
                    {
                        company: {
                            $regex: searchTerm,
                            $options: "i"
                        }
                    },
                    {
                        role: {
                            $regex: searchTerm,
                            $options: "i"
                        }
                    }
                ];
            }
        }

        // -------------------------
        // PAGE VALIDATION
        // -------------------------

        let page = DEFAULT_PAGE;

        if (pageQuery !== undefined) {
            const parsedPage = Number(pageQuery);

            if (
                !Number.isInteger(parsedPage) ||
                parsedPage <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Page must be a positive integer"
                });
            }

            page = parsedPage;
        }

        // -------------------------
        // LIMIT VALIDATION
        // -------------------------

        let limit = DEFAULT_LIMIT;

        if (limitQuery !== undefined) {
            const parsedLimit = Number(limitQuery);

            if (
                !Number.isInteger(parsedLimit) ||
                parsedLimit <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Limit must be a positive integer"
                });
            }

            if (parsedLimit > MAX_LIMIT) {
                return res.status(400).json({
                    success: false,
                    message: `Limit cannot be greater than ${MAX_LIMIT}`
                });
            }

            limit = parsedLimit;
        }

        // -------------------------
        // PAGINATION CALCULATION
        // -------------------------

        const skip = (page - 1) * limit;

        // -------------------------
        // DATABASE QUERIES
        // -------------------------

        const [applications, total] = await Promise.all([
            Application.find(filter)
                .sort({
                    appliedDate: -1
                })
                .skip(skip)
                .limit(limit),

            Application.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            success: true,
            count: applications.length,
            data: {
                applications
            },
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        console.error("Get applications error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching applications"
        });
    }
};

const getApplicationStats = async (req, res) => { // Get application statistics (total count and count by status)
    try {
        const stats = await Application.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $group: {
                    _id: "$status",
                    count: {
                        $sum: 1
                    }
                }
            }
        ]);

        const byStatus = {};

        for (const status of APPLICATION_STATUSES) {
            byStatus[status] = 0;
        }

        for (const item of stats) {
            if (item._id) {
                byStatus[item._id] = item.count;
            }
        }

        const total = stats.reduce(
            (sum, item) => sum + item.count,
            0
        );

        return res.status(200).json({
            success: true,
            data: {
                total,
                byStatus
            }
        });
    } catch (error) {
        console.error("Get application stats error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching application statistics"
        });
    }
};

const getApplicationById = async (req, res) => { // Get a single application by ID of the authenticated user
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID"
            });
        }

        const application = await Application.findOne({
            _id: id,
            user: req.user.id
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                application
            }
        });
    } catch (error) {
        console.error("Get application error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching application"
        });
    }
};

const updateApplication = async (req, res) => { // Update an existing application by ID of the authenticated user
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID"
            });
        }

        const allowedFields = [
            "company",
            "role",
            "status",
            "appliedDate",
            "jobLink",
            "salaryRange",
            "notes"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body?.[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided for update"
            });
        }

        if (
            updates.status &&
            !APPLICATION_STATUSES.includes(updates.status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid application status"
            });
        }

        if (updates.appliedDate !== undefined) {
            const parsedDate = new Date(updates.appliedDate);

            if (Number.isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid applied date"
                });
            }

            updates.appliedDate = parsedDate;
        }

        if (updates.company !== undefined) {
            updates.company = updates.company.trim();

            if (!updates.company) {
                return res.status(400).json({
                    success: false,
                    message: "Company name cannot be empty"
                });
            }
        }

        if (updates.role !== undefined) {
            updates.role = updates.role.trim();

            if (!updates.role) {
                return res.status(400).json({
                    success: false,
                    message: "Job role cannot be empty"
                });
            }
        }

        if (updates.jobLink !== undefined) {
            updates.jobLink = updates.jobLink?.trim() || "";
        }

        if (updates.salaryRange !== undefined) {
            updates.salaryRange =
                updates.salaryRange?.trim() || "";
        }

        if (updates.notes !== undefined) {
            updates.notes = updates.notes?.trim() || "";
        }

        const application = await Application.findOneAndUpdate(
            {
                _id: id,
                user: req.user.id
            },
            updates,
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Application updated successfully",
            data: {
                application
            }
        });
    } catch (error) {
        console.error("Update application error:", error);

        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(
                (validationError) => validationError.message
            );

            return res.status(400).json({
                success: false,
                message: messages[0] || "Validation failed"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error while updating application"
        });
    }
};

const deleteApplication = async (req, res) => { // Delete an existing application by ID of the authenticated user
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID"
            });
        }

        const application = await Application.findOneAndDelete({
            _id: id,
            user: req.user.id
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Application deleted successfully"
        });
    } catch (error) {
        console.error("Delete application error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while deleting application"
        });
    }
};

module.exports = {
    createApplication,
    getApplications,
    getApplicationStats,
    getApplicationById,
    updateApplication,
    deleteApplication
};
//ye module.exports ke through ye functions ko export kar raha hai taki ye functions dusre files mein import karke use kiye ja sake.

/*
Controller mein validation kyun hai jab Model mein bhi validation ho sakti hai?

Humare paas generally multiple layers of validation honge.

Frontend validation
       ↓
Controller validation
       ↓
Mongoose Model validation
       ↓
MongoDB

Frontend validation user experience ke liye.

Controller validation API ko protect/clean rakhne ke liye.

Model validation database-level application rules enforce karne ke liye.

Example:

-status

controller check karta hai:

APPLICATION_STATUSES.includes(status)

Aur model mein bhi enum ho sakta hai.

Defense in depth.
*/