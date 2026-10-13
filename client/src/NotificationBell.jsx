import { useEffect, useState } from "react";
import api from "./api";
import { disablePushNotifications, enablePushNotifications, getPushSubscription } from "./pushNotifications";

function NotificationBell({ currentUser }) {
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [pushEnabled, setPushEnabled] = useState(false);
    const [pushBusy, setPushBusy] = useState(false);
    const [pushMessage, setPushMessage] = useState("");

    const fetchNotifications = async () => {
        if (!currentUser) {
            setNotifications([]);
            return;
        }

        try {
            const response = await api.get(`/notifications/${currentUser.id}`);

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

    useEffect(() => {
        let active = true;
        getPushSubscription().then((subscription) => {
            if (active) setPushEnabled(Boolean(subscription));
        }).catch(() => {});
        return () => { active = false; };
    }, [currentUser]);

    const togglePush = async () => {
        setPushBusy(true);
        setPushMessage("");
        try {
            if (pushEnabled) {
                await disablePushNotifications(currentUser.id);
                setPushEnabled(false);
                setPushMessage("Push reminders are off on this device.");
            } else {
                await enablePushNotifications(currentUser.id);
                setPushEnabled(true);
                setPushMessage("Push reminders are enabled on this device.");
            }
        } catch (error) {
            setPushMessage(error.response?.data?.message || error.message || "Could not update push settings.");
        } finally {
            setPushBusy(false);
        }
    };

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);

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
            await api.patch(`/notifications/user/${currentUser.id}/read-all`);

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

                    <div className="push-settings">
                        <div>
                            <strong>CampusShare push alerts</strong>
                            <small>Get request and borrow alerts when this site is closed.</small>
                        </div>
                        <button onClick={togglePush} disabled={pushBusy}>
                            {pushBusy ? "Please wait…" : pushEnabled ? "Turn off" : "Enable push"}
                        </button>
                        {pushMessage && <p role="status">{pushMessage}</p>}
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
