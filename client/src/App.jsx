import NotificationBell from "./NotificationBell";
import { GoogleLogin } from "@react-oauth/google";
import Dashboard from "./Dashboard";
import ResourceDetails from "./ResourceDetails";
import { useEffect, useState } from "react";
import axios from "axios";
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
        axios
            .get("http://localhost:5000/api/resources")
            .then((response) => {
                setResources(response.data);
            })
            .catch((error) => {
                console.error("Failed to fetch resources:", error);
            });
    }, []);

    const handleSearch = async () => {
    if (!searchTerm.trim()) {
        // If search is empty, load all resources again
        const response = await axios.get(
            "http://localhost:5000/api/resources"
        );

        setResources(response.data);
        return;
    }

    try {
        const response = await axios.get(
            `http://localhost:5000/api/resources/search?q=${searchTerm}`
        );

        setResources(response.data);
    } catch (error) {
        console.error("Search failed:", error);
    }
};

    return (
    <>
        {selectedResource ? (
            <ResourceDetails
                resource={selectedResource}
                currentUser={currentUser}
                onBack={() => setSelectedResource(null)}
            />
        ) : showDashboard ? (
            <Dashboard
                currentUser={currentUser}
                onBack={() => setShowDashboard(false)}
            />
        ) : (
            <div className="app">
            {/* Navigation Bar */}
            <nav className="navbar">
                <div className="logo">
                    CampusShare
                </div>

                <div className="nav-links">
                    <a href="/">Home</a>
                    <a href="/">Resources</a>
                    <a href="/">About</a>

                    <button
                        className="dashboard-btn"
                        onClick={() => setShowDashboard(true)}
                    >
                        Dashboard
                    </button>

                    {currentUser ? (
    <div className="user-menu">
        <span>👤 {currentUser.name}</span>
        <NotificationBell currentUser={currentUser} />
        <button
            className="logout-btn"
            onClick={() => {
            setCurrentUser(null);
            localStorage.removeItem("campusShareUser");
        }}
        >
            Logout
        </button>
    </div>
) : (
    <GoogleLogin
        onSuccess={async (credentialResponse) => {
            try {
                const response = await axios.post(
                    "http://localhost:5000/api/auth/google",
                    {
                        credential: credentialResponse.credential
                    }
                );

                const user = response.data.user;

                console.log("Logged in user:", user);

                setCurrentUser(user);
                localStorage.setItem(
                "campusShareUser",
                JSON.stringify(user)
            );

                alert(`Welcome, ${user.name}!`);
            } catch (error) {
                console.error("Login failed:", error);
                alert("Google login failed.");
            }
        }}
        onError={() => {
            console.log("Google Login Failed");
            alert("Google login failed.");
        }}
    />
)}
                </div>
            </nav>


            {/* Hero Section */}
            <section className="hero">

                <div className="hero-content">

                    <h1>
                        Share Resources.
                        <br />
                        Help Your Campus.
                    </h1>

                    <p>
                        Find, share and borrow useful resources
                        from students across your campus.
                    </p>

                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search for notes, books, equipment..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
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

                </div>

            </section>


            {/* Categories */}
            <section className="categories">

                <h2>Browse Categories</h2>

                <div className="category-container">

                    <div className="category-card">
                        📚
                        <h3>Notes</h3>
                        <p>Lecture notes and study material</p>
                    </div>

                    <div className="category-card">
                        📖
                        <h3>Books</h3>
                        <p>Books available for sharing</p>
                    </div>

                    <div className="category-card">
                        💻
                        <h3>Equipment</h3>
                        <p>Laptops, calculators and more</p>
                    </div>

                    <div className="category-card">
                        📦
                        <h3>Other</h3>
                        <p>Other useful campus resources</p>
                    </div>

                </div>

            </section>


            {/* Recent Resources */}
            <section className="resources">

                <div className="section-header">
                    <h2>Recent Resources</h2>

                    <button className="view-btn">
                        View All
                    </button>
                </div>


                <div className="resource-container">

                    {resources.length === 0 ? (
                        <p>No resources available yet.</p>
                    ) : (
                        resources.map((resource) => (
                            <div
                                className="resource-card"
                                key={resource._id}
                                onClick={() => setSelectedResource(resource)}
                            >

                                <span className="resource-type">
                                    {resource.type}
                                </span>

                                <h3>{resource.title}</h3>

                                <p>{resource.description}</p>

                                <small>
                                    Shared by {resource.owner}
                                </small>

                            </div>
                        ))
                    )}

                </div>

            </section>


            {/* Share Resource */}
            <section className="share-section">

                <h2>Have something useful?</h2>

                <p>
                    Share your notes, books or equipment
                    with other students.
                </p>

                <button
                    className="share-btn"
                    onClick={() => setShowForm(true)}
                >
                    + Share a Resource
                </button>

            </section>


            {/* Add Resource Form */}
            {showForm && (
                <AddResource
                  currentUser={currentUser}
                  onResourceAdded={(newResource) => {
                      setResources((previousResources) => [
                          newResource,
                          ...previousResources
                      ]);
                      setShowForm(false);
                  }}
              />
            )}


            {/* Footer */}
            <footer>
                <p>
                    © 2026 CampusShare — Built for students.
                </p>
            </footer>

        </div>
        )}
        </>
    );
}

export default App;