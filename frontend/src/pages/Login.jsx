import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

import { useAuth } from "../hooks/useAuth";

import "./Login.css";


function Login() {

    /*
    |--------------------------------------------------------------------------
    | Navigation
    |--------------------------------------------------------------------------
    */

    const navigate = useNavigate();


    /*
    |--------------------------------------------------------------------------
    | Authentication Context
    |--------------------------------------------------------------------------
    |
    | login() synchronizes the successful backend login with React's
    | global authentication state.
    |
    |--------------------------------------------------------------------------
    */

    const { login } = useAuth();


    /*
    |--------------------------------------------------------------------------
    | Form State
    |--------------------------------------------------------------------------
    */

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });


    /*
    |--------------------------------------------------------------------------
    | Validation Errors
    |--------------------------------------------------------------------------
    */

    const [errors, setErrors] = useState({});


    /*
    |--------------------------------------------------------------------------
    | API Error
    |--------------------------------------------------------------------------
    */

    const [apiError, setApiError] = useState("");


    /*
    |--------------------------------------------------------------------------
    | Loading State
    |--------------------------------------------------------------------------
    */

    const [isSubmitting, setIsSubmitting] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | Handle Input Changes
    |--------------------------------------------------------------------------
    */

    const handleChange = (event) => {

        const { name, value } = event.target;


        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));


        setErrors((previousErrors) => ({
            ...previousErrors,
            [name]: ""
        }));


        setApiError("");
    };


    /*
    |--------------------------------------------------------------------------
    | Validate Form
    |--------------------------------------------------------------------------
    */

    const validateForm = () => {

        const newErrors = {};

        const trimmedEmail = formData.email.trim();


        if (!trimmedEmail) {

            newErrors.email = "Email is required";

        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
        ) {

            newErrors.email = "Please enter a valid email";

        }


        if (!formData.password) {

            newErrors.password = "Password is required";

        }


        return newErrors;
    };


    /*
    |--------------------------------------------------------------------------
    | Submit Login Form
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (event) => {

        /*
        | Prevent normal browser form submission.
        */

        event.preventDefault();


        /*
        | Clear previous backend error.
        */

        setApiError("");


        /*
        | Validate form.
        */

        const validationErrors = validateForm();


        /*
        | Stop if validation fails.
        */

        if (Object.keys(validationErrors).length > 0) {

            setErrors(validationErrors);

            return;
        }


        /*
        | Start loading state.
        */

        setIsSubmitting(true);


        try {

            /*
            |--------------------------------------------------------------------------
            | Login API Request
            |--------------------------------------------------------------------------
            */

            const response = await api.post(
                "/auth/login",
                {
                    email: formData.email.trim(),
                    password: formData.password
                }
            );


            /*
            |--------------------------------------------------------------------------
            | Extract Backend Authentication Data
            |--------------------------------------------------------------------------
            */

            const {
                user,
                token
            } = response.data.data;


            /*
            |--------------------------------------------------------------------------
            | Update Global Authentication State
            |--------------------------------------------------------------------------
            |
            | AuthContext will:
            |
            | 1. Save token
            | 2. Save user
            | 3. Update React authentication state
            |
            |--------------------------------------------------------------------------
            */

            login(
                token,
                user
            );


            /*
            |--------------------------------------------------------------------------
            | Debug Log
            |--------------------------------------------------------------------------
            */

            console.log(
                "Login successful:",
                response.data
            );


            /*
            |--------------------------------------------------------------------------
            | Navigate To Dashboard
            |--------------------------------------------------------------------------
            */

            navigate("/dashboard");

        } catch (error) {

            /*
            |--------------------------------------------------------------------------
            | Backend / Network Error
            |--------------------------------------------------------------------------
            */

            console.error(
                "Login failed:",
                error
            );


            const message =
                error.response?.data?.message ||
                "Unable to login. Please try again.";


            setApiError(message);

        } finally {

            /*
            | Always stop loading state.
            */

            setIsSubmitting(false);
        }
    };


    return (
        <main className="auth-page">

            <section className="auth-card">


                {/* =====================================================
                    HEADER
                ====================================================== */}

                <div className="auth-header">

                    <Link
                        to="/"
                        className="auth-logo"
                    >
                        Track. Focus. Grow.
                    </Link>


                    <h1 className="auth-title">
                        Welcome back
                    </h1>


                    <p className="auth-subtitle">
                        Login to continue tracking your applications.
                    </p>

                </div>


                {/* =====================================================
                    API ERROR
                ====================================================== */}

                {apiError && (
                    <div
                        className="api-error"
                        role="alert"
                    >
                        {apiError}
                    </div>
                )}


                {/* =====================================================
                    LOGIN FORM
                ====================================================== */}

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                    noValidate
                >


                    {/* =================================================
                        EMAIL
                    ================================================== */}

                    <div className="form-group">

                        <label htmlFor="email">
                            Email
                        </label>


                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={
                                errors.email
                                    ? "email-error"
                                    : undefined
                            }
                        />


                        {errors.email && (
                            <p
                                id="email-error"
                                className="form-error"
                            >
                                {errors.email}
                            </p>
                        )}

                    </div>


                    {/* =================================================
                        PASSWORD
                    ================================================== */}

                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>


                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={
                                errors.password
                                    ? "password-error"
                                    : undefined
                            }
                        />


                        {errors.password && (
                            <p
                                id="password-error"
                                className="form-error"
                            >
                                {errors.password}
                            </p>
                        )}

                    </div>


                    {/* =================================================
                        SUBMIT BUTTON
                    ================================================== */}

                    <button
                        type="submit"
                        className="btn btn-primary auth-submit"
                        disabled={isSubmitting}
                    >

                        {isSubmitting
                            ? "Logging in..."
                            : "Login"}

                    </button>

                </form>


                {/* =====================================================
                    REGISTER LINK
                ====================================================== */}

                <div className="auth-footer">

                    <span>
                        Don't have an account?
                    </span>


                    <Link to="/register">
                        Create an account
                    </Link>

                </div>

            </section>

        </main>
    );
}


export default Login;