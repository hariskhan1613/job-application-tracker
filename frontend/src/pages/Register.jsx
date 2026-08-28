import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

import "./Register.css";


function Register() {

    /*
    |--------------------------------------------------------------------------
    | Navigation
    |--------------------------------------------------------------------------
    |
    | useNavigate allows us to move the user to another route
    | programmatically after successful registration.
    |
    */

    const navigate = useNavigate();


    /*
    |--------------------------------------------------------------------------
    | Form State
    |--------------------------------------------------------------------------
    |
    | This object contains all values entered by the user.
    |
    */

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });


    /*
    |--------------------------------------------------------------------------
    | Validation Errors
    |--------------------------------------------------------------------------
    |
    | Stores frontend validation errors.
    |
    | Example:
    |
    | {
    |     password: "Password is required"
    | }
    |
    */

    const [errors, setErrors] = useState({});


    /*
    |--------------------------------------------------------------------------
    | API Error
    |--------------------------------------------------------------------------
    |
    | Stores errors returned by the backend.
    |
    | Example:
    |
    | "User already exists"
    |
    */

    const [apiError, setApiError] = useState("");


    /*
    |--------------------------------------------------------------------------
    | Loading State
    |--------------------------------------------------------------------------
    |
    | Prevents multiple registration requests while the first request
    | is still being processed.
    |
    */

    const [isSubmitting, setIsSubmitting] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | Handle Input Changes
    |--------------------------------------------------------------------------
    */

    const handleChange = (event) => {

        const { name, value } = event.target;


        /*
        | Update only the field that changed.
        */

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));


        /*
        | Remove the validation error for this field as soon as
        | the user starts correcting it.
        */

        setErrors((previousErrors) => ({
            ...previousErrors,
            [name]: ""
        }));


        /*
        | Remove any previous backend error because the user
        | has changed the form again.
        */

        setApiError("");
    };


    /*
    |--------------------------------------------------------------------------
    | Frontend Validation
    |--------------------------------------------------------------------------
    */

    const validateForm = () => {

        const newErrors = {};

        const trimmedName = formData.name.trim();

        const trimmedEmail = formData.email.trim();


        /*
        | Name validation
        */

        if (!trimmedName) {

            newErrors.name = "Full name is required";

        }


        /*
        | Email validation
        */

        if (!trimmedEmail) {

            newErrors.email = "Email is required";

        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
        ) {

            newErrors.email = "Please enter a valid email";

        }


        /*
        | Password validation
        */

        if (!formData.password) {

            newErrors.password = "Password is required";

        }


        return newErrors;
    };


    /*
    |--------------------------------------------------------------------------
    | Submit Registration Form
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (event) => {

        /*
        | Prevent browser's default form submission.
        |
        | Without this, the page would refresh.
        */

        event.preventDefault();


        /*
        | Clear any previous backend error.
        */

        setApiError("");


        /*
        | Run frontend validation before calling the backend.
        */

        const validationErrors = validateForm();


        /*
        | If validation failed, stop here.
        |
        | Backend should NOT be called when the form is invalid.
        */

        if (Object.keys(validationErrors).length > 0) {

            setErrors(validationErrors);

            return;
        }


        /*
        | Show loading state.
        */

        setIsSubmitting(true);


        try {

            /*
            |--------------------------------------------------------------------------
            | Send Registration Request
            |--------------------------------------------------------------------------
            |
            | api comes from:
            |
            | ../services/api
            |
            | baseURL is already:
            |
            | http://localhost:5000/api
            |
            | Therefore:
            |
            | api.post("/auth/register")
            |
            | becomes:
            |
            | POST http://localhost:5000/api/auth/register
            |
            */

            const response = await api.post(
                "/auth/register",
                {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password
                }
            );


            /*
            |--------------------------------------------------------------------------
            | Check Backend Response
            |--------------------------------------------------------------------------
            */

            console.log(
                "Registration successful:",
                response.data
            );


            /*
            |--------------------------------------------------------------------------
            | Navigate After Successful Registration
            |--------------------------------------------------------------------------
            |
            | For now we navigate to the login page.
            |
            | Later, after JWT authentication state is implemented,
            | we can directly take the user to the dashboard.
            |
            */

            navigate("/login");

        } catch (error) {

            /*
            |--------------------------------------------------------------------------
            | Backend / Network Error Handling
            |--------------------------------------------------------------------------
            */

            console.error(
                "Registration failed:",
                error
            );


            /*
            | If the backend responded with a message, use it.
            |
            | Otherwise show a generic error.
            */

            const message =
                error.response?.data?.message ||
                "Unable to create account. Please try again.";


            setApiError(message);

        } finally {

            /*
            | Always stop loading state whether the request
            | succeeded or failed.
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
                        Create your account
                    </h1>


                    <p className="auth-subtitle">
                        Start organizing your job search today.
                    </p>

                </div>


                {/* =====================================================
                    BACKEND ERROR
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
                    REGISTER FORM
                ====================================================== */}

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                    noValidate
                >


                    {/* =================================================
                        FULL NAME
                    ================================================== */}

                    <div className="form-group">

                        <label htmlFor="name">
                            Full Name
                        </label>


                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter your full name"
                            autoComplete="name"
                            value={formData.name}
                            onChange={handleChange}
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={
                                errors.name
                                    ? "name-error"
                                    : undefined
                            }
                        />


                        {errors.name && (
                            <p
                                id="name-error"
                                className="form-error"
                            >
                                {errors.name}
                            </p>
                        )}

                    </div>


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
                            placeholder="Create a password"
                            autoComplete="new-password"
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
                            ? "Creating account..."
                            : "Create Account"}

                    </button>

                </form>


                {/* =====================================================
                    LOGIN LINK
                ====================================================== */}

                <div className="auth-footer">

                    <span>
                        Already have an account?
                    </span>


                    <Link to="/login">
                        Login
                    </Link>

                </div>

            </section>

        </main>
    );
}


export default Register;