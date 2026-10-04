import { useState } from "react";
import axios from "axios";

function ResourceDetails({ resource, currentUser, onBack }) {
    
    const [showRequestForm, setShowRequestForm] = useState(false);

    const handleRequest = async (event) => {
        event.preventDefault();
        if (!currentUser) {
            alert("Please sign in with Google before requesting a resource.");
            return;
        }

        try {
            await axios.post(
                "http://localhost:5000/api/requests",
                {
                    resourceId: resource._id,
                    requesterId: currentUser.id,
                    requesterName: currentUser.name,
                    requesterContact: currentUser.email
                }
            );

            alert("Resource request sent successfully!");

            
            setShowRequestForm(false);

        } catch (error) {
            console.error(error);
            alert("Failed to send request.");
        }
    };

    return (
        <div className="resource-details">

            <button className="back-btn" onClick={onBack}>
                ← Back to Resources
            </button>

            <div className="details-card">

                <span className="resource-type">
                    {resource.type}
                </span>

                <h1>{resource.title}</h1>

                <p className="details-description">
                    {resource.description}
                </p>

                <div className="details-info">

                    <p>
                        <strong>Category:</strong>{" "}
                        {resource.category}
                    </p>

                    <p>
                        <strong>Type:</strong>{" "}
                        {resource.type}
                    </p>

                    <p>
                        <strong>Shared by:</strong>{" "}
                        {resource.owner}
                    </p>

                    <p>
                        <strong>Contact:</strong>{" "}
                        {resource.contact}
                    </p>

                </div>

                {!showRequestForm && (
                    <button
                        className="request-btn"
                        onClick={() => setShowRequestForm(true)}
                    >
                        Request Resource
                    </button>
                )}

                {showRequestForm && (
                    <form className="request-form" onSubmit={handleRequest}>
    <h2>Request this Resource</h2>

    <p>
        <strong>Name:</strong> {currentUser?.name}
    </p>

    <p>
        <strong>Email:</strong> {currentUser?.email}
    </p>

    <p>
        Your request will be sent using your Google account.
    </p>

    <button type="submit">Send Request</button>

    <button
        type="button"
        className="cancel-btn"
        onClick={() => setShowRequestForm(false)}
    >
        Cancel
    </button>
</form>
                )}

            </div>

        </div>
    );
}

export default ResourceDetails;