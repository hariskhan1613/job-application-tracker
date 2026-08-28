import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";

import { AuthProvider } from "./context/AuthProvider.jsx";

import "./index.css";


/*
|--------------------------------------------------------------------------
| React Application Entry Point
|--------------------------------------------------------------------------
|
| BrowserRouter
|     ↓
| Enables routing throughout the application.
|
| AuthProvider
|     ↓
| Makes authentication state available globally.
|
| App
|     ↓
| Contains all application routes.
|
|--------------------------------------------------------------------------
*/

createRoot(document.getElementById("root")).render(

    <StrictMode>

        <BrowserRouter>

            <AuthProvider>

                <App />

            </AuthProvider>

        </BrowserRouter>

    </StrictMode>
);