import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Import the icon library
import { base_url } from '../../App';

const PromotionModal = () => {
    const [isModalVisible, setModalVisible] = useState(false);
    const [promotion, setPromotion] = useState(null);

    const getPromotionList = async () => {
        try {
            const response = await fetch(`${base_url}api/promonations`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            const responseData = await response.json();
            if (responseData.status === 200) {
                const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
                const todayPromotion = responseData.data.find(
                    promo => promo.date === today && promo.status === 'active'
                );
                if (todayPromotion) {
                    setPromotion(todayPromotion);
                    setModalVisible(true);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleGetStarted = () => {
        setModalVisible(false);
    };

    useEffect(() => {
        getPromotionList();
    }, []);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                        <Icon name="close" size={26} color="#333" />
                    </TouchableOpacity>
                    {promotion ? (
                        <>
                            <Text style={styles.title}>{promotion.promo_heading}</Text>
                            <Text style={styles.description}>{promotion.description}</Text>
                            <Image source={{ uri: promotion.promonation_image }} style={styles.image} />
                        </>
                    ) : (
                        <Text style={styles.description}>No promotions available for today.</Text>
                    )}
                    <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
                        <Text style={styles.buttonText}>{promotion?.button_title}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 25,
        right: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 20,
    },
    image: {
        width: 150,
        height: 150,
        marginBottom: 20,
        borderRadius: 10,
    },
    button: {
        backgroundColor: '#FF4081',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default PromotionModal;
