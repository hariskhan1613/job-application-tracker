import { createContext } from "react";

/*
|--------------------------------------------------------------------------
| Authentication Context
|--------------------------------------------------------------------------
|
| This file contains ONLY the React Context object.
|
| We intentionally keep this separate from AuthProvider because React
| Fast Refresh works best when component files export components only.
|
|--------------------------------------------------------------------------
*/

const AuthContext = createContext(null);

export default AuthContext;