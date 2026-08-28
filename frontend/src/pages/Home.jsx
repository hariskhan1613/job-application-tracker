import { Link } from "react-router-dom";

import landingHero from "../assets/images/landing-hero.png";

import "./Home.css";

function Home() {
    return (
        <main className="landing-page">

            <div
                className="landing-background"
                style={{
                    backgroundImage: `url(${landingHero})`
                }}
            />

            <header className="landing-header">

                <Link
                    to="/"
                    className="landing-brand"
                >
                    <span className="brand-icon">
                        ✓
                    </span>

                    <span>
                        Track. Focus. Grow.
                    </span>
                </Link>

            </header>


            <section className="landing-content">

                <div className="landing-copy">

                    <h1 className="landing-title">
                        Every application
                        <br />
                        counts.{" "}
                        <span>Track it.</span>
                    </h1>


                    <p className="landing-description">
                        Stay organized, track progress, and land
                        your dream job faster with clarity and
                        confidence.
                    </p>


                    <div className="landing-cta">

                        <span className="cta-text">
                            Track Your Applications
                            <br />
                            and Organize
                        </span>


                        <Link
                            to="/login"
                            className="cta-button cta-login"
                        >
                            Login
                        </Link>


                        <span className="cta-or">
                            or
                        </span>


                        <Link
                            to="/register"
                            className="cta-button cta-register"
                        >
                            Register
                        </Link>

                    </div>

                </div>

            </section>

        </main>
    );
}

export default Home;