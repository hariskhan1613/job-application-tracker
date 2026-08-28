const TOKEN_KEY = "job_tracker_token";

const USER_KEY = "job_tracker_user";


/*
|--------------------------------------------------------------------------
| Save Authentication Data
|--------------------------------------------------------------------------
|
| Stores the JWT token and user information in localStorage.
|
| localStorage allows the authentication data to survive:
|
| - Page refresh
| - Browser navigation
| - React component re-render
|
|--------------------------------------------------------------------------
*/

const saveAuthData = (token, user) => {

    if (!token) {
        throw new Error("Authentication token is required");
    }


    localStorage.setItem(
        TOKEN_KEY,
        token
    );


    if (user) {

        localStorage.setItem(
            USER_KEY,
            JSON.stringify(user)
        );

    }
};


/*
|--------------------------------------------------------------------------
| Get Token
|--------------------------------------------------------------------------
|
| Returns the currently stored JWT token.
|
| If the user is not logged in, null is returned.
|
|--------------------------------------------------------------------------
*/

const getToken = () => {

    return localStorage.getItem(TOKEN_KEY);
};


/*
|--------------------------------------------------------------------------
| Get Stored User
|--------------------------------------------------------------------------
|
| Retrieves the user object from localStorage.
|
| localStorage stores everything as strings, therefore JSON.parse()
| is required to convert the stored string back into an object.
|
|--------------------------------------------------------------------------
*/

const getUser = () => {

    const user = localStorage.getItem(USER_KEY);


    if (!user) {
        return null;
    }


    try {

        return JSON.parse(user);

    } catch (error) {

        console.error(
            "Failed to parse stored user:",
            error
        );

        return null;
    }
};


/*
|--------------------------------------------------------------------------
| Remove Authentication Data
|--------------------------------------------------------------------------
|
| Removes both JWT token and user information.
|
| This function will be used during logout.
|
|--------------------------------------------------------------------------
*/

const clearAuthData = () => {

    localStorage.removeItem(TOKEN_KEY);

    localStorage.removeItem(USER_KEY);
};


/*
|--------------------------------------------------------------------------
| Check Authentication
|--------------------------------------------------------------------------
|
| A user is considered logged in when a JWT token exists.
|
| Actual JWT validity will be verified by the backend when a protected
| API request is made.
|
|--------------------------------------------------------------------------
*/

const isAuthenticated = () => {

    return Boolean(getToken());
};


/*
|--------------------------------------------------------------------------
| Export Authentication Service
|--------------------------------------------------------------------------
*/

const authService = {
    saveAuthData,
    getToken,
    getUser,
    clearAuthData,
    isAuthenticated
};


export default authService;