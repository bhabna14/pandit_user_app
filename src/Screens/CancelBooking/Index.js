import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';
import DropDownPicker from 'react-native-dropdown-picker';
import { base_url } from '../../../App';

const Index = (props) => {

    const navigation = useNavigation();
    const [cancellationReason, setCancellationReason] = useState('');
    const [refundOption, setRefundOption] = useState(null);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([
        { label: 'Original Payment Method', value: 'original' },
    ]);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async () => {
        var access_token = await AsyncStorage.getItem('storeAccesstoken');

        if (!cancellationReason) {
            setErrorMessage('Please fill in the cancellation reason field');
            setTimeout(() => {
                setErrorMessage('');
            }, 4000);
            return;
        }
        if (!refundOption) {
            setErrorMessage('Please select your payment option');
            setTimeout(() => {
                setErrorMessage('');
            }, 4000);
            return;
        }

        try {
            const response = await fetch(base_url + `api/booking/cancel/${props.route.params.booking_id}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                },
                body: JSON.stringify({
                    cancel_reason: cancellationReason,
                    refund_method: refundOption,
                }),
            });

            const responseData = await response.json();
            if (response.ok) {
                console.log("Booking Canceled successfully", responseData);
                navigation.goBack();
            } else {
                console.error('Failed to Canceled Booking:', responseData.message);
            }

        } catch (error) {
            console.log("Failed to Canceled Booking:", error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerPart}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="chevron-left" color={'#fff'} size={30} />
                    <Text style={styles.backButtonText}>Cancel Booking</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.formContainer}>
                <Text style={styles.label}>Reason for Cancellation</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter reason for cancellation"
                    placeholderTextColor="#999"
                    value={cancellationReason}
                    onChangeText={setCancellationReason}
                    multiline
                />
                <Text style={styles.label}>Refund Payment Option</Text>
                <DropDownPicker
                    open={open}
                    value={refundOption}
                    items={items}
                    setOpen={setOpen}
                    setValue={setRefundOption}
                    setItems={setItems}
                    placeholder="Select Refund Option"
                    style={styles.dropdown}
                    containerStyle={styles.dropdownContainer}
                    dropDownContainerStyle={styles.dropDownContainerStyle}
                />
                {errorMessage ? (
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                ) : null}
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.formContainer}>
                <Text style={styles.noteText}>
                    <Text style={{ color: '#000', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.2 }}>Note: </Text>
                    Please be aware that canceling your booking may result in certain charges as per our cancellation policy.
                    Refunds will be processed to the selected payment method within 5-7 business days.
                </Text>
            </View>
        </SafeAreaView>
    );
};

export default Index;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    headerPart: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#53a20e',
        paddingVertical: 15,
        paddingHorizontal: 10,
        elevation: 5
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    backButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '500',
        marginLeft: 5
    },
    formContainer: {
        padding: 20,
        marginTop: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5
    },
    label: {
        fontSize: 16,
        marginBottom: 10,
        color: '#333',
        fontWeight: '600'
    },
    input: {
        height: 80,
        color: '#000',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 20,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        textAlignVertical: 'top'
    },
    dropdownContainer: {
        marginBottom: 20,
    },
    dropdown: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderRadius: 10
    },
    dropDownContainerStyle: {
        backgroundColor: '#fafafa',
        borderColor: '#ccc'
    },
    errorMessage: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
    submitButton: {
        backgroundColor: '#53a20e',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    noteText: {
        color: '#555',
        fontSize: 14,
        lineHeight: 20,
    }
});
