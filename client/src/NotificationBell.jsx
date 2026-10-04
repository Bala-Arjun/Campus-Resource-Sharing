import { useEffect, useState } from "react";
import axios from "axios";

function NotificationBell({ currentUser }) {
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const fetchNotifications = async () => {
        if (!currentUser) {
            setNotifications([]);
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:5000/api/notifications/${currentUser.id}`
            );

            setNotifications(response.data);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();

        const interval = setInterval(() => {
            fetchNotifications();
        }, 5000);

        return () => clearInterval(interval);
    }, [currentUser]);

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;

    const markAsRead = async (id) => {
        try {
            await axios.patch(
                `http://localhost:5000/api/notifications/${id}/read`
            );

            setNotifications((previousNotifications) =>
                previousNotifications.map((notification) =>
                    notification._id === id
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.patch(
                `http://localhost:5000/api/notifications/user/${currentUser.id}/read-all`
            );

            setNotifications((previousNotifications) =>
                previousNotifications.map((notification) => ({
                    ...notification,
                    isRead: true
                }))
            );
        } catch (error) {
            console.error("Failed to mark notifications as read:", error);
        }
    };

    if (!currentUser) {
        return null;
    }

    return (
        <div className="notification-container">
            <button
                className="notification-btn"
                onClick={() =>
                    setShowNotifications(!showNotifications)
                }
            >
                🔔

                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {showNotifications && (
                <div className="notification-dropdown">

                    <div className="notification-header">
                        <h3>Notifications</h3>

                        {unreadCount > 0 && (
                            <button
                                className="mark-read-btn"
                                onClick={markAllAsRead}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <div className="no-notifications">
                            <p>No notifications yet.</p>
                        </div>
                    ) : (
                        <div className="notification-list">

                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`notification-item ${
                                        !notification.isRead
                                            ? "unread"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        !notification.isRead &&
                                        markAsRead(notification._id)
                                    }
                                >
                                    <div className="notification-dot">
                                        {!notification.isRead && "●"}
                                    </div>

                                    <div className="notification-content">
                                        <p>{notification.message}</p>

                                        <small>
                                            {new Date(
                                                notification.createdAt
                                            ).toLocaleString()}
                                        </small>
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}

                </div>
            )}
        </div>
    );
}

export default NotificationBell;