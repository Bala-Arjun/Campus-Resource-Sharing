import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard({ currentUser, onBack }) {
    const [resources, setResources] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchResources = async () => {
        if (!currentUser) {
            setResources([]);
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:5000/api/resources/owner/${currentUser.id}`
            );

            setResources(response.data);
        } catch (error) {
            console.error("Failed to fetch resources:", error);
        }
    };

    const fetchRequests = async () => {
        if (!currentUser) {
            setRequests([]);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:5000/api/requests/owner/${currentUser.id}`
            );

            setRequests(response.data);
        } catch (error) {
            console.error("Failed to fetch requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        fetchResources();
    }, [currentUser]);

    const updateStatus = async (id, status) => {
        try {
            const response = await axios.patch(
                `http://localhost:5000/api/requests/${id}/status`,
                {
                    status: status,
                }
            );

            setRequests((previousRequests) =>
                previousRequests.map((request) =>
                    request._id === id ? response.data : request
                )
            );
        } catch (error) {
            console.error("Failed to update request:", error);
            alert("Failed to update request.");
        }
    };

    const handleDeleteResource = async (id) => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this resource?"
    );

    if (!confirmed) {
        return;
    }

    try {
        await axios.delete(
    `http://localhost:5000/api/resources/${id}`,
    {
        data: {
            ownerId: currentUser.id
        }
    }
);

        setResources((previousResources) =>
            previousResources.filter(
                (resource) => resource._id !== id
            )
        );

        alert("Resource deleted successfully!");
    } catch (error) {
        console.error("Failed to delete resource:", error);
        alert("Failed to delete resource.");
    }
};

    return (
        <div className="dashboard">

            <button className="back-btn" onClick={onBack}>
                ← Back to Home
            </button>

            <div className="dashboard-header">
                <h1>Owner Dashboard</h1>
                <p>Manage your shared resources and requests.</p>
            </div>

            {loading ? (
                <p>Loading dashboard...</p>
            ) : (
                <div className="dashboard-content">

                    {/* My Shared Resources */}

                    <section className="my-resources">
                        <h2>My Shared Resources</h2>

                        {resources.length === 0 ? (
                            <div className="empty-dashboard">
                                <p>
                                    You haven't shared any resources yet.
                                </p>
                            </div>
                        ) : (
                            <div className="my-resource-list">
                                {resources.map((resource) => (
                                    <div
                                        className="my-resource-card"
                                        key={resource._id}
                                    >
                                        <span className="resource-type">
                                            {resource.type}
                                        </span>

                                        <h3>{resource.title}</h3>

                                        <p>{resource.description}</p>

                                        <small>
                                            {resource.category} •{" "}
                                            {resource.type}
                                        </small>
                                        <div className="resource-actions">
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteResource(resource._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Requests */}

                    <section className="my-requests">
                        <h2>Requests for My Resources</h2>

                        {requests.length === 0 ? (
                            <div className="empty-dashboard">
                                <h3>No requests yet</h3>

                                <p>
                                    When students request your resources,
                                    their requests will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="request-list">

                                {requests.map((request) => (
                                    <div
                                        className="request-card"
                                        key={request._id}
                                    >

                                        <div className="request-info">

                                            <span className="request-status">
                                                {request.status}
                                            </span>

                                            <h2>
                                                {request.resourceTitle}
                                            </h2>

                                            <p>
                                                <strong>
                                                    Requested by:
                                                </strong>{" "}
                                                {request.requesterName}
                                            </p>

                                            <p>
                                                <strong>
                                                    Contact:
                                                </strong>{" "}
                                                {request.requesterContact}
                                            </p>

                                            <p>
                                                <strong>
                                                    Request date:
                                                </strong>{" "}
                                                {new Date(
                                                    request.createdAt
                                                ).toLocaleDateString()}
                                            </p>

                                        </div>

                                        {request.status === "Pending" && (
                                            <div className="request-actions">

                                                <button
                                                    className="accept-btn"
                                                    onClick={() =>
                                                        updateStatus(
                                                            request._id,
                                                            "Accepted"
                                                        )
                                                    }
                                                >
                                                    Accept
                                                </button>

                                                <button
                                                    className="reject-btn"
                                                    onClick={() =>
                                                        updateStatus(
                                                            request._id,
                                                            "Rejected"
                                                        )
                                                    }
                                                >
                                                    Reject
                                                </button>

                                            </div>
                                        )}

                                    </div>
                                ))}

                            </div>
                        )}

                    </section>

                </div>
            )}

        </div>
    );
}

export default Dashboard;