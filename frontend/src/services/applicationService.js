/*
|--------------------------------------------------------------------------
| Application Service
|--------------------------------------------------------------------------
|
| This file contains all API-related functions for job applications.
|
| Important:
| - No React JSX belongs in this file.
| - No UI logic belongs in this file.
| - No useState / useEffect belongs in this file.
|
| Dashboard.jsx and other React components will call these functions.
| These functions communicate with the backend API through api.js.
|
|--------------------------------------------------------------------------
*/

import api from "./api";

/*
|--------------------------------------------------------------------------
| Get All Applications
|--------------------------------------------------------------------------
|
| Sends:
| GET /api/applications
|
| The backend uses the JWT token from the Authorization header.
| The token is automatically attached by our api.js interceptor.
|
| Returns:
| The backend response containing the user's applications.
|--------------------------------------------------------------------------
*/

export const getApplications = async () => {
    const response = await api.get("/applications");

    return response.data;
};


/*
|--------------------------------------------------------------------------
| Get Application Statistics
|--------------------------------------------------------------------------
|
| Sends:
| GET /api/applications/stats
|
| Returns aggregated counts by status plus the total application count.
| This powers the analytics dashboard and response-rate breakdown.
|--------------------------------------------------------------------------
*/

export const getApplicationStats = async () => {
    const response = await api.get("/applications/stats");

    return response.data;
};


/*
|--------------------------------------------------------------------------
| Get Single Application
|--------------------------------------------------------------------------
|
| Sends:
| GET /api/applications/:id
|
| Example:
| getApplicationById("64abc123...")
|
| Returns:
| The backend response containing one application.
|--------------------------------------------------------------------------
*/

export const getApplicationById = async (id) => {
    const response = await api.get(`/applications/${id}`);

    return response.data;
};


/*
|--------------------------------------------------------------------------
| Create Application
|--------------------------------------------------------------------------
|
| Sends:
| POST /api/applications
|
| The application data comes from the form in the frontend.
|
| Example:
|
| {
|     company: "Google",
|     position: "Frontend Developer",
|     status: "Applied"
| }
|
|--------------------------------------------------------------------------
*/

export const createApplication = async (applicationData) => {
    const response = await api.post(
        "/applications",
        applicationData
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| Update Application
|--------------------------------------------------------------------------
|
| Sends:
| PUT /api/applications/:id
|
| The id identifies which application should be updated.
|
| applicationData contains the fields that should be changed.
|--------------------------------------------------------------------------
*/

export const updateApplication = async (id, applicationData) => {
    const response = await api.put(
        `/applications/${id}`,
        applicationData
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| Delete Application
|--------------------------------------------------------------------------
|
| Sends:
| DELETE /api/applications/:id
|
| The backend will delete the application belonging to
| the authenticated user.
|--------------------------------------------------------------------------
*/

export const deleteApplication = async (id) => {
    const response = await api.delete(
        `/applications/${id}`
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
|
| Keeping a default object export makes this service flexible.
|
| We can use either:
|
| import {
|     getApplications
| } from "./applicationService";
|
| OR:
|
| import applicationService from "./applicationService";
|
| Both styles can work.
|--------------------------------------------------------------------------
*/

const applicationService = {
    getApplications,
    getApplicationStats,
    getApplicationById,
    createApplication,
    updateApplication,
    deleteApplication
};

export default applicationService;