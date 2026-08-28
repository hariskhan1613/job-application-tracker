import axios from "axios";

import authService from "./authService";


/*
|--------------------------------------------------------------------------
| API Base URL
|--------------------------------------------------------------------------
|
| VITE_API_BASE_URL comes from frontend/.env
|
| Example:
|
| VITE_API_BASE_URL=http://localhost:5000/api
|
|--------------------------------------------------------------------------
*/

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api";


/*
|--------------------------------------------------------------------------
| Axios Instance
|--------------------------------------------------------------------------
*/

const api = axios.create({

    baseURL: API_BASE_URL,

    headers: {
        "Content-Type": "application/json"
    },

    timeout: 10000

});


/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
|
| This runs before every API request.
|
| We retrieve the JWT token from authService and attach it to
| the Authorization header.
|
| Backend will receive:
|
| Authorization: Bearer <JWT_TOKEN>
|
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(

    (config) => {

        const token = authService.getToken();


        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }


        return config;

    },

    (error) => {

        return Promise.reject(error);

    }

);


/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
|
| Successful responses are returned normally.
|
| 401 handling will be added later when protected routing and
| centralized authentication state are implemented.
|
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(

    (response) => {

        return response;

    },

    (error) => {

        return Promise.reject(error);

    }

);


export default api;