import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { base_url } from '../../../App';
import moment from 'moment';

export default function Index() {

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [allNotifications, setAllNotifications] = useState([]);
    const [spinner, setSpinner] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
            getAllNotifications();
            console.log("Refreshing Successful");
        }, 2000);
    }, []);

    const getAllNotifications = async () => {
        try {
            setSpinner(true);
            const response = await fetch(base_url + 'api/fcm-bulk-notifications', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            const responseData = await response.json();
            if (responseData.status === 200) {
                setAllNotifications(responseData.data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setSpinner(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            getAllNotifications();
        }
    }, [isFocused]);

    const formatNotificationTime = (createdAt) => {
        const now = moment();
        const notificationTime = moment(createdAt);

        const diffInMinutes = now.diff(notificationTime, 'minutes');
        const diffInHours = now.diff(notificationTime, 'hours');
        const diffInDays = now.diff(notificationTime, 'days');

        if (diffInMinutes < 1) {
            return 'Just now';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes} min ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours} hr ago`;
        } else if (diffInDays < 7) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        } else {
            return notificationTime.format('DD/MM/YYYY');
        }
    };

    const renderNotificationCard = ({ item }) => {

        const renderImageOrInitial = () => {
            if (item.image) {
                return <Image style={styles.image} source={{ uri: item.image }} />;
            }
            return (
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>
                        {item.title ? item.title.charAt(0).toUpperCase() : '?'}
                    </Text>
                </View>
            );
        };

        return (
            <View style={styles.card}>
                {renderImageOrInitial()}
                <View style={styles.textContainer}>
                    <Text style={styles.titleText}>{item.title}</Text>
                    <Text style={styles.descriptionText}>{item.description}</Text>
                    <View style={styles.timeContainer}>
                        <MaterialIcons name="access-time" size={16} color="#555" />
                        <Text style={styles.timeText}>{formatNotificationTime(item.created_at)}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="chevron-left" color="#333" size={30} />
                    <Text style={styles.headerTitle}>Notifications</Text>
                </TouchableOpacity>
            </View>
            {spinner ?
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#ffcb44" />
                    <Text style={styles.loaderText}>Loading...</Text>
                </View>
                :
                <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} showsVerticalScrollIndicator={false} style={{ flex: 1, marginBottom: 10 }}>
                    {allNotifications.length > 0 ?
                        <FlatList
                            data={allNotifications}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.listContainer}
                            renderItem={renderNotificationCard}
                            scrollEnabled={false}
                        />
                        :
                        <View style={{ flex: 1, alignItems: 'center', paddingTop: 300 }}>
                            <Text style={{ color: '#000', fontSize: 20, fontWeight: 'bold' }}>No Notification Found</Text>
                        </View>
                    }
                </ScrollView>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        elevation: 3,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 10,
        color: '#333',
    },
    listContainer: {
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 10,
    },
    placeholder: {
        width: 60,
        height: 60,
        borderRadius: 10,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    placeholderText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#666',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    titleText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    descriptionText: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    timeText: {
        fontSize: 12,
        color: '#999',
        marginLeft: 5,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 10,
        fontSize: 16,
        color: '#ffcb44',
    },
});
