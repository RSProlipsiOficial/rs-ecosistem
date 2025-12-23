export const notificationService = {
    /**
     * Checks if notifications are supported and permission is granted.
     */
    isSupportedAndEnabled(): boolean {
        return 'Notification' in window && Notification.permission === 'granted';
    },

    /**
     * Requests permission from the user to show notifications.
     */
    async requestPermission(): Promise<NotificationPermission> {
        if (!('Notification' in window)) {
            console.error("This browser does not support desktop notification");
            return 'denied';
        }
        return await Notification.requestPermission();
    },

    /**
     * Simulates sending a push notification by showing it directly via the service worker registration.
     * In a real application, this would involve sending a request to a backend server.
     * @param title The title of the notification.
     * @param body The body text of the notification.
     * @returns {Promise<boolean>} A promise that resolves to true if the notification was sent, false otherwise.
     */
    async sendNotification(title: string, body: string): Promise<boolean> {
        if ('serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
            try {
                // Use the service worker to display the notification
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification(title, { body });
                console.log("Notification shown successfully.");
                return true;
            } catch (error) {
                console.error('Error showing notification:', error);
                return false;
            }
        } else {
            console.log("Push notifications not supported or permission not granted.");
            return false;
        }
    }
};
