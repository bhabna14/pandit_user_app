import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Linking, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import YoutubePlayer from 'react-native-youtube-iframe';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const HelpPage = () => {

    const navigation = useNavigation();

    const handleCallPress = () => {
        let phoneNumber = '';

        if (Platform.OS === 'android') {
            phoneNumber = 'tel:${+919776888887}';
        } else {
            phoneNumber = 'telprompt:${+919776888887}';
        }

        Linking.openURL(phoneNumber);
    };

    const handleWhatsAppPress = () => {
        const phoneNumber = '+919776888887';
        const url = `whatsapp://send?phone=${phoneNumber}&text=Hello! I need help with your service.`;

        Linking.openURL(url).catch(() => {
            alert('Make sure WhatsApp is installed on your device');
        });
    };

    const handleEmailPress = () => {
        Linking.openURL('mailto:contact@33crores.com');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.headerPart}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Feather name="chevron-left" color={'#555454'} size={30} />
                    <Text style={styles.headerTitle}>Back</Text>
                </TouchableOpacity>
            </View>

            {/* Help Content */}
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.helpText}>We're here to help you!</Text>
                {/* Phone Card */}
                <View style={styles.card}>
                    <View style={styles.cardContent}>
                        <MaterialIcons name="phone" size={30} color="#4CAF50" />
                        <View style={styles.cardText}>
                            <Text style={styles.cardTitle}>Call Us</Text>
                            <Text style={styles.cardInfo}>(+91) 97768 88887</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.cardButton} onPress={handleCallPress}>
                        <Text style={styles.buttonText}>Call Now</Text>
                    </TouchableOpacity>
                </View>

                {/* WhatsApp Chat Card */}
                <View style={styles.card}>
                    <View style={styles.cardContent}>
                        <FontAwesome name="whatsapp" size={30} color="#25D366" />
                        <View style={styles.cardText}>
                            <Text style={styles.cardTitle}>Chat with Us on WhatsApp</Text>
                            <Text style={styles.cardInfo}>(+91) 97768 88887</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.cardButton} onPress={handleWhatsAppPress}>
                        <Text style={styles.buttonText}>Chat Now</Text>
                    </TouchableOpacity>
                </View>

                {/* Email Card */}
                <View style={styles.card}>
                    <View style={styles.cardContent}>
                        <MaterialIcons name="email" size={30} color="#2196F3" />
                        <View style={styles.cardText}>
                            <Text style={styles.cardTitle}>Email Us</Text>
                            <Text style={styles.cardInfo}>contact@33crores.com</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.cardButton} onPress={handleEmailPress}>
                        <Text style={styles.buttonText}>Send Email</Text>
                    </TouchableOpacity>
                </View>

                {/* Help Video Section */}
                {/* <View style={styles.videoContainer}>
                    <Text style={styles.videoHeader}>Watch This Video for Detailed Assistance :</Text>
                    <YoutubePlayer
                        height={220}
                        play={false}
                        videoId={'JNExiUy2-RE'}
                    />
                </View> */}
            </ScrollView>
        </SafeAreaView>
    );
};

export default HelpPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    headerPart: {
        width: '100%',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 13,
        paddingHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    headerTitle: {
        color: '#000',
        fontSize: 17,
        fontWeight: '600',
        marginLeft: 3,
    },
    content: {
        padding: 20,
    },
    helpText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    cardText: {
        marginLeft: 15,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    cardInfo: {
        fontSize: 16,
        color: '#555',
    },
    cardButton: {
        backgroundColor: '#6200EE',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    videoContainer: {
        marginTop: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        paddingBottom: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    videoHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 15,
    },
});
