/*
|--------------------------------------------------------------------------
| Applications Page
|--------------------------------------------------------------------------
|
| Displays all job applications belonging to the authenticated user.
|
| Features:
| - Fetch applications from backend
| - Search by company / position
| - Filter by status
| - Sort by applied date
| - Clear search / filters / sort
| - Edit application
| - Delete application
| - Responsive desktop table
| - Responsive mobile cards
| - Loading state
| - Error state
| - Empty state
| - Filtered empty state
| - Navigation to dashboard
| - Navigation to Add Application
|
|--------------------------------------------------------------------------
*/

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getApplications,
    deleteApplication
} from "../services/applicationService";

import "./Applications.css";


/*
|--------------------------------------------------------------------------
| Application Statuses
|--------------------------------------------------------------------------
|
| These values should match the backend Application model.
|
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
| Sort Options
|--------------------------------------------------------------------------
*/

const sortOptions = [
    {
        value: "newest",
        label: "Newest first"
    },
    {
        value: "oldest",
        label: "Oldest first"
    }
];


/*
|--------------------------------------------------------------------------
| Status Class Helper
|--------------------------------------------------------------------------
|
| Example:
|
| "Interview Scheduled"
|
| becomes:
|
| "status-interview-scheduled"
|
|--------------------------------------------------------------------------
*/

const getStatusClassName = (status) => {

    if (!status) {
        return "status-unknown";
    }

    return `status-${String(status)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`;
};


/*
|--------------------------------------------------------------------------
| Format Date
|--------------------------------------------------------------------------
|
| Converts backend date into:
|
| Aug 27, 2026
|
|--------------------------------------------------------------------------
*/

const formatDate = (dateValue) => {

    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
};


/*
|--------------------------------------------------------------------------
| Extract Applications
|--------------------------------------------------------------------------
|
| Backend/service may return applications in different structures.
|
| Supported:
| 1. result
| 2. result.data
| 3. result.data.applications
| 4. result.applications
| 5. result.data.data
|
|--------------------------------------------------------------------------
*/

const extractApplications = (result) => {

    /*
    |--------------------------------------------------------------------------
    | Direct Array
    |--------------------------------------------------------------------------
    */

    if (Array.isArray(result)) {
        return result;
    }


    /*
    |--------------------------------------------------------------------------
    | result.data is an Array
    |--------------------------------------------------------------------------
    */

    if (Array.isArray(result?.data)) {
        return result.data;
    }


    /*
    |--------------------------------------------------------------------------
    | result.data.applications
    |--------------------------------------------------------------------------
    */

    if (Array.isArray(result?.data?.applications)) {
        return result.data.applications;
    }


    /*
    |--------------------------------------------------------------------------
    | result.applications
    |--------------------------------------------------------------------------
    */

    if (Array.isArray(result?.applications)) {
        return result.applications;
    }


    /*
    |--------------------------------------------------------------------------
    | result.data.data
    |--------------------------------------------------------------------------
    */

    if (Array.isArray(result?.data?.data)) {
        return result.data.data;
    }


    /*
    |--------------------------------------------------------------------------
    | Nothing Found
    |--------------------------------------------------------------------------
    */

    return [];
};


/*
|--------------------------------------------------------------------------
| Applications Component
|--------------------------------------------------------------------------
*/

function Applications() {

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
    | Search State
    |--------------------------------------------------------------------------
    */

    const [
        searchQuery,
        setSearchQuery
    ] = useState("");


    /*
    |--------------------------------------------------------------------------
    | Status Filter State
    |--------------------------------------------------------------------------
    */

    const [
        statusFilter,
        setStatusFilter
    ] = useState("All");


    /*
    |--------------------------------------------------------------------------
    | Sort State
    |--------------------------------------------------------------------------
    */

    const [
        sortOrder,
        setSortOrder
    ] = useState("newest");


    /*
    |--------------------------------------------------------------------------
    | Delete State
    |--------------------------------------------------------------------------
    */

    const [
        deletingId,
        setDeletingId
    ] = useState(null);


    /*
    |--------------------------------------------------------------------------
    | Delete Error State
    |--------------------------------------------------------------------------
    */

    const [
        deleteError,
        setDeleteError
    ] = useState("");


    /*
    |--------------------------------------------------------------------------
    | Load Applications
    |--------------------------------------------------------------------------
    */

    const loadApplications = async () => {

        setIsLoading(true);

        setError("");


        try {

            /*
            |--------------------------------------------------------------------------
            | API Request
            |--------------------------------------------------------------------------
            */

            const result =
                await getApplications();


            /*
            |--------------------------------------------------------------------------
            | Validate Backend Response
            |--------------------------------------------------------------------------
            */

            if (
                result &&
                typeof result === "object" &&
                !Array.isArray(result) &&
                result.success === false
            ) {

                throw new Error(
                    result.message ||
                    "Failed to load applications."
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Extract Applications
            |--------------------------------------------------------------------------
            */

            const applicationData =
                extractApplications(result);


            /*
            |--------------------------------------------------------------------------
            | Store Applications
            |--------------------------------------------------------------------------
            */

            setApplications(applicationData);

        } catch (requestError) {

            /*
            |--------------------------------------------------------------------------
            | Error Message
            |--------------------------------------------------------------------------
            */

            const backendMessage =
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Unable to load your applications. Please try again.";


            setError(backendMessage);


            /*
            |--------------------------------------------------------------------------
            | Clear Applications On Error
            |--------------------------------------------------------------------------
            */

            setApplications([]);

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

            try {

                const result =
                    await getApplications();


                /*
                |--------------------------------------------------------------------------
                | Component Unmounted
                |--------------------------------------------------------------------------
                */

                if (cancelled) {
                    return;
                }


                /*
                |--------------------------------------------------------------------------
                | Validate Backend Response
                |--------------------------------------------------------------------------
                */

                if (
                    result &&
                    typeof result === "object" &&
                    !Array.isArray(result) &&
                    result.success === false
                ) {

                    throw new Error(
                        result.message ||
                        "Failed to load applications."
                    );
                }


                /*
                |--------------------------------------------------------------------------
                | Extract Applications
                |--------------------------------------------------------------------------
                */

                const applicationData =
                    extractApplications(result);


                /*
                |--------------------------------------------------------------------------
                | Store Applications
                |--------------------------------------------------------------------------
                */

                setApplications(applicationData);

            } catch (requestError) {

                if (cancelled) {
                    return;
                }


                const backendMessage =
                    requestError?.response?.data?.message ||
                    requestError?.message ||
                    "Unable to load your applications. Please try again.";


                setError(backendMessage);

                setApplications([]);

            } finally {

                if (!cancelled) {
                    setIsLoading(false);
                }
            }
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
    | Filter + Search + Sort
    |--------------------------------------------------------------------------
    |
    | Everything happens on the frontend.
    |
    |--------------------------------------------------------------------------
    */

    const filteredApplications = applications
        .filter((application) => {

            /*
            |--------------------------------------------------------------------------
            | Search
            |--------------------------------------------------------------------------
            */

            const search =
                searchQuery
                    .trim()
                    .toLowerCase();


            /*
            |--------------------------------------------------------------------------
            | Empty Search
            |--------------------------------------------------------------------------
            */

            if (!search) {
                return true;
            }


            /*
            |--------------------------------------------------------------------------
            | Company
            |--------------------------------------------------------------------------
            */

            const company =
                String(
                    application?.company || ""
                ).toLowerCase();


            /*
            |--------------------------------------------------------------------------
            | Position
            |--------------------------------------------------------------------------
            |
            | Supports both:
            | - position
            | - role
            |
            |--------------------------------------------------------------------------
            */

            const position =
                String(
                    application?.position ||
                    application?.role ||
                    ""
                ).toLowerCase();


            return (
                company.includes(search) ||
                position.includes(search)
            );
        })


        /*
        |--------------------------------------------------------------------------
        | Status Filter
        |--------------------------------------------------------------------------
        */

        .filter((application) => {

            if (statusFilter === "All") {
                return true;
            }

            return (
                application?.status ===
                statusFilter
            );
        })


        /*
        |--------------------------------------------------------------------------
        | Sort
        |--------------------------------------------------------------------------
        */

        .sort((a, b) => {

            const dateA =
                new Date(
                    a?.appliedDate || 0
                ).getTime();


            const dateB =
                new Date(
                    b?.appliedDate || 0
                ).getTime();


            if (sortOrder === "oldest") {
                return dateA - dateB;
            }


            return dateB - dateA;
        });


    /*
    |--------------------------------------------------------------------------
    | Clear Filters
    |--------------------------------------------------------------------------
    */

    const clearFilters = () => {

        setSearchQuery("");

        setStatusFilter("All");

        setSortOrder("newest");
    };


    /*
    |--------------------------------------------------------------------------
    | Are Filters Active?
    |--------------------------------------------------------------------------
    |
    | Clear button is shown whenever:
    | - Search is active
    | - Status filter is active
    | - Sort is changed
    |
    |--------------------------------------------------------------------------
    */

    const hasActiveFilters =
        searchQuery.trim() !== "" ||
        statusFilter !== "All" ||
        sortOrder !== "newest";


    /*
    |--------------------------------------------------------------------------
    | Delete Application
    |--------------------------------------------------------------------------
    */

    const handleDelete = async (application) => {

        const id =
            application?._id ||
            application?.id;


        if (!id) {
            return;
        }


        const companyName =
            application?.company ||
            "this application";


        const confirmed =
            window.confirm(
                `Are you sure you want to delete ${companyName}?`
            );


        if (!confirmed) {
            return;
        }


        setDeletingId(id);

        setDeleteError("");


        try {

            const result =
                await deleteApplication(id);


            /*
            |--------------------------------------------------------------------------
            | Validate Delete Response
            |--------------------------------------------------------------------------
            */

            if (
                result &&
                typeof result === "object" &&
                result.success === false
            ) {

                throw new Error(
                    result.message ||
                    "Failed to delete application."
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Remove Application From Local State
            |--------------------------------------------------------------------------
            */

            setApplications(
                (previousApplications) =>
                    previousApplications.filter(
                        (applicationItem) => {

                            const applicationId =
                                applicationItem?._id ||
                                applicationItem?.id;

                            return applicationId !== id;
                        }
                    )
            );

        } catch (requestError) {

            const backendMessage =
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Unable to delete application. Please try again.";


            setDeleteError(backendMessage);

        } finally {

            setDeletingId(null);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <main className="applications-page">


            {/* =========================================================
                HEADER
            ========================================================= */}

            <header className="applications-header">

                <div className="applications-header-content">


                    {/* -------------------------------------------------
                        Brand
                    -------------------------------------------------- */}

                    <button
                        type="button"
                        className="applications-brand"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >

                        <span className="applications-brand-icon">
                            JT
                        </span>

                        <span>
                            Job Tracker
                        </span>

                    </button>


                    {/* -------------------------------------------------
                        Header Actions
                    -------------------------------------------------- */}

                    <div className="applications-header-actions">

                        <button
                            type="button"
                            className="applications-back-button"
                            onClick={() =>
                                navigate("/dashboard")
                            }
                        >
                            ← Dashboard
                        </button>


                        <button
                            type="button"
                            className="applications-add-button"
                            onClick={() =>
                                navigate("/dashboard/add")
                            }
                        >

                            <span>
                                +
                            </span>

                            Add Application

                        </button>

                    </div>

                </div>

            </header>


            {/* =========================================================
                MAIN CONTENT
            ========================================================= */}

            <section className="applications-container">


                {/* -----------------------------------------------------
                    INTRO
                ------------------------------------------------------ */}

                <div className="applications-intro">

                    <div>

                        <p className="applications-eyebrow">
                            Job applications
                        </p>


                        <h1>
                            All Applications
                        </h1>


                        <p>
                            Keep track of every opportunity in one organized
                            place and stay focused on your next move.
                        </p>

                    </div>


                    {/* -------------------------------------------------
                        Application Count
                    -------------------------------------------------- */}

                    {!isLoading && !error && (

                        <div className="applications-count">

                            <strong>
                                {filteredApplications.length}
                            </strong>

                            <span>
                                {filteredApplications.length === 1
                                    ? "Application"
                                    : "Applications"}
                            </span>

                        </div>

                    )}

                </div>


                {/* =====================================================
                    SEARCH & FILTERS
                ===================================================== */}

                {!isLoading &&
                    !error &&
                    applications.length > 0 && (

                    <div className="applications-filters">


                        {/* -------------------------------------------------
                            SEARCH
                        -------------------------------------------------- */}

                        <div className="applications-search">

                            <span
                                className="applications-search-icon"
                                aria-hidden="true"
                            >
                                ⌕
                            </span>


                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(
                                        event.target.value
                                    )
                                }
                                placeholder="Search company or position..."
                                aria-label="Search applications"
                            />

                        </div>


                        {/* -------------------------------------------------
                            STATUS
                        -------------------------------------------------- */}

                        <div className="applications-filter-field">

                            <label htmlFor="statusFilter">
                                Status
                            </label>


                            <select
                                id="statusFilter"
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="All">
                                    All statuses
                                </option>


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

                        </div>


                        {/* -------------------------------------------------
                            SORT
                        -------------------------------------------------- */}

                        <div className="applications-filter-field">

                            <label htmlFor="sortOrder">
                                Sort
                            </label>


                            <select
                                id="sortOrder"
                                value={sortOrder}
                                onChange={(event) =>
                                    setSortOrder(
                                        event.target.value
                                    )
                                }
                            >

                                {sortOptions.map(
                                    (option) => (

                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* -------------------------------------------------
                            CLEAR
                        -------------------------------------------------- */}

                        {hasActiveFilters && (

                            <button
                                type="button"
                                className="applications-clear-filters"
                                onClick={clearFilters}
                            >
                                Clear
                            </button>

                        )}

                    </div>

                )}


                {/* =====================================================
                    DELETE ERROR
                ===================================================== */}

                {deleteError && (

                    <div
                        className="applications-delete-error"
                        role="alert"
                    >
                        {deleteError}
                    </div>

                )}


                {/* =====================================================
                    CONTENT
                ===================================================== */}


                {/* -----------------------------------------------------
                    LOADING
                ------------------------------------------------------ */}

                {isLoading && (

                    <div className="applications-state-card">

                        <div className="applications-loader">
                            <span></span>
                        </div>


                        <h2>
                            Loading applications
                        </h2>


                        <p>
                            Fetching your job applications...
                        </p>

                    </div>

                )}


                {/* -----------------------------------------------------
                    ERROR
                ------------------------------------------------------ */}

                {!isLoading && error && (

                    <div
                        className="applications-state-card applications-error-card"
                        role="alert"
                    >

                        <div className="applications-state-icon">
                            !
                        </div>


                        <h2>
                            Unable to load applications
                        </h2>


                        <p>
                            {error}
                        </p>


                        <button
                            type="button"
                            className="applications-primary-button"
                            onClick={() =>
                                loadApplications()
                            }
                        >
                            Try Again
                        </button>

                    </div>

                )}


                {/* -----------------------------------------------------
                    NO APPLICATIONS AT ALL
                ------------------------------------------------------ */}

                {!isLoading &&
                    !error &&
                    applications.length === 0 && (

                    <div className="applications-state-card">

                        <div className="applications-state-icon">
                            +
                        </div>


                        <h2>
                            No applications yet
                        </h2>


                        <p>
                            Start tracking your job search by adding
                            your first application.
                        </p>


                        <button
                            type="button"
                            className="applications-primary-button"
                            onClick={() =>
                                navigate("/dashboard/add")
                            }
                        >
                            + Add Application
                        </button>

                    </div>

                )}


                {/* -----------------------------------------------------
                    FILTERED EMPTY STATE
                ------------------------------------------------------ */}

                {!isLoading &&
                    !error &&
                    applications.length > 0 &&
                    filteredApplications.length === 0 && (

                    <div className="applications-state-card applications-filter-empty">

                        <div className="applications-state-icon">
                            ⌕
                        </div>


                        <h2>
                            No matching applications
                        </h2>


                        <p>
                            We couldn't find any applications matching
                            your current search or filters.
                        </p>


                        <button
                            type="button"
                            className="applications-primary-button"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>

                    </div>

                )}


                {/* =====================================================
                    APPLICATION LIST
                ===================================================== */}

                {!isLoading &&
                    !error &&
                    applications.length > 0 &&
                    filteredApplications.length > 0 && (

                    <div className="applications-list-wrapper">


                        {/* =================================================
                            DESKTOP TABLE
                        ================================================= */}

                        <div className="applications-table-container">

                            <table className="applications-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Company
                                        </th>

                                        <th>
                                            Position
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Applied Date
                                        </th>

                                        <th>
                                            Salary
                                        </th>

                                        <th>
                                            Job Link
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredApplications.map(
                                        (application, index) => {

                                            const applicationId =
                                                application?._id ||
                                                application?.id;


                                            return (

                                                <tr
                                                    key={
                                                        applicationId ||
                                                        `${application?.company}-${application?.position}-${index}`
                                                    }
                                                >


                                                    {/* ---------------------------------
                                                        COMPANY
                                                    ---------------------------------- */}

                                                    <td>

                                                        <div className="application-company">

                                                            <div className="company-avatar">

                                                                {application?.company
                                                                    ?.charAt(0)
                                                                    ?.toUpperCase() ||
                                                                    "?"}

                                                            </div>


                                                            <strong>
                                                                {application?.company ||
                                                                    "Unknown Company"}
                                                            </strong>

                                                        </div>

                                                    </td>


                                                    {/* ---------------------------------
                                                        POSITION
                                                    ---------------------------------- */}

                                                    <td>

                                                        <span className="application-position">

                                                            {application?.position ||
                                                                application?.role ||
                                                                "—"}

                                                        </span>

                                                    </td>


                                                    {/* ---------------------------------
                                                        STATUS
                                                    ---------------------------------- */}

                                                    <td>

                                                        <span
                                                            className={`application-status ${getStatusClassName(
                                                                application?.status
                                                            )}`}
                                                        >

                                                            {application?.status ||
                                                                "Unknown"}

                                                        </span>

                                                    </td>


                                                    {/* ---------------------------------
                                                        DATE
                                                    ---------------------------------- */}

                                                    <td>

                                                        <span className="application-date">

                                                            {formatDate(
                                                                application?.appliedDate
                                                            )}

                                                        </span>

                                                    </td>


                                                    {/* ---------------------------------
                                                        SALARY
                                                    ---------------------------------- */}

                                                    <td>

                                                        <span className="application-salary">

                                                            {application?.salaryRange ||
                                                                "—"}

                                                        </span>

                                                    </td>


                                                    {/* ---------------------------------
                                                        JOB LINK
                                                    ---------------------------------- */}

                                                    <td>

                                                        {application?.jobUrl ? (

                                                            <a
                                                                href={
                                                                    application.jobUrl
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="application-job-link"
                                                            >
                                                                Open ↗
                                                            </a>

                                                        ) : (

                                                            <span className="application-no-link">
                                                                —
                                                            </span>

                                                        )}

                                                    </td>


                                                    {/* ---------------------------------
                                                        ACTIONS
                                                    ---------------------------------- */}

                                                    <td>

                                                        <div className="application-actions">

                                                            <button
                                                                type="button"
                                                                className="application-edit-button"
                                                                disabled={
                                                                    deletingId ===
                                                                    applicationId
                                                                }
                                                                onClick={() => {

                                                                    if (!applicationId) {
                                                                        return;
                                                                    }

                                                                    navigate(
                                                                        `/dashboard/edit/${applicationId}`
                                                                    );

                                                                }}
                                                            >
                                                                Edit
                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="application-delete-button"
                                                                disabled={
                                                                    deletingId ===
                                                                    applicationId
                                                                }
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        application
                                                                    )
                                                                }
                                                            >

                                                                {deletingId ===
                                                                applicationId
                                                                    ? "Deleting..."
                                                                    : "Delete"}

                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>


                        {/* =================================================
                            MOBILE CARDS
                        ================================================= */}

                        <div className="applications-mobile-list">

                            {filteredApplications.map(
                                (application, index) => {

                                    const applicationId =
                                        application?._id ||
                                        application?.id;


                                    return (

                                        <article
                                            key={
                                                applicationId ||
                                                `mobile-${application?.company}-${application?.position}-${index}`
                                            }
                                            className="application-mobile-card"
                                        >


                                            {/* ---------------------------------
                                                TOP
                                            ---------------------------------- */}

                                            <div className="mobile-card-top">

                                                <div className="application-company">

                                                    <div className="company-avatar">

                                                        {application?.company
                                                            ?.charAt(0)
                                                            ?.toUpperCase() ||
                                                            "?"}

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {application?.company ||
                                                                "Unknown Company"}
                                                        </strong>


                                                        <span>
                                                            {application?.position ||
                                                                application?.role ||
                                                                "—"}
                                                        </span>

                                                    </div>

                                                </div>


                                                <span
                                                    className={`application-status ${getStatusClassName(
                                                        application?.status
                                                    )}`}
                                                >

                                                    {application?.status ||
                                                        "Unknown"}

                                                </span>

                                            </div>


                                            {/* ---------------------------------
                                                DETAILS
                                            ---------------------------------- */}

                                            <div className="mobile-card-details">

                                                <div>

                                                    <span>
                                                        Applied
                                                    </span>

                                                    <strong>
                                                        {formatDate(
                                                            application?.appliedDate
                                                        )}
                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        Salary
                                                    </span>

                                                    <strong>
                                                        {application?.salaryRange ||
                                                            "—"}
                                                    </strong>

                                                </div>

                                            </div>


                                            {/* ---------------------------------
                                                LINK
                                            ---------------------------------- */}

                                            {application?.jobUrl && (

                                                <a
                                                    href={
                                                        application.jobUrl
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mobile-job-link"
                                                >
                                                    View Job Posting ↗
                                                </a>

                                            )}


                                            {/* ---------------------------------
                                                MOBILE ACTIONS
                                            ---------------------------------- */}

                                            <div className="mobile-application-actions">

                                                <button
                                                    type="button"
                                                    className="application-edit-button"
                                                    disabled={
                                                        deletingId ===
                                                        applicationId
                                                    }
                                                    onClick={() => {

                                                        if (!applicationId) {
                                                            return;
                                                        }

                                                        navigate(
                                                            `/dashboard/edit/${applicationId}`
                                                        );

                                                    }}
                                                >
                                                    Edit
                                                </button>


                                                <button
                                                    type="button"
                                                    className="application-delete-button"
                                                    disabled={
                                                        deletingId ===
                                                        applicationId
                                                    }
                                                    onClick={() =>
                                                        handleDelete(
                                                            application
                                                        )
                                                    }
                                                >

                                                    {deletingId ===
                                                    applicationId
                                                        ? "Deleting..."
                                                        : "Delete"}

                                                </button>

                                            </div>


                                        </article>

                                    );

                                }
                            )}

                        </div>

                    </div>

                )}

            </section>

        </main>
    );
}


/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default Applications;