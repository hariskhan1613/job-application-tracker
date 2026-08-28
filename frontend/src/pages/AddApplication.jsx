/*
|--------------------------------------------------------------------------
| Add / Edit Application Page
|--------------------------------------------------------------------------
|
| This page handles both:
|
| - Creating a new application
| - Editing an existing application
|
| Routes:
|
| /dashboard/add
| /dashboard/edit/:id
|
|--------------------------------------------------------------------------
*/

import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    createApplication,
    getApplicationById,
    updateApplication
} from "../services/applicationService";

import "./AddApplication.css";


/*
|--------------------------------------------------------------------------
| Initial Form State
|--------------------------------------------------------------------------
*/

const initialFormData = {
    company: "",
    position: "",
    appliedDate: "",
    jobUrl: "",
    status: "Applied",
    salaryRange: "",
    notes: ""
};


/*
|--------------------------------------------------------------------------
| Allowed Statuses
|--------------------------------------------------------------------------
*/

const applicationStatuses = [
    "Applied",
    "OA/Assessment",
    "Interview Scheduled",
    "Interview Done",
    "Offer",
    "Rejected",
    "Withdrawn"
];


/*
|--------------------------------------------------------------------------
| Add Application
|--------------------------------------------------------------------------
*/

function AddApplication() {

    /*
    |--------------------------------------------------------------------------
    | Navigation
    |--------------------------------------------------------------------------
    */

    const navigate = useNavigate();


    /*
    |--------------------------------------------------------------------------
    | URL Parameters
    |--------------------------------------------------------------------------
    |
    | If id exists:
    |
    | /dashboard/edit/:id
    |
    | then this page works in Edit mode.
    |
    */

    const { id } = useParams();


    /*
    |--------------------------------------------------------------------------
    | Edit Mode
    |--------------------------------------------------------------------------
    */

    const isEditMode = Boolean(id);


    /*
    |--------------------------------------------------------------------------
    | Form State
    |--------------------------------------------------------------------------
    */

    const [
        formData,
        setFormData
    ] = useState(initialFormData);


    /*
    |--------------------------------------------------------------------------
    | Validation Errors
    |--------------------------------------------------------------------------
    */

    const [
        errors,
        setErrors
    ] = useState({});


    /*
    |--------------------------------------------------------------------------
    | Submit Error
    |--------------------------------------------------------------------------
    */

    const [
        submitError,
        setSubmitError
    ] = useState("");


    /*
    |--------------------------------------------------------------------------
    | Loading Existing Application
    |--------------------------------------------------------------------------
    */

    const [
    loadedApplicationId,
    setLoadedApplicationId
] = useState(null);

const isLoadingApplication =
    Boolean(id) &&
    loadedApplicationId !== id;

    /*
    |--------------------------------------------------------------------------
    | Submit Loading
    |--------------------------------------------------------------------------
    */

    const [
        isSubmitting,
        setIsSubmitting
    ] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | Load Existing Application
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

    if (!id) {
        return;
    }

    let cancelled = false;

    const loadApplication = async () => {

        setSubmitError("");

        try {

            const result =
                await getApplicationById(id);

            if (cancelled) {
                return;
            }

            let application = null;

            if (
                result &&
                typeof result === "object"
            ) {

                if (
                    result.company ||
                    result.role ||
                    result.position
                ) {

                    application = result;

                } else if (
                    result.data &&
                    typeof result.data === "object"
                ) {

                    if (
                        result.data.company ||
                        result.data.role ||
                        result.data.position
                    ) {

                        application = result.data;

                    } else if (
                        result.data.application
                    ) {

                        application =
                            result.data.application;
                    }

                } else if (
                    result.application
                ) {

                    application =
                        result.application;
                }
            }

            if (!application) {

                throw new Error(
                    "Application data could not be found."
                );
            }

            setFormData({

                company:
                    application.company || "",

                position:
                    application.role ||
                    application.position ||
                    "",

                appliedDate:
                    application.appliedDate
                        ? String(
                            application.appliedDate
                        ).slice(0, 10)
                        : "",

                jobUrl:
                    application.jobLink ||
                    application.jobUrl ||
                    "",

                status:
                    application.status ||
                    "Applied",

                salaryRange:
                    application.salaryRange ||
                    "",

                notes:
                    application.notes ||
                    ""
            });

            setErrors({});

            /*
            |--------------------------------------------------------------------------
            | Mark Application As Loaded
            |--------------------------------------------------------------------------
            */

            setLoadedApplicationId(id);

        } catch (error) {

            if (cancelled) {
                return;
            }

            const backendMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Unable to load the application. Please try again.";

            setSubmitError(
                backendMessage
            );

            /*
            |--------------------------------------------------------------------------
            | Stop Loading Even When Request Fails
            |--------------------------------------------------------------------------
            */

            setLoadedApplicationId(id);
        }
    };

    loadApplication();

    return () => {
        cancelled = true;
    };

}, [id]);


    /*
    |--------------------------------------------------------------------------
    | Handle Input Change
    |--------------------------------------------------------------------------
    */

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setFormData((previousData) => ({

            ...previousData,

            [name]: value

        }));


        /*
        |--------------------------------------------------------------------------
        | Clear Field Error
        |--------------------------------------------------------------------------
        */

        if (errors[name]) {

            setErrors((previousErrors) => {

                const updatedErrors = {
                    ...previousErrors
                };


                delete updatedErrors[name];


                return updatedErrors;
            });
        }


        /*
        |--------------------------------------------------------------------------
        | Clear Submit Error
        |--------------------------------------------------------------------------
        */

        if (submitError) {

            setSubmitError("");

        }
    };


    /*
    |--------------------------------------------------------------------------
    | Validate URL
    |--------------------------------------------------------------------------
    */

    const isValidUrl = (value) => {

        if (!value.trim()) {
            return true;
        }


        try {

            const url = new URL(value);


            return (
                url.protocol === "http:" ||
                url.protocol === "https:"
            );

        } catch {

            return false;
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Validate Form
    |--------------------------------------------------------------------------
    */

    const validateForm = () => {

        const validationErrors = {};


        /*
        |--------------------------------------------------------------------------
        | Company
        |--------------------------------------------------------------------------
        */

        if (!formData.company.trim()) {

            validationErrors.company =
                "Company name is required.";

        } else if (
            formData.company.trim().length < 2
        ) {

            validationErrors.company =
                "Company name must be at least 2 characters.";
        }


        /*
        |--------------------------------------------------------------------------
        | Position
        |--------------------------------------------------------------------------
        */

        if (!formData.position.trim()) {

            validationErrors.position =
                "Job position is required.";

        } else if (
            formData.position.trim().length < 2
        ) {

            validationErrors.position =
                "Job position must be at least 2 characters.";
        }


        /*
        |--------------------------------------------------------------------------
        | Applied Date
        |--------------------------------------------------------------------------
        */

        if (!formData.appliedDate) {

            validationErrors.appliedDate =
                "Applied date is required.";
        }


        /*
        |--------------------------------------------------------------------------
        | Job URL
        |--------------------------------------------------------------------------
        */

        if (!isValidUrl(formData.jobUrl)) {

            validationErrors.jobUrl =
                "Please enter a valid HTTP or HTTPS URL.";
        }


        /*
        |--------------------------------------------------------------------------
        | Status
        |--------------------------------------------------------------------------
        */

        if (!formData.status) {

            validationErrors.status =
                "Application status is required.";
        }


        return validationErrors;
    };


    /*
    |--------------------------------------------------------------------------
    | Handle Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (event) => {

        event.preventDefault();


        /*
        |--------------------------------------------------------------------------
        | Prevent Double Submission
        |--------------------------------------------------------------------------
        */

        if (isSubmitting) {
            return;
        }


        /*
        |--------------------------------------------------------------------------
        | Clear Previous Errors
        |--------------------------------------------------------------------------
        */

        setSubmitError("");


        /*
        |--------------------------------------------------------------------------
        | Validate
        |--------------------------------------------------------------------------
        */

        const validationErrors =
            validateForm();


        setErrors(validationErrors);


        if (
            Object.keys(validationErrors).length > 0
        ) {

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | Start Submit
        |--------------------------------------------------------------------------
        */

        setIsSubmitting(true);


        try {

            /*
            |--------------------------------------------------------------------------
            | Prepare API Data
            |--------------------------------------------------------------------------
            |
            | IMPORTANT:
            |
            | Backend expects:
            |
            | role
            | jobLink
            |
            |--------------------------------------------------------------------------
            */

            const applicationData = {

                company:
                    formData.company.trim(),

                role:
                    formData.position.trim(),

                appliedDate:
                    formData.appliedDate,

                jobLink:
                    formData.jobUrl.trim(),

                status:
                    formData.status,

                salaryRange:
                    formData.salaryRange.trim(),

                notes:
                    formData.notes.trim()
            };


            /*
            |--------------------------------------------------------------------------
            | EDIT MODE
            |--------------------------------------------------------------------------
            */

            if (isEditMode) {

                /*
                |--------------------------------------------------------------------------
                | PUT /api/applications/:id
                |--------------------------------------------------------------------------
                */

                await updateApplication(
                    id,
                    applicationData
                );

            } else {

                /*
                |--------------------------------------------------------------------------
                | ADD MODE
                |--------------------------------------------------------------------------
                |
                | POST /api/applications
                |--------------------------------------------------------------------------
                */

                await createApplication(
                    applicationData
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Success
            |--------------------------------------------------------------------------
            */

            navigate(
                "/dashboard/applications",
                {
                    replace: true
                }
            );

        } catch (error) {

            const backendMessage =
                error?.response?.data?.message ||
                error?.message;


            setSubmitError(
                backendMessage ||
                (
                    isEditMode
                        ? "Unable to update the application. Please try again."
                        : "Unable to create the application. Please try again."
                )
            );

        } finally {

            setIsSubmitting(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Cancel
    |--------------------------------------------------------------------------
    */

    const handleCancel = () => {

        if (isSubmitting) {
            return;
        }


        navigate(
            "/dashboard/applications"
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Loading Existing Application
    |--------------------------------------------------------------------------
    */

    if (isLoadingApplication) {

        return (

            <main className="add-application-page">

                <section
                    className="add-application-container"
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >

                    <div
                        className="add-application-card"
                        style={{
                            width: "100%",
                            textAlign: "center"
                        }}
                    >

                        <span
                            className="submit-spinner"
                            aria-hidden="true"
                            style={{
                                borderColor:
                                    "rgba(84, 91, 224, 0.25)",
                                borderTopColor:
                                    "#6474df",
                                width: "24px",
                                height: "24px",
                                margin: "0 auto 18px"
                            }}
                        />

                        <h2>
                            Loading application...
                        </h2>

                        <p>
                            Fetching your application details.
                        </p>

                    </div>

                </section>

            </main>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (

        <main className="add-application-page">


            {/* =========================================================
                HEADER
            ========================================================= */}

            <header className="add-application-header">

                <div className="add-application-header-content">


                    {/* -------------------------------------------------
                        Brand
                    -------------------------------------------------- */}

                    <button
                        type="button"
                        className="add-application-brand"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >

                        <span className="add-application-brand-icon">
                            JT
                        </span>

                        <span>
                            Job Tracker
                        </span>

                    </button>


                    {/* -------------------------------------------------
                        Back Button
                    -------------------------------------------------- */}

                    <button
                        type="button"
                        className="add-application-back-button"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >

                        ← Back to Applications

                    </button>

                </div>

            </header>


            {/* =========================================================
                MAIN
            ========================================================= */}

            <section className="add-application-container">


                {/* -----------------------------------------------------
                    INTRO
                ------------------------------------------------------ */}

                <div className="add-application-intro">

                    <p className="add-application-eyebrow">

                        {isEditMode
                            ? "Edit application"
                            : "Job application"}

                    </p>


                    <h1>

                        {isEditMode
                            ? "Edit application"
                            : "Add a new application"}

                    </h1>


                    <p>

                        {isEditMode
                            ? "Update your application details and keep your job search information accurate."
                            : "Keep your job search organized by adding your latest application to Job Tracker."}

                    </p>

                </div>


                {/* =====================================================
                    FORM CARD
                ===================================================== */}

                <form
                    className="add-application-card"
                    onSubmit={handleSubmit}
                    noValidate
                >


                    {/* =================================================
                        SERVER ERROR
                    ================================================= */}

                    {submitError && (

                        <div
                            className="form-submit-error"
                            role="alert"
                        >

                            {submitError}

                        </div>

                    )}


                    {/* =================================================
                        FORM GRID
                    ================================================= */}

                    <div className="application-form-grid">


                        {/* =============================================
                            COMPANY
                        ============================================== */}

                        <div className="form-field">

                            <label htmlFor="company">

                                Company Name

                                <span className="required-mark">
                                    *
                                </span>

                            </label>


                            <input
                                id="company"
                                name="company"
                                type="text"
                                value={formData.company}
                                onChange={handleChange}
                                placeholder="e.g. Google"
                                autoComplete="organization"
                                disabled={isSubmitting}
                                className={
                                    errors.company
                                        ? "input-error"
                                        : ""
                                }
                            />


                            {errors.company && (

                                <span className="field-error">

                                    {errors.company}

                                </span>

                            )}

                        </div>


                        {/* =============================================
                            POSITION
                        ============================================== */}

                        <div className="form-field">

                            <label htmlFor="position">

                                Job Position

                                <span className="required-mark">
                                    *
                                </span>

                            </label>


                            <input
                                id="position"
                                name="position"
                                type="text"
                                value={formData.position}
                                onChange={handleChange}
                                placeholder="e.g. Frontend Developer"
                                autoComplete="organization-title"
                                disabled={isSubmitting}
                                className={
                                    errors.position
                                        ? "input-error"
                                        : ""
                                }
                            />


                            {errors.position && (

                                <span className="field-error">

                                    {errors.position}

                                </span>

                            )}

                        </div>


                        {/* =============================================
                            APPLIED DATE
                        ============================================== */}

                        <div className="form-field">

                            <label htmlFor="appliedDate">

                                Applied Date

                                <span className="required-mark">
                                    *
                                </span>

                            </label>


                            <input
                                id="appliedDate"
                                name="appliedDate"
                                type="date"
                                value={formData.appliedDate}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className={
                                    errors.appliedDate
                                        ? "input-error"
                                        : ""
                                }
                            />


                            {errors.appliedDate && (

                                <span className="field-error">

                                    {errors.appliedDate}

                                </span>

                            )}

                        </div>


                        {/* =============================================
                            STATUS
                        ============================================== */}

                        <div className="form-field">

                            <label htmlFor="status">

                                Status

                                <span className="required-mark">
                                    *
                                </span>

                            </label>


                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className={
                                    errors.status
                                        ? "input-error"
                                        : ""
                                }
                            >

                                {applicationStatuses.map(
                                    (status) => (

                                        <option
                                            key={status}
                                            value={status}
                                        >

                                            {status}

                                        </option>

                                    )
                                )}

                            </select>


                            {errors.status && (

                                <span className="field-error">

                                    {errors.status}

                                </span>

                            )}

                        </div>


                        {/* =============================================
                            JOB URL
                        ============================================== */}

                        <div className="form-field form-field-full">

                            <label htmlFor="jobUrl">

                                Job URL

                                <span className="optional-label">
                                    Optional
                                </span>

                            </label>


                            <input
                                id="jobUrl"
                                name="jobUrl"
                                type="url"
                                value={formData.jobUrl}
                                onChange={handleChange}
                                placeholder="https://company.com/jobs/frontend-developer"
                                autoComplete="url"
                                disabled={isSubmitting}
                                className={
                                    errors.jobUrl
                                        ? "input-error"
                                        : ""
                                }
                            />


                            {errors.jobUrl && (

                                <span className="field-error">

                                    {errors.jobUrl}

                                </span>

                            )}

                        </div>


                        {/* =============================================
                            SALARY RANGE
                        ============================================== */}

                        <div className="form-field form-field-full">

                            <label htmlFor="salaryRange">

                                Salary Range

                                <span className="optional-label">
                                    Optional
                                </span>

                            </label>


                            <input
                                id="salaryRange"
                                name="salaryRange"
                                type="text"
                                value={formData.salaryRange}
                                onChange={handleChange}
                                placeholder="e.g. ₹8 LPA - ₹12 LPA"
                                disabled={isSubmitting}
                            />

                        </div>


                        {/* =============================================
                            NOTES
                        ============================================== */}

                        <div className="form-field form-field-full">

                            <label htmlFor="notes">

                                Notes

                                <span className="optional-label">
                                    Optional
                                </span>

                            </label>


                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Add interview details, recruiter information, preparation notes..."
                                rows="5"
                                disabled={isSubmitting}
                            />

                        </div>

                    </div>


                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <div className="application-form-footer">


                        {/* -------------------------------------------------
                            Required Hint
                        -------------------------------------------------- */}

                        <p className="required-hint">

                            <span className="required-mark">
                                *
                            </span>

                            Required fields

                        </p>


                        {/* -------------------------------------------------
                            Actions
                        -------------------------------------------------- */}

                        <div className="application-form-actions">

                            <button
                                type="button"
                                className="form-cancel-button"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                            >

                                Cancel

                            </button>


                            <button
                                type="submit"
                                className="form-submit-button"
                                disabled={isSubmitting}
                            >

                                {isSubmitting ? (

                                    <>

                                        <span
                                            className="submit-spinner"
                                            aria-hidden="true"
                                        />

                                        {isEditMode
                                            ? "Updating..."
                                            : "Saving..."}

                                    </>

                                ) : (

                                    isEditMode
                                        ? "Update Application"
                                        : "Save Application"

                                )}

                            </button>

                        </div>

                    </div>

                </form>

            </section>

        </main>
    );
}


/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default AddApplication;