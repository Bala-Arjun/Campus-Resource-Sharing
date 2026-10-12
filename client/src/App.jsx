import NotificationBell from "./NotificationBell";
import { GoogleLogin } from "@react-oauth/google";
import Dashboard from "./Dashboard";
import ResourceDetails from "./ResourceDetails";
import { useEffect, useState } from "react";
import api from "./api";
import AddResource from "./AddResource";
import "./App.css";

function App() {
    const [resources, setResources] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedResource, setSelectedResource] = useState(null);
    const [showDashboard, setShowDashboard] = useState(false);

    const [currentUser, setCurrentUser] = useState(() => {
        const savedUser = localStorage.getItem("campusShareUser");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const response = await api.get("/resources");

            setResources(response.data);
        } catch (error) {
            console.error("Failed to fetch resources:", error);
        }
    };

    const handleViewAllResources = async () => {
        setSearchTerm("");
        await fetchResources();
        document.getElementById("resources-section")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchResources();
            return;
        }

        try {
            const response = await api.get(
                `/resources/search?q=${encodeURIComponent(searchTerm)}`
            );

            setResources(response.data);
        } catch (error) {
            console.error("Search failed:", error);
        }
    };

    const handleCategoryClick = async (category) => {
        setSearchTerm(category);

        try {
            const response = await api.get(
                `/resources/search?q=${encodeURIComponent(category)}`
            );

            setResources(response.data);
        } catch (error) {
            console.error("Category search failed:", error);
        }
    };

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem("campusShareUser");
    };

    if (selectedResource) {
        return (
            <ResourceDetails
                resource={selectedResource}
                currentUser={currentUser}
                onBack={() => setSelectedResource(null)}
            />
        );
    }

    if (showDashboard) {
        return (
            <Dashboard
                currentUser={currentUser}
                onBack={() => {
                    fetchResources();
                    setShowDashboard(false);
                }}
            />
        );
    }

    return (
        <div className="app">

            {/* ================= NAVBAR ================= */}

            <nav className="navbar">

                <button
                    className="logo"
                    onClick={() => {
                        setShowDashboard(false);
                        setSelectedResource(null);
                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });
                    }}
                >
                    <span className="logo-icon">C</span>
                    <span>Campus<span>Share</span></span>
                </button>

                <div className="nav-links">

                    <button
                        onClick={() =>
                            window.scrollTo({
                                top: 0,
                                behavior: "smooth"
                            })
                        }
                    >
                        Home
                    </button>

                    <button
                        onClick={() =>
                            document
                                .getElementById("resources-section")
                                ?.scrollIntoView({
                                    behavior: "smooth"
                                })
                        }
                    >
                        Resources
                    </button>

                    <button
                        onClick={() =>
                            document
                                .getElementById("about-section")
                                ?.scrollIntoView({
                                    behavior: "smooth"
                                })
                        }
                    >
                        About
                    </button>

                    {currentUser && (
                        <button
                            className="dashboard-nav-btn"
                            onClick={() => setShowDashboard(true)}
                        >
                            Dashboard
                        </button>
                    )}

                    {currentUser ? (
                        <div className="user-menu">

                            <NotificationBell
                                currentUser={currentUser}
                            />

                            <div className="user-profile">
                                {currentUser.profilePicture ? (
                                    <img
                                        src={currentUser.profilePicture}
                                        alt=""
                                    />
                                ) : (
                                    <div className="user-avatar">
                                        {currentUser.name
                                            ?.charAt(0)
                                            .toUpperCase()}
                                    </div>
                                )}

                                <span>{currentUser.name}</span>
                            </div>

                            <button
                                className="logout-btn"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>

                        </div>
                    ) : (
                        <div className="google-login-wrapper">
                            <GoogleLogin
                                onSuccess={async (
                                    credentialResponse
                                ) => {
                                    try {
                                        const response =
                                            await api.post(
                                                "/auth/google",
                                                {
                                                    credential:
                                                        credentialResponse.credential
                                                }
                                            );

                                        const user =
                                            response.data.user;

                                        setCurrentUser(user);

                                        localStorage.setItem(
                                            "campusShareUser",
                                            JSON.stringify(user)
                                        );

                                        alert(
                                            `Welcome, ${user.name}!`
                                        );
                                    } catch (error) {
                                        console.error(
                                            "Login failed:",
                                            error
                                        );

                                        alert(
                                            "Google login failed."
                                        );
                                    }
                                }}
                                onError={() => {
                                    alert(
                                        "Google login failed."
                                    );
                                }}
                            />
                        </div>
                    )}

                </div>
            </nav>


            {/* ================= HERO ================= */}

            <section className="hero">

                <div className="hero-background-circle circle-one"></div>
                <div className="hero-background-circle circle-two"></div>

                <div className="hero-content">

                    <div className="hero-badge">
                        <span>✦</span>
                        Built for students, by students
                    </div>

                    <h1>
                        Share what you have.
                        <br />
                        <span>Find what you need.</span>
                    </h1>

                    <p>
                        CampusShare makes it easy for students to
                        share notes, books, equipment and useful
                        resources with their campus community.
                    </p>

                    <div className="search-box">

                        <span className="search-icon">⌕</span>

                        <input
                            type="text"
                            placeholder="Search notes, books, calculators..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    handleSearch();
                                }
                            }}
                        />

                        <button onClick={handleSearch}>
                            Search
                        </button>

                    </div>

                    <div className="hero-features">

                        <span>
                            ✓ Student focused
                        </span>

                        <span>
                            ✓ Easy to share
                        </span>

                        <span>
                            ✓ Campus community
                        </span>

                    </div>

                </div>

            </section>


            {/* ================= CATEGORIES ================= */}

            <section className="categories">

                <div className="section-title">

                    <div>
                        <span className="section-label">
                            EXPLORE
                        </span>

                        <h2>Browse by category</h2>
                    </div>

                    <p>
                        Find exactly what you're looking for.
                    </p>

                </div>

                <div className="category-container">

                    <button
                        className="category-card notes-card"
                        onClick={() =>
                            handleCategoryClick("Notes")
                        }
                    >
                        <div className="category-icon">
                            📚
                        </div>

                        <div>
                            <h3>Notes</h3>
                            <p>
                                Lecture notes and study material
                            </p>
                        </div>

                        <span className="category-arrow">
                            →
                        </span>
                    </button>

                    <button
                        className="category-card books-card"
                        onClick={() =>
                            handleCategoryClick("Books")
                        }
                    >
                        <div className="category-icon">
                            📖
                        </div>

                        <div>
                            <h3>Books</h3>
                            <p>
                                Books available for sharing
                            </p>
                        </div>

                        <span className="category-arrow">
                            →
                        </span>
                    </button>

                    <button
                        className="category-card equipment-card"
                        onClick={() =>
                            handleCategoryClick("Equipment")
                        }
                    >
                        <div className="category-icon">
                            💻
                        </div>

                        <div>
                            <h3>Equipment</h3>
                            <p>
                                Calculators, laptops and more
                            </p>
                        </div>

                        <span className="category-arrow">
                            →
                        </span>
                    </button>

                    <button
                        className="category-card other-card"
                        onClick={() =>
                            handleCategoryClick("Other")
                        }
                    >
                        <div className="category-icon">
                            📦
                        </div>

                        <div>
                            <h3>Other</h3>
                            <p>
                                Other useful campus resources
                            </p>
                        </div>

                        <span className="category-arrow">
                            →
                        </span>
                    </button>

                </div>

            </section>


            {/* ================= RESOURCES ================= */}

            <section
                className="resources"
                id="resources-section"
            >

                <div className="section-title resource-heading">

                    <div>
                        <span className="section-label">
                            COMMUNITY
                        </span>

                        <h2>{searchTerm ? "Search results" : "All resources"}</h2>
                    </div>

                    <button
                        className="view-btn"
                        onClick={handleViewAllResources}
                    >
                        View all resources →
                    </button>

                </div>

                {resources.length === 0 ? (

                    <div className="empty-resources">

                        <div className="empty-icon">
                            🔎
                        </div>

                        <h3>No resources found</h3>

                        <p>
                            Try another search or be the first
                            student to share something.
                        </p>

                        {searchTerm && (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    fetchResources();
                                }}
                            >
                                Clear search
                            </button>
                        )}

                    </div>

                ) : (

                    <div className="resource-container">

                        {resources.map((resource) => (

                            <div
                                className="resource-card"
                                key={resource._id}
                                onClick={() =>
                                    setSelectedResource(resource)
                                }
                            >

                                <div className="resource-card-top">

                                    <span className="resource-type">
                                        {resource.type}
                                    </span>

                                    <span className="resource-category">
                                        {resource.category}
                                    </span>

                                </div>

                                <h3>
                                    {resource.title}
                                </h3>

                                <p>
                                    {resource.description}
                                </p>

                                <div className="resource-footer">

                                    <div className="resource-owner">

                                        <div className="owner-avatar">
                                            {resource.owner
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <span>
                                            {resource.owner}
                                        </span>

                                    </div>

                                    <span className="card-arrow">
                                        →
                                    </span>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>


            {/* ================= SHARE CTA ================= */}

            <section
                className="share-section"
                id="about-section"
            >

                <div className="share-decoration decoration-one"></div>
                <div className="share-decoration decoration-two"></div>

                <div className="share-content">

                    <div className="share-icon">
                        ✦
                    </div>

                    <span className="section-label light-label">
                        GIVE BACK TO YOUR CAMPUS
                    </span>

                    <h2>
                        Have something useful?
                    </h2>

                    <p>
                        Share your notes, books or equipment
                        and help another student succeed.
                    </p>

                    <button
                        className="share-btn"
                        onClick={() => {
                            if (!currentUser) {
                                alert(
                                    "Please sign in with Google before sharing a resource."
                                );
                                return;
                            }

                            setShowForm(true);
                        }}
                    >
                        + Share a Resource
                    </button>

                </div>

            </section>


            {/* ================= ADD RESOURCE ================= */}

            {showForm && (
                <div className="form-overlay">

                    <div className="form-modal">

                        <button
                            className="form-close"
                            onClick={() => setShowForm(false)}
                        >
                            ×
                        </button>

                        <AddResource
                            currentUser={currentUser}
                            onResourceAdded={(newResource) => {
                                setResources(
                                    (previousResources) => [
                                        newResource,
                                        ...previousResources
                                    ]
                                );

                                setShowForm(false);
                            }}
                        />

                    </div>

                </div>
            )}


            {/* ================= FOOTER ================= */}

            <footer>

                <div className="footer-main">

                    <div className="footer-brand">

                        <div className="footer-logo">
                            <span className="logo-icon">
                                C
                            </span>

                            CampusShare
                        </div>

                        <p>
                            Connecting students through
                            resource sharing.
                        </p>

                    </div>

                    <div className="footer-links">

                        <span>Student Community</span>
                        <span>Share Resources</span>
                        <span>Help Each Other</span>

                    </div>

                </div>

                <div className="footer-bottom">

                    <p>
                        © 2026 CampusShare
                    </p>

                    <p>
                        Built for students.
                    </p>

                </div>

            </footer>

        </div>
    );
}

export default App;
