/*
|--------------------------------------------------------------------------
| Dashboard Page
|--------------------------------------------------------------------------
|
| Main authenticated workspace of the Job Tracker application.
|
| Responsibilities:
|
| 1. Load the user's applications.
| 2. Calculate application statistics.
| 3. Display dashboard header.
| 4. Display application statistics.
| 5. Display follow-up reminders.
| 6. Display application section.
|
|--------------------------------------------------------------------------
*/

import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../hooks/useAuth";

import {
    getApplications
} from "../services/applicationService";

import "./Dashboard.css";


/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

function Dashboard() {

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    const {
        user,
        logout
    } = useAuth();


    /*
    |--------------------------------------------------------------------------
    | Navigation
    |--------------------------------------------------------------------------
    */

    const navigate = useNavigate();


    /*
    |--------------------------------------------------------------------------
    | Applications State
    |--------------------------------------------------------------------------
    */

    const [
        applications,
        setApplications
    ] = useState([]);


    /*
    |--------------------------------------------------------------------------
    | Loading State
    |--------------------------------------------------------------------------
    */

    const [
        isLoading,
        setIsLoading
    ] = useState(true);


    /*
    |--------------------------------------------------------------------------
    | Error State
    |--------------------------------------------------------------------------
    */

    const [
        error,
        setError
    ] = useState("");


    /*
    |--------------------------------------------------------------------------
    | Current Time
    |--------------------------------------------------------------------------
    |
    | Date.now() must not be called during the render phase.
    | We keep the current timestamp in state and update it from an effect.
    |
    |--------------------------------------------------------------------------
    */

    const [
        currentTime,
        setCurrentTime
    ] = useState(() => Date.now());


    /*
    |--------------------------------------------------------------------------
    | Load Applications
    |--------------------------------------------------------------------------
    |
    | Loads applications belonging to the authenticated user.
    |
    |--------------------------------------------------------------------------
    */

    const loadApplications = async () => {

        setIsLoading(true);

        setError("");

        try {

            const result =
                await getApplications();


            /*
            |--------------------------------------------------------------------------
            | Validate Backend Response
            |--------------------------------------------------------------------------
            */

            if (!result?.success) {

                throw new Error(
                    result?.message ||
                    "Failed to load applications."
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Extract Applications
            |--------------------------------------------------------------------------
            |
            | Supports:
            |
            | data.applications
            |
            | and:
            |
            | data
            |
            |--------------------------------------------------------------------------
            */

            const applicationData =
                Array.isArray(result?.data?.applications)
                    ? result.data.applications
                    : Array.isArray(result?.data)
                        ? result.data
                        : [];


            setApplications(applicationData);

        } catch (requestError) {

            setError(
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Unable to load applications."
            );

        } finally {

            setIsLoading(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Initial Data Loading
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        let cancelled = false;


        const loadInitialApplications = async () => {

            /*
            |--------------------------------------------------------------------------
            | Prevent state updates after component unmount
            |--------------------------------------------------------------------------
            */

            if (cancelled) {
                return;
            }


            await loadApplications();
        };


        loadInitialApplications();


        /*
        |--------------------------------------------------------------------------
        | Cleanup
        |--------------------------------------------------------------------------
        */

        return () => {

            cancelled = true;
        };

    }, []);


    /*
    |--------------------------------------------------------------------------
    | Current Time Effect
    |--------------------------------------------------------------------------
    |
    | The follow-up reminder depends on the current time.
    | Date.now() is called only inside useEffect so the component render
    | remains pure and React does not report an impure-function error.
    |
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        /*
        |--------------------------------------------------------------------------
        | Keep the reminder calculation fresh
        |--------------------------------------------------------------------------
        |
        | Updating once per minute is enough for a 7-day threshold while
        | keeping the dashboard responsive when it stays open.
        |
        |--------------------------------------------------------------------------
        */

        const intervalId = setInterval(() => {

            setCurrentTime(Date.now());

        }, 60 * 1000);


        /*
        |--------------------------------------------------------------------------
        | Cleanup
        |--------------------------------------------------------------------------
        */

        return () => {

            clearInterval(intervalId);
        };

    }, []);


    /*
    |--------------------------------------------------------------------------
    | Application Statistics
    |--------------------------------------------------------------------------
    */

    const totalApplications =
        applications.length;


    /*
    |--------------------------------------------------------------------------
    | Applied Count
    |--------------------------------------------------------------------------
    */

    const appliedCount =
        applications.filter(
            (application) =>
                application.status === "Applied"
        ).length;


    /*
    |--------------------------------------------------------------------------
    | Interview Count
    |--------------------------------------------------------------------------
    |
    | Both interview statuses are counted.
    |
    |--------------------------------------------------------------------------
    */

    const interviewCount =
        applications.filter(
            (application) =>
                application.status === "Interview Scheduled" ||
                application.status === "Interview Done"
        ).length;


    /*
    |--------------------------------------------------------------------------
    | Offer Count
    |--------------------------------------------------------------------------
    */

    const offerCount =
        applications.filter(
            (application) =>
                application.status === "Offer"
        ).length;


    /*
    |--------------------------------------------------------------------------
    | Follow-up Reminder
    |--------------------------------------------------------------------------
    |
    | An application needs follow-up when:
    |
    | 1. Status is "Applied"
    | 2. Application is older than 7 days
    |
    | createdAt comes from MongoDB.
    |
    |--------------------------------------------------------------------------
    */

    const followUpApplications =
        currentTime === null
            ? []
            : applications.filter(
                (application) => {

                    /*
                    |--------------------------------------------------------------------------
                    | Only Applied applications need follow-up
                    |--------------------------------------------------------------------------
                    */

                    if (
                        application?.status?.trim() !== "Applied"
                    ) {
                        return false;
                    }


                    /*
                    |--------------------------------------------------------------------------
                    | Use the real application date when available.
                    | The app records appliedDate in the backend, and createdAt only
                    | reflects when the record was created.
                    |--------------------------------------------------------------------------
                    */

                    const referenceDate =
                        application?.appliedDate ||
                        application?.createdAt;

                    if (!referenceDate) {
                        return false;
                    }


                    /*
                    |--------------------------------------------------------------------------
                    | Convert the timestamp to a valid Date value
                    |--------------------------------------------------------------------------
                    */

                    const referenceTimestamp =
                        new Date(referenceDate).getTime();


                    /*
                    |--------------------------------------------------------------------------
                    | Invalid date protection
                    |--------------------------------------------------------------------------
                    */

                    if (
                        Number.isNaN(referenceTimestamp)
                    ) {
                        return false;
                    }


                    /*
                    |--------------------------------------------------------------------------
                    | Calculate age in days
                    |--------------------------------------------------------------------------
                    */

                    const daysSinceApplied =
                        (
                            currentTime - referenceTimestamp
                        ) /
                        (
                            1000 *
                            60 *
                            60 *
                            24
                        );


                    /*
                    |--------------------------------------------------------------------------
                    | Follow-up after 7 or more days
                    |--------------------------------------------------------------------------
                    |
                    | "7+ days" means an application that is exactly 7 days
                    | old should also trigger the reminder.
                    |
                    |--------------------------------------------------------------------------
                    */

                    return daysSinceApplied >= 7;
                }
            );


    /*
    |--------------------------------------------------------------------------
    | Follow-up Count
    |--------------------------------------------------------------------------
    */

    const followUpCount =
        followUpApplications.length;


    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    return (

        <main className="dashboard-page">


            {/* =========================================================
                HEADER
            ========================================================= */}

            <header className="dashboard-header">

                <div className="dashboard-header-content">


                    {/* -------------------------------------------------
                        Brand
                    -------------------------------------------------- */}

                    <div className="dashboard-brand">

                        <div className="dashboard-brand-icon">
                            JT
                        </div>

                        <span>
                            Job Tracker
                        </span>

                    </div>


                    {/* -------------------------------------------------
                        User Area
                    -------------------------------------------------- */}

                    <div className="dashboard-user-area">

                        <div className="dashboard-user-info">

                            <span className="dashboard-user-name">
                                {user?.name || "User"}
                            </span>

                            <span className="dashboard-user-email">
                                {user?.email || ""}
                            </span>

                        </div>


                        <button
                            type="button"
                            className="dashboard-secondary-button"
                            onClick={() => navigate("/analytics")}
                        >
                            Analytics
                        </button>


                        <button
                            type="button"
                            className="dashboard-logout-button"
                            onClick={logout}
                        >
                            Logout
                        </button>

                    </div>

                </div>

            </header>


            {/* =========================================================
                MAIN CONTENT
            ========================================================= */}

            <div className="dashboard-container">


                {/* =====================================================
                    WELCOME SECTION
                ===================================================== */}

                <section className="dashboard-welcome">

                    <div>

                        <p className="dashboard-eyebrow">
                            Your workspace
                        </p>

                        <h1>
                            Welcome back,{" "}
                            {user?.name || "User"}.
                        </h1>

                        <p className="dashboard-subtitle">
                            Track your applications, stay organized,
                            and keep moving toward your next opportunity.
                        </p>

                    </div>

                </section>


                {/* =====================================================
                    STATISTICS
                ===================================================== */}

                <section className="dashboard-stats-section">

                    <div className="dashboard-section-heading">

                        <div>

                            <p className="dashboard-eyebrow">
                                Overview
                            </p>

                            <h2>
                                Application Statistics
                            </h2>

                        </div>

                    </div>


                    <div className="dashboard-stats-grid">


                        {/* ------------------------------------------------
                            Total Applications
                        ------------------------------------------------- */}

                        <article className="stat-card">

                            <div className="stat-card-top">

                                <span className="stat-label">
                                    Total Applications
                                </span>

                                <span className="stat-icon stat-icon-total">
                                    T
                                </span>

                            </div>

                            <strong className="stat-value">

                                {isLoading
                                    ? "—"
                                    : totalApplications}

                            </strong>

                            <p className="stat-description">
                                All applications you've tracked
                            </p>

                        </article>


                        {/* ------------------------------------------------
                            Applied
                        ------------------------------------------------- */}

                        <article className="stat-card">

                            <div className="stat-card-top">

                                <span className="stat-label">
                                    Applied
                                </span>

                                <span className="stat-icon stat-icon-applied">
                                    A
                                </span>

                            </div>

                            <strong className="stat-value">

                                {isLoading
                                    ? "—"
                                    : appliedCount}

                            </strong>

                            <p className="stat-description">
                                Applications currently submitted
                            </p>

                        </article>


                        {/* ------------------------------------------------
                            Interviews
                        ------------------------------------------------- */}

                        <article className="stat-card">

                            <div className="stat-card-top">

                                <span className="stat-label">
                                    Interviews
                                </span>

                                <span className="stat-icon stat-icon-interview">
                                    I
                                </span>

                            </div>

                            <strong className="stat-value">

                                {isLoading
                                    ? "—"
                                    : interviewCount}

                            </strong>

                            <p className="stat-description">
                                Applications with interviews
                            </p>

                        </article>


                        {/* ------------------------------------------------
                            Offers
                        ------------------------------------------------- */}

                        <article className="stat-card">

                            <div className="stat-card-top">

                                <span className="stat-label">
                                    Offers
                                </span>

                                <span className="stat-icon stat-icon-offer">
                                    O
                                </span>

                            </div>

                            <strong className="stat-value">

                                {isLoading
                                    ? "—"
                                    : offerCount}

                            </strong>

                            <p className="stat-description">
                                Offers you've received
                            </p>

                        </article>

                    </div>

                </section>


                {/* =====================================================
                    APPLICATIONS SECTION
                ===================================================== */}

                <section className="dashboard-applications-section">


                    {/* -------------------------------------------------
                        Section Heading
                    -------------------------------------------------- */}

                    <div className="dashboard-section-heading">

                        <div>

                            <p className="dashboard-eyebrow">
                                Job applications
                            </p>

                            <h2>
                                Your Applications
                            </h2>

                        </div>


                        {/* -------------------------------------------------
                            Add Application
                        -------------------------------------------------- */}

                        <div className="dashboard-action-group">

                            <button
                                type="button"
                                className="dashboard-secondary-button"
                                onClick={() =>
                                    navigate("/analytics")
                                }
                            >
                                Analytics
                            </button>

                            <button
                                type="button"
                                className="dashboard-add-application-button"
                                onClick={() =>
                                    navigate("/dashboard/add")
                                }
                            >

                                <span className="dashboard-add-icon">
                                    +
                                </span>

                                Add Application

                            </button>

                        </div>

                    </div>


                    {/* =================================================
                        FOLLOW-UP REMINDER
                    ================================================= */}

                    {!isLoading &&
                        !error &&
                        followUpCount > 0 && (

                            <div
                                className="dashboard-follow-up-card"
                                role="status"
                            >

                                <div className="dashboard-follow-up-icon">
                                    !
                                </div>


                                <div className="dashboard-follow-up-content">

                                    <h3>
                                        Follow-up needed
                                    </h3>

                                    <p>

                                        You have{" "}

                                        <strong>
                                            {followUpCount}
                                        </strong>{" "}

                                        application
                                        {followUpCount !== 1
                                            ? "s"
                                            : ""}{" "}

                                        that{" "}

                                        {followUpCount !== 1
                                            ? "are"
                                            : "is"}{" "}

                                        more than 7 days old.
                                        Consider following up with{" "}

                                        {followUpCount !== 1
                                            ? "these companies."
                                            : "this company."}

                                    </p>

                                </div>

                            </div>

                        )}


                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {isLoading && (

                        <div className="dashboard-state-card">

                            <div className="dashboard-loader">
                                <span></span>
                            </div>

                            <p>
                                Loading your applications...
                            </p>

                        </div>

                    )}


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {!isLoading &&
                        error && (

                            <div
                                className="dashboard-state-card dashboard-error-card"
                            >

                                <h3>
                                    Something went wrong
                                </h3>

                                <p>
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={loadApplications}
                                >
                                    Try Again
                                </button>

                            </div>

                        )}


                    {/* =================================================
                        EMPTY STATE
                    ================================================= */}

                    {!isLoading &&
                        !error &&
                        applications.length === 0 && (

                            <div className="dashboard-state-card">

                                <div className="empty-state-icon">
                                    +
                                </div>

                                <h3>
                                    No applications yet
                                </h3>

                                <p>
                                    Start tracking your job applications
                                    to keep everything organized in one place.
                                </p>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() =>
                                        navigate("/dashboard/add")
                                    }
                                >
                                    Add Application
                                </button>

                            </div>

                        )}


                    {/* =================================================
                        APPLICATIONS PREVIEW
                    ================================================= */}

                    {!isLoading &&
                        !error &&
                        applications.length > 0 && (

                            <div className="applications-preview-card">

                                <div>

                                    <h3>
                                        Applications ready
                                    </h3>

                                    <p>

                                        You currently have{" "}

                                        <strong>
                                            {applications.length}
                                        </strong>{" "}

                                        tracked application
                                        {applications.length !== 1
                                            ? "s"
                                            : ""}.

                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() =>
                                        navigate(
                                            "/dashboard/applications"
                                        )
                                    }
                                >
                                    View Applications
                                </button>

                            </div>

                        )}

                </section>

            </div>

        </main>
    );
}


/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default Dashboard;