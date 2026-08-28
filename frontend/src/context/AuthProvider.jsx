import {
    useMemo,
    useState
} from "react";

import AuthContext from "./AuthContext";

import authService from "../services/authService";


/*
|--------------------------------------------------------------------------
| AuthProvider
|--------------------------------------------------------------------------
|
| AuthProvider manages the application's global authentication state.
|
| It provides:
|
| - user
| - isAuthenticated
| - isLoading
| - login()
| - logout()
|
| to every component inside the provider.
|
|--------------------------------------------------------------------------
*/

export function AuthProvider({ children }) {

    /*
    |--------------------------------------------------------------------------
    | User State
    |--------------------------------------------------------------------------
    |
    | Read the stored user from localStorage during initial state creation.
    |
    | The function form of useState ensures this only happens during
    | initialization instead of every render.
    |
    |--------------------------------------------------------------------------
    */

    const [user, setUser] = useState(
        () => authService.getUser()
    );


    /*
    |--------------------------------------------------------------------------
    | Loading State
    |--------------------------------------------------------------------------
    |
    | At the moment authentication data is read synchronously from
    | localStorage, so there is no asynchronous loading process.
    |
    | We keep this state because later we can use it when implementing
    | backend token verification.
    |
    |--------------------------------------------------------------------------
    */

    const [isLoading] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | Login
    |--------------------------------------------------------------------------
    |
    | Called after the backend successfully authenticates the user.
    |
    | token:
    |     JWT returned by backend.
    |
    | authenticatedUser:
    |     User object returned by backend.
    |
    |--------------------------------------------------------------------------
    */

    const login = (token, authenticatedUser) => {

        /*
        | Store authentication data in localStorage.
        */

        authService.saveAuthData(
            token,
            authenticatedUser
        );


        /*
        | Update React's global user state.
        */

        setUser(authenticatedUser);
    };


    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    |
    | Removes authentication data from localStorage and clears the
    | global React user state.
    |
    |--------------------------------------------------------------------------
    */

    const logout = () => {

        /*
        | Remove token and user from localStorage.
        */

        authService.clearAuthData();


        /*
        | Remove user from React state.
        */

        setUser(null);
    };


    /*
    |--------------------------------------------------------------------------
    | Authentication Status
    |--------------------------------------------------------------------------
    |
    | The frontend considers the user authenticated when:
    |
    | 1. A user object exists.
    | 2. An authentication token exists.
    |
    | The backend will ultimately decide whether the JWT is actually
    | valid when protected API requests are made.
    |
    |--------------------------------------------------------------------------
    */

    const isAuthenticated =
        Boolean(user) &&
        authService.isAuthenticated();


    /*
    |--------------------------------------------------------------------------
    | Context Value
    |--------------------------------------------------------------------------
    |
    | useMemo prevents unnecessary recreation of the context object
    | when authentication-related values have not changed.
    |
    |--------------------------------------------------------------------------
    */

    const contextValue = useMemo(
        () => ({
            user,
            isAuthenticated,
            isLoading,
            login,
            logout
        }),
        [
            user,
            isAuthenticated,
            isLoading
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | Provider
    |--------------------------------------------------------------------------
    |
    | All components inside this provider can access authentication
    | information using the useAuth() hook.
    |
    |--------------------------------------------------------------------------
    */

    return (
        <AuthContext.Provider value={contextValue}>

            {children}

        </AuthContext.Provider>
    );
}