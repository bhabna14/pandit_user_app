import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { base_url } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OTPVerifyModal = ({ visible, onClose, phone, orderId }) => {
    const [otp, setOtp] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleVerifyOTP = async () => {
        setIsLoading(true);
        try {
            if (otp === "" || otp.length != 6) {
                setErrorMessage('Please enter a valid OTP');
                setShowError(true);
                setTimeout(() => {
                    setShowError(false);
                }, 5000);
                setIsLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('orderId', orderId);
            formData.append('otp', otp);
            formData.append('phoneNumber', phone);

            const response = await fetch(base_url + 'api/verify-otpless', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                console.log('Login successfully', data);
                await AsyncStorage.setItem('storeAccesstoken', data.token);
                // navigation.navigate('Home');
                modalclose();
            } else {
                // Handle error response
                setErrorMessage(data.message || 'Failed to Login. Please try again.');
                setShowError(true);
                setTimeout(() => {
                    setShowError(false);
                }, 5000);
            }
        } catch (error) {
            setErrorMessage('Failed to Login. Please try again.--');
            setShowError(true);
            console.log("Error-=-=", error);
            setTimeout(() => {
                setShowError(false);
            }, 5000);
        } finally {
            setIsLoading(false);
        }
    }

    const modalclose = () => {
        setOtp('');
        onClose();
    }

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Verify OTP</Text>
                        <TouchableOpacity onPress={modalclose}>
                            <AntDesign name="close" color="#000" size={28} />
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter OTP"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                        placeholderTextColor="#ccc"
                    />
                    {showError && <Text style={styles.errorText}>{errorMessage}</Text>}
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#c80100" />
                    ) : (
                        <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyOTP}>
                            <Text style={styles.verifyButtonText}>Verify OTP</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    input: {
        width: '100%',
        height: 50,
        borderRadius: 25,
        paddingLeft: 15,
        marginBottom: 15,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#f2f2f2',
        borderColor: '#e0e0e0',
        borderWidth: 1,
    },
    verifyButton: {
        backgroundColor: 'red',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 25,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        fontSize: 14,
    },
});

export default OTPVerifyModal;
