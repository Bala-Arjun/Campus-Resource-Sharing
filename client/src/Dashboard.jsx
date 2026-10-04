import { useEffect, useState } from "react";
import axios from "axios";
function Dashboard({ currentUser, onBack }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

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
}, [currentUser]);

    const updateStatus = async (id, status) => {
        try {
            const response = await axios.patch(
                `http://localhost:5000/api/requests/${id}/status`,
                {
                    status: status
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

    return (
        <div className="dashboard">
            <button className="back-btn" onClick={onBack}>
                ← Back to Home
            </button>

            <div className="dashboard-header">
                <h1>Owner Dashboard</h1>
                <p>Manage requests for your shared resources.</p>
            </div>

            {loading ? (
                <p>Loading requests...</p>
            ) : requests.length === 0 ? (
                <div className="empty-dashboard">
                    <h2>No requests yet</h2>
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

                                <h2>{request.resourceTitle}</h2>

                                <p>
                                    <strong>Requested by:</strong>{" "}
                                    {request.requesterName}
                                </p>

                                <p>
                                    <strong>Contact:</strong>{" "}
                                    {request.requesterContact}
                                </p>

                                <p>
                                    <strong>Request date:</strong>{" "}
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
        </div>
    );
}

export default Dashboard;