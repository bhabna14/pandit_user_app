import React, { useEffect } from 'react';
import { View } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';

const Notification = () => {

    // Create a notification channel
    useEffect(() => {
        PushNotification.createChannel(
            {
                channelId: "default-channel-id", // The id of the channel
                channelName: "Default Channel", // The name of the channel
                channelDescription: "A default channel", // The description of the channel
                soundName: "default", // The sound to play for notifications
                importance: 4, // The importance level (4 is high importance)
                vibrate: true, // Whether the notification should vibrate
            },
            (created) => console.log(`createChannel returned '${created}'`) // Log if the channel was created or not
        );
    }, []);

    // Configure the push notification settings
    useEffect(() => {
        PushNotification.configure({
            onNotification: function (notification) {
                console.log("LOCAL NOTIFICATION ==>", notification);
            },
            popInitialNotification: true,
            requestPermissions: true,
        });
    }, []);

    // Handle foreground notifications
    useEffect(() => {
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
            // Display the notification using a local notification
            PushNotification.localNotification({
                channelId: "default-channel-id", // Use the same channelId created above
                title: remoteMessage.notification.title,
                message: remoteMessage.notification.body,
                playSound: true,
                soundName: 'default',
                importance: 'high',
                vibrate: true,
            });
        });

        return unsubscribe;
    }, []);

    // Handle background and quit state notifications
    useEffect(() => {
        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log(
                'Notification caused app to open from background state:',
                remoteMessage.notification,
            );
            // Handle the notification that opened the app
        });

        messaging().setBackgroundMessageHandler(async remoteMessage => {
            console.log('Message handled in the background!', remoteMessage);
            // Handle background message here
        });

        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    console.log(
                        'Notification caused app to open from quit state:',
                        remoteMessage.notification,
                    );
                    // Handle the notification that opened the app
                }
            });
    }, []);

    return (
        <View>
            {/* <Text>Notifications Initialized</Text> */}
        </View>
    );
};

export default Notification;
