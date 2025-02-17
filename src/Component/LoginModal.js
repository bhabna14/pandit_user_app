import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { base_url } from '../../App';
import OTPVerifyModal from '../Component/OtpVerifyModal';

const LoginModal = ({ visible, onClose, selectedItem, page }) => {
    const navigation = useNavigation();
    const [phone, setPhone] = useState('+91');
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [orderId, setOrderId] = useState('');

    const pressHandler = async () => {
        setIsLoading(true);
        try {
            const phoneRegex = /^\+91\d{10}$/;
            if (phone === "" || !phoneRegex.test(phone)) {
                setErrorMessage('Please enter a valid phone number');
                setShowError(true);
                setTimeout(() => setShowError(false), 5000);
                setIsLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('phone', phone);
            const response = await fetch(base_url + 'api/send-otp', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                console.log('OTP sent successfully', data);
                setOrderId(data.order_id);
                onClose();
                setOtpModalVisible(true);
            } else {
                setErrorMessage(data.message || 'Failed to send OTP. Please try again.');
                setShowError(true);
                setTimeout(() => setShowError(false), 5000);
            }
        } catch (error) {
            setErrorMessage('Failed to send OTP. Please try again.');
            setShowError(true);
            console.log("Error", error);
            setTimeout(() => setShowError(false), 5000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Modal
                transparent={true}
                visible={visible}
                animationType="slide"
                onRequestClose={onClose}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.header}>
                            <Text style={styles.headerText}>Login</Text>
                            <TouchableOpacity onPress={onClose}>
                                <AntDesign name="close" color="#000" size={28} />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            value={phone}
                            onChangeText={value => {
                                if (value.length >= 4 || value.startsWith('+91')) {
                                    setPhone(value);
                                } else {
                                    setPhone('+91');
                                }
                            }}
                            maxLength={13}
                            keyboardType="phone-pad"
                            autoCapitalize="none"
                            autoComplete='off'
                            placeholderTextColor="#ccc"
                        />
                        {showError && <Text style={styles.errorText}>{errorMessage}</Text>}
                        {isLoading ? (
                            <ActivityIndicator size="large" color="#c80100" />
                        ) : (
                            <TouchableOpacity style={styles.loginButton} onPress={pressHandler}>
                                <Text style={styles.loginButtonText}>Login</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>

            {/* OTP Verify Modal */}
            <OTPVerifyModal
                visible={otpModalVisible}
                onClose={() => setOtpModalVisible(false)}
                phone={phone}
                orderId={orderId}
                selectedItem={selectedItem}
                page={page}
            />
        </>
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
    loginButton: {
        backgroundColor: 'red',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 25,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 20
    },
    loginButtonText: {
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

export default LoginModal;
