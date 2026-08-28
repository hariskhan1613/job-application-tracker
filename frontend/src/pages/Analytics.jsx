import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

import {
    getApplications,
    getApplicationStats
} from "../services/applicationService";

import { useAuth } from "../hooks/useAuth";

import "./Analytics.css";


/*
|--------------------------------------------------------------------------
| Status Colors
|--------------------------------------------------------------------------
|
| These colors match the project design spec and keep the charts easy to
| interpret at a glance.
|
|--------------------------------------------------------------------------
*/

const STATUS_COLORS = {
    Applied: "#3B82F6",
    "OA/Assessment": "#8B5CF6",
    "Interview Scheduled": "#F59E0B",
    "Interview Done": "#F59E0B",
    Offer: "#10B981",
    Rejected: "#EF4444",
    Withdrawn: "#9CA3AF"
};


/*
|--------------------------------------------------------------------------
| Default Stats Shape
|--------------------------------------------------------------------------
|--------------------------------------------------------------------------
*/

const defaultStats = {
    total: 0,
    byStatus: {
        Applied: 0,
        "OA/Assessment": 0,
        "Interview Scheduled": 0,
        "Interview Done": 0,
        Offer: 0,
        Rejected: 0,
        Withdrawn: 0
    }
};


/*
|--------------------------------------------------------------------------
| Extract Applications
|--------------------------------------------------------------------------
|
| The backend returns applications wrapped in different shapes depending on
| the service or API response. We normalize them so the analytics page always
| works with a clean array.
|
|--------------------------------------------------------------------------
*/

const extractApplications = (result) => {

    if (Array.isArray(result)) {
        return result;
    }

    if (Array.isArray(result?.data)) {
        return result.data;
    }

    if (Array.isArray(result?.data?.applications)) {
        return result.data.applications;
    }

    if (Array.isArray(result?.applications)) {
        return result.applications;
    }

    if (Array.isArray(result?.data?.data)) {
        return result.data.data;
    }

    return [];
};


/*
|--------------------------------------------------------------------------
| Format Month Label
|--------------------------------------------------------------------------
|--------------------------------------------------------------------------
*/

const formatMonthLabel = (dateValue) => {

    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit"
    });
};


/*
|--------------------------------------------------------------------------
| Analytics Page
|--------------------------------------------------------------------------
*/

function Analytics() {

    const navigate = useNavigate();

    const {
        user,
        logout
    } = useAuth();


    /*
    |--------------------------------------------------------------------------
    | Local State
    |--------------------------------------------------------------------------
    */

    const [stats, setStats] = useState(defaultStats);
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");


    /*
    |--------------------------------------------------------------------------
    | Load Analytics Data
    |--------------------------------------------------------------------------
    |
    | We fetch the aggregated status counts and all applications in parallel.
    | The status data powers the donut chart, while the full list powers the
    | trend line and insight cards.
    |
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        let cancelled = false;

        const loadAnalytics = async () => {

            setIsLoading(true);
            setError("");

            try {

                const [statsResponse, applicationsResponse] =
                    await Promise.all([
                        getApplicationStats(),
                        getApplications()
                    ]);

                if (cancelled) {
                    return;
                }

                const normalizedStats = {
                    total: Number(statsResponse?.data?.total ?? statsResponse?.total ?? 0),
                    byStatus: {
                        Applied: Number(statsResponse?.data?.byStatus?.Applied ?? statsResponse?.byStatus?.Applied ?? 0),
                        "OA/Assessment": Number(statsResponse?.data?.byStatus?.["OA/Assessment"] ?? statsResponse?.byStatus?.["OA/Assessment"] ?? 0),
                        "Interview Scheduled": Number(statsResponse?.data?.byStatus?.["Interview Scheduled"] ?? statsResponse?.byStatus?.["Interview Scheduled"] ?? 0),
                        "Interview Done": Number(statsResponse?.data?.byStatus?.["Interview Done"] ?? statsResponse?.byStatus?.["Interview Done"] ?? 0),
                        Offer: Number(statsResponse?.data?.byStatus?.Offer ?? statsResponse?.byStatus?.Offer ?? 0),
                        Rejected: Number(statsResponse?.data?.byStatus?.Rejected ?? statsResponse?.byStatus?.Rejected ?? 0),
                        Withdrawn: Number(statsResponse?.data?.byStatus?.Withdrawn ?? statsResponse?.byStatus?.Withdrawn ?? 0)
                    }
                };

                setStats(normalizedStats);
                setApplications(extractApplications(applicationsResponse));

            } catch (requestError) {

                if (cancelled) {
                    return;
                }

                setError(
                    requestError?.response?.data?.message ||
                    requestError?.message ||
                    "Unable to load analytics data."
                );

            } finally {

                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        loadAnalytics();

        return () => {
            cancelled = true;
        };
    }, []);


    /*
    |--------------------------------------------------------------------------
    | Derived Values
    |--------------------------------------------------------------------------
    */

    const statusData = useMemo(
        () => Object.entries(stats.byStatus).map(([name, count]) => ({
            name,
            count
        })),
        [stats.byStatus]
    );

    const totalApplications = stats.total || applications.length;

    const interviewCount =
        (stats.byStatus["Interview Scheduled"] || 0) +
        (stats.byStatus["Interview Done"] || 0);

    const responseRate =
        totalApplications > 0
            ? (
                ((
                    (stats.byStatus["Interview Scheduled"] || 0) +
                    (stats.byStatus["Interview Done"] || 0) +
                    (stats.byStatus.Offer || 0) +
                    (stats.byStatus.Rejected || 0)
                ) /
                totalApplications) *
                100
            )
            : 0;

    const trendData = useMemo(() => {

        const monthBucket = new Map();

        for (let index = 5; index >= 0; index -= 1) {
            const date = new Date();
            date.setMonth(date.getMonth() - index);
            date.setDate(1);
            date.setHours(0, 0, 0, 0);
            const key = date.toISOString().slice(0, 7);
            monthBucket.set(key, { month: formatMonthLabel(date), count: 0 });
        }

        applications.forEach((application) => {
            const sourceDate = application?.appliedDate || application?.createdAt;
            if (!sourceDate) {
                return;
            }

            const parsedDate = new Date(sourceDate);
            if (Number.isNaN(parsedDate.getTime())) {
                return;
            }

            const key = parsedDate.toISOString().slice(0, 7);
            if (monthBucket.has(key)) {
                monthBucket.get(key).count += 1;
            }
        });

        return Array.from(monthBucket.values());

    }, [applications]);

    const bestMonth =
        trendData.reduce(
            (best, current) =>
                current.count > best.count ? current : best,
            {
                month: "No data",
                count: 0
            }
        );


    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <main className="analytics-page">

            <header className="analytics-header">

                <div className="analytics-header-content">

                    <button
                        type="button"
                        className="analytics-brand"
                        onClick={() => navigate("/dashboard")}
                    >
                        <span className="analytics-brand-icon">
                            JT
                        </span>

                        <span>
                            Job Tracker
                        </span>
                    </button>

                    <div className="analytics-user-area">

                        <div className="analytics-user-info">
                            <span className="analytics-user-name">
                                {user?.name || "User"}
                            </span>

                            <span className="analytics-user-email">
                                {user?.email || ""}
                            </span>
                        </div>

                        <button
                            type="button"
                            className="analytics-secondary-button"
                            onClick={() => navigate("/dashboard")}
                        >
                            Dashboard
                        </button>

                        <button
                            type="button"
                            className="analytics-logout-button"
                            onClick={logout}
                        >
                            Logout
                        </button>

                    </div>

                </div>

            </header>

            <div className="analytics-container">

                <section className="analytics-intro">

                    <div>
                        <p className="analytics-eyebrow">
                            Performance overview
                        </p>

                        <h1>
                            Analytics dashboard
                        </h1>

                        <p className="analytics-subtitle">
                            Understand application momentum, follow-up health, and job-search progress in one place.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="analytics-primary-button"
                        onClick={() => navigate("/dashboard/applications")}
                    >
                        View applications
                    </button>

                </section>

                {error && (
                    <div className="analytics-state-card analytics-error-card">
                        <h3>
                            Something went wrong
                        </h3>

                        <p>
                            {error}
                        </p>
                    </div>
                )}

                {!isLoading && !error && (
                    <>
                        <section className="analytics-stats-grid">

                            <article className="analytics-stat-card">
                                <span className="analytics-stat-label">
                                    Total applications
                                </span>
                                <strong className="analytics-stat-value">
                                    {totalApplications}
                                </strong>
                                <p className="analytics-stat-meta">
                                    All tracked opportunities
                                </p>
                            </article>

                            <article className="analytics-stat-card">
                                <span className="analytics-stat-label">
                                    Interview activity
                                </span>
                                <strong className="analytics-stat-value">
                                    {interviewCount}
                                </strong>
                                <p className="analytics-stat-meta">
                                    Interview stage entries
                                </p>
                            </article>

                            <article className="analytics-stat-card">
                                <span className="analytics-stat-label">
                                    Response rate
                                </span>
                                <strong className="analytics-stat-value">
                                    {responseRate.toFixed(1)}%
                                </strong>
                                <p className="analytics-stat-meta">
                                    Interview + offer + rejection rate
                                </p>
                            </article>

                            <article className="analytics-stat-card">
                                <span className="analytics-stat-label">
                                    Best month
                                </span>
                                <strong className="analytics-stat-value">
                                    {bestMonth.month}
                                </strong>
                                <p className="analytics-stat-meta">
                                    {bestMonth.count} applications logged
                                </p>
                            </article>

                        </section>

                        <section className="analytics-charts-grid">

                            <article className="analytics-chart-card analytics-chart-card-large">
                                <div className="analytics-chart-header">
                                    <h2>
                                        Status breakdown
                                    </h2>
                                </div>

                                <div className="analytics-chart-body">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={statusData.filter((entry) => entry.count > 0)}
                                                dataKey="count"
                                                nameKey="name"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={4}
                                            >
                                                {statusData
                                                    .filter((entry) => entry.count > 0)
                                                    .map((entry) => (
                                                        <Cell
                                                            key={entry.name}
                                                            fill={STATUS_COLORS[entry.name] || "#64748B"}
                                                        />
                                                    ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </article>

                            <article className="analytics-chart-card">
                                <div className="analytics-chart-header">
                                    <h2>
                                        Applications over time
                                    </h2>
                                </div>

                                <div className="analytics-chart-body">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={trendData}>
                                            <CartesianGrid strokeDasharray="4 4" stroke="#dfe7f5" />
                                            <XAxis dataKey="month" tickLine={false} axisLine={false} />
                                            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                                            <Tooltip />
                                            <Line
                                                type="monotone"
                                                dataKey="count"
                                                stroke="#4F46E5"
                                                strokeWidth={3}
                                                dot={{ r: 4 }}
                                                activeDot={{ r: 7 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </article>

                            <article className="analytics-chart-card analytics-chart-card-wide">
                                <div className="analytics-chart-header">
                                    <h2>
                                        Status totals
                                    </h2>
                                </div>

                                <div className="analytics-chart-body">
                                    <ResponsiveContainer width="100%" height={320}>
                                        <BarChart data={statusData}>
                                            <CartesianGrid strokeDasharray="4 4" stroke="#dfe7f5" />
                                            <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-12} textAnchor="end" height={80} />
                                            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                                            <Tooltip />
                                            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                                {statusData.map((entry) => (
                                                    <Cell
                                                        key={entry.name}
                                                        fill={STATUS_COLORS[entry.name] || "#64748B"}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </article>

                        </section>
                    </>
                )}

                {isLoading && (
                    <div className="analytics-state-card">
                        <div className="analytics-loader" aria-label="Loading analytics" />
                        <p>
                            Loading your analytics...
                        </p>
                    </div>
                )}

            </div>

        </main>
    );
}

export default Analytics;
