import { useState } from "react";
import api from "./api";

function AddResource({ currentUser, onResourceAdded }) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        type: "",
        contact: ""
    });

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!currentUser) {
            alert("Please sign in with Google before sharing a resource.");
            return;
        }

        try {
            const response = await api.post(
                "/resources",
                {
                    ...formData,
                    owner: currentUser.name,
                    ownerId: currentUser.id,
                    ownerEmail: currentUser.email
                }
            );

            alert("Resource shared successfully!");

            onResourceAdded(response.data);

            setFormData({
                title: "",
                description: "",
                category: "",
                type: "",
                contact: ""
            });
        } catch (error) {
            console.error("Resource creation error:", error);
            console.error("Backend response:", error.response?.data);

            alert("Failed to share resource.");
        }
    };

    return (
        <div className="add-resource">
            <h2>Share a Resource</h2>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="title"
                    placeholder="Resource title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />

                <textarea
                    name="description"
                    placeholder="Describe the resource"
                    value={formData.description}
                    onChange={handleChange}
                    required
                />

                <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select category</option>
                    <option value="Notes">Notes</option>
                    <option value="Books">Books</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Other">Other</option>
                </select>

                <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                >
                    <option value="">Resource type</option>
                    <option value="Digital">Digital</option>
                    <option value="Physical">Physical</option>
                </select>

                <input
                    type="text"
                    name="contact"
                    placeholder="Contact information"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                />

                <button type="submit">
                    Share Resource
                </button>

            </form>
        </div>
    );
}

export default AddResource;
