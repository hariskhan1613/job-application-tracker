import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddApplication from "./pages/AddApplication";
import Applications from "./pages/Applications";
import Analytics from "./pages/Analytics";
import { useAuth } from "./hooks/useAuth";


/*
|--------------------------------------------------------------------------
| Protected Route
|--------------------------------------------------------------------------
|
| Dashboard jaise private pages ko protect karta hai.
|
| User logged in hai:
|     → requested page show hoga
|
| User logged in nahi hai:
|     → /login par redirect hoga
|
|--------------------------------------------------------------------------
*/

function ProtectedRoute({ children }) {

    const {
        isAuthenticated,
        isLoading
    } = useAuth();


    /*
    |--------------------------------------------------------------------------
    | Authentication Loading
    |--------------------------------------------------------------------------
    */

    if (isLoading) {

        return (
            <div>
                Loading...
            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Not Authenticated
    |--------------------------------------------------------------------------
    */

    if (!isAuthenticated) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Authenticated
    |--------------------------------------------------------------------------
    */

    return children;
}


/*
|--------------------------------------------------------------------------
| Public Route
|--------------------------------------------------------------------------
|
| Login aur Register jaise pages ko handle karta hai.
|
| User logged in nahi hai:
|     → requested page show hoga
|
| User already logged in hai:
|     → /dashboard par redirect hoga
|
|--------------------------------------------------------------------------
*/

function PublicRoute({ children }) {

    const {
        isAuthenticated,
        isLoading
    } = useAuth();


    /*
    |--------------------------------------------------------------------------
    | Authentication Loading
    |--------------------------------------------------------------------------
    */

    if (isLoading) {

        return (
            <div>
                Loading...
            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Already Authenticated
    |--------------------------------------------------------------------------
    */

    if (isAuthenticated) {

        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Not Authenticated
    |--------------------------------------------------------------------------
    */

    return children;
}


/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| BrowserRouter yahan nahi hai.
|
| BrowserRouter main.jsx mein already exist karta hai.
|
|--------------------------------------------------------------------------
*/

function App() {

    return (

        <Routes>

            {/* -----------------------------------------------------------
                Landing Page
            ------------------------------------------------------------ */}

            <Route
                path="/"
                element={<Home />}
            />


            {/* -----------------------------------------------------------
                Login
                Public Route
            ------------------------------------------------------------ */}

            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />


            {/* -----------------------------------------------------------
                Register
                Public Route
            ------------------------------------------------------------ */}

            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                }
            />


            {/* -----------------------------------------------------------
                Protected Dashboard
            ------------------------------------------------------------ */}

            <Route
    path="/dashboard/add"
    element={
        <ProtectedRoute>
            <AddApplication />
        </ProtectedRoute>
    }
/>
<Route
    path="/dashboard/edit/:id"
    element={
        <ProtectedRoute>
            <AddApplication />
        </ProtectedRoute>
    }
/>


            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/dashboard/applications"
                element={
                    <ProtectedRoute>
                        <Applications />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/analytics"
                element={
                    <ProtectedRoute>
                        <Analytics />
                    </ProtectedRoute>
                }
            />

            {/* -----------------------------------------------------------
                Unknown Route
            ------------------------------------------------------------ */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />

        </Routes>
    );
}


export default App;