import { useContext } from "react";

import AuthContext from "../context/AuthContext";


/*
|--------------------------------------------------------------------------
| useAuth
|--------------------------------------------------------------------------
|
| Custom hook used by React components to access authentication state.
|
| Example:
|
| const {
|     user,
|     isAuthenticated,
|     login,
|     logout
| } = useAuth();
|
|--------------------------------------------------------------------------
*/

export function useAuth() {

    /*
    |--------------------------------------------------------------------------
    | Read authentication context
    |--------------------------------------------------------------------------
    */

    const context = useContext(AuthContext);


    /*
    |--------------------------------------------------------------------------
    | Safety Check
    |--------------------------------------------------------------------------
    |
    | If useAuth() is used outside AuthProvider, React will return null.
    |
    | Throwing an explicit error makes the problem much easier to
    | understand.
    |
    |--------------------------------------------------------------------------
    */

    if (!context) {

        throw new Error(
            "useAuth must be used inside an AuthProvider"
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Return authentication data and functions
    |--------------------------------------------------------------------------
    */

    return context;
}