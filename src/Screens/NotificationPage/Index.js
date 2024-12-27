import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, SafeAreaView, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function Index() {

    const navigation = useNavigation();
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const DATA = [
        {
            id: 1,
            image:
                'https://st3.depositphotos.com/1006542/12890/i/450/depositphotos_128904720-stock-photo-portrait-of-horror-zombie-woman.jpg',

            comment:
                'Your Suterday Daily Rundown .Saying bye',
            time: 'just now'
        },
        {
            id: 2,
            image:
                'https://st3.depositphotos.com/1006542/12890/i/450/depositphotos_128904720-stock-photo-portrait-of-horror-zombie-woman.jpg',

            comment:
                'Your Suterday Daily Rundown .Saying bye to an office bestie; Easing into a new career; ',
            time: 'just now'
        },
        {
            id: 3,
            image:
                'https://st3.depositphotos.com/1006542/12890/i/450/depositphotos_128904720-stock-photo-portrait-of-horror-zombie-woman.jpg',

            comment:
                'Your Suterday Daily Rundown .Saying bye to an office bestie; Easing into a new career; and other top news for you;and other top news for you ;and other top news for you',
            time: '1 min'
        },
        {
            id: 4,
            image:
                'https://st3.depositphotos.com/1006542/12890/i/450/depositphotos_128904720-stock-photo-portrait-of-horror-zombie-woman.jpg',

            comment:
                'Your Suterday Daily Rundown .Saying bye to an office bestie; Easing into a new career; and other top news for you',
            time: '6 min'
        },
        {
            id: 5,
            image:
                'https://st3.depositphotos.com/1006542/12890/i/450/depositphotos_128904720-stock-photo-portrait-of-horror-zombie-woman.jpg',

            comment:
                'Your Suterday Daily Rundown .Saying bye to an office bestie; Easing into a new career; and other top news for you',
            time: '9 min'
        },
        {
            id: 6,
            image:
                'https://st3.depositphotos.com/1006542/12890/i/450/depositphotos_128904720-stock-photo-portrait-of-horror-zombie-woman.jpg',

            comment:
                'Your Suterday Daily Rundown .Saying bye to an office bestie; Easing into a new career; and other top news for you',
            time: '14 min'
        },
        {
            id: 7,
            image:
                'https://st3.depositphotos.com/1006542/12890/i/450/depositphotos_128904720-stock-photo-portrait-of-horror-zombie-woman.jpg',

            comment:
                'Your Suterday Daily Rundown .Saying bye to an office bestie; Easing into a new career; and other top news for you',
            time: '18 min'
        },
        {
            id: 8,
            image:
                'https://st3.depositphotos.com/1006542/12890/i/450/depositphotos_128904720-stock-photo-portrait-of-horror-zombie-woman.jpg',

            comment:
                'Your Suterday Daily Rundown .Saying bye to an office bestie; Easing into a new career; and other top news for you',
            time: '23 min'
        },
        {
            id: 9,
            image:
                'https://st3.depositphotos.com/1006542/12890/i/450/depositphotos_128904720-stock-photo-portrait-of-horror-zombie-woman.jpg',

            comment:
                'Your Suterday Daily Rundown .Saying bye to an office bestie; Easing into a new career; and other top news for you',
            time: '29 min'
        },
        {
            id: 10,
            image:
                'https://st3.depositphotos.com/1006542/12890/i/450/depositphotos_128904720-stock-photo-portrait-of-horror-zombie-woman.jpg',

            comment:
                'Your Suterday Daily Rundown .Saying bye to an office bestie; Easing into a new career; and other top news for you',
            time: '32 min'
        },
        {
            id: 11,
            image:
                'https://st3.depositphotos.com/1006542/12890/i/450/depositphotos_128904720-stock-photo-portrait-of-horror-zombie-woman.jpg',

            comment:
                'Your Suterday Daily Rundown .Saying bye to an office bestie; Easing into a new career; and other top news for you',
            time: '43 min'
        },
        {
            id: 12,
            image:
                'https://st3.depositphotos.com/1006542/12890/i/450/depositphotos_128904720-stock-photo-portrait-of-horror-zombie-woman.jpg',

            comment:
                'Your Suterday Daily Rundown .Saying bye to an office bestie; Easing into a new career; and other top news for you',
            time: '45 min'
        },
        {
            id: 13,
            image:
                'https://st3.depositphotos.com/1006542/12890/i/450/depositphotos_128904720-stock-photo-portrait-of-horror-zombie-woman.jpg',

            comment:
                'Your Suterday Daily Rundown .Saying bye to an office bestie; Easing into a new career; and other top news for you',
            time: '49 min'
        },
        {
            id: 14,
            image:
                'https://st3.depositphotos.com/1006542/12890/i/450/depositphotos_128904720-stock-photo-portrait-of-horror-zombie-woman.jpg',

            comment:
                'Your Suterday Daily Rundown .Saying bye to an office bestie; Easing into a new career; and other top news for you',
            time: '51 min'
        },
        {
            id: 15,
            image:
                'https://st3.depositphotos.com/1006542/12890/i/450/depositphotos_128904720-stock-photo-portrait-of-horror-zombie-woman.jpg',

            comment:
                'Your Suterday Daily Rundown .Saying bye to an office bestie; Easing into a new career; and other top news for you',
            time: '1 hr'
        },
    ];

    const handleMorePress = (item) => {
        setSelectedItem(item);
        setModalVisible(true);
    };

    const handleDelete = () => {
        setModalVisible(false);
        Alert.alert('Delete', 'Notification deleted successfully!');
        // Add delete logic here
    };

    const handleVisit = () => {
        setModalVisible(false);
        Alert.alert('Visit', `Visiting notification: ${selectedItem?.comment}`);
        // Add navigation or visit logic here
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}>
                    <Feather name="chevron-left" color="#333" size={30} />
                    <Text style={styles.headerTitle}>Notifications</Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <FlatList
                    data={DATA}
                    scrollEnabled={false}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Image style={styles.image} source={{ uri: item.image }} />
                            <View style={styles.textContainer}>
                                <Text style={styles.commentText}>{item.comment}</Text>
                                <View style={styles.timeContainer}>
                                    <MaterialIcons name="access-time" size={16} color="#555" />
                                    <Text style={styles.timeText}>{item.time}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => handleMorePress(item)} style={styles.moreButton}>
                                <Feather name="more-vertical" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </ScrollView>
            {/* Modal for options */}
            <Modal
                transparent
                visible={isModalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.modalButton} onPress={handleDelete}>
                            <Text style={styles.modalButtonText}>Delete</Text>
                        </TouchableOpacity>
                        <View style={{ height: 1.5, width: '100%', backgroundColor: '#ddd' }} />
                        <TouchableOpacity style={styles.modalButton} onPress={handleVisit}>
                            <Text style={styles.modalButtonText}>Visit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
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
        paddingTop: 10,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    textContainer: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },
    commentText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    timeText: {
        fontSize: 12,
        color: '#777',
        marginLeft: 5,
    },
    moreButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        width: 200,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        width: '100%',
        alignItems: 'center',
        // borderBottomWidth: 1,
        // borderBottomColor: '#ddd',
    },
    modalButtonText: {
        fontSize: 16,
        color: '#007bff',
        fontWeight: 'bold',
    },
});