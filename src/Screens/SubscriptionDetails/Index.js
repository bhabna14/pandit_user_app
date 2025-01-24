import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { base_url } from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';

const Index = (props) => {

  const navigation = useNavigation();
  const [packageDetails, setPackageDetails] = useState(null);

  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));

  useEffect(() => {
    if (endDate < startDate) {
      setEndDate(startDate);
    }
  }, [startDate]);

  const [isResumeModalVisible, setResumeModalVisible] = useState(false);
  const openResumeModal = () => setResumeModalVisible(true);
  const closeResumeModal = () => setResumeModalVisible(false);

  const [isResumeDateModalOpen, setIsResumeDateModalOpen] = useState(false);
  const openResumeDatePicker = () => { setIsResumeDateModalOpen(true) };
  const closeResumeDatePicker = () => { setIsResumeDateModalOpen(false) };
  const [resumeDate, setResumeDate] = useState(null);

  useEffect(() => {
    if (pause_start_date) {
      const today = new Date();
      const pauseStartDate = new Date(pause_start_date);
      setResumeDate(today > pauseStartDate ? new Date(today.setDate(today.getDate() + 1)) : pauseStartDate);
    }
  }, [pause_start_date]);

  const [pause_start_date, setPause_start_date] = useState(null);
  const [pause_end_date, setPause_end_date] = useState(null);

  const handleResumeButton = () => {
    setPause_start_date(props.route.params.subscription.pause_start_date);
    setPause_end_date(props.route.params.subscription.pause_end_date);
    openResumeModal();
  };

  const handleResumDatePress = (day) => {
    setResumeDate(new Date(day.dateString));
    closeResumeDatePicker();
  };

  const submitResumeDates = async () => {
    // console.log("object", selectedResumePackageId);
    // return;
    const access_token = await AsyncStorage.getItem('storeAccesstoken');
    try {
      const response = await fetch(`${base_url}api/subscription/resume/${props.route.params.order_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          resume_date: moment(resumeDate).format('YYYY-MM-DD'),
        }),
      });

      const data = await response.json();
      if (response.status === 200) {
        closeResumeModal();
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const [isStartDateModalOpen, setIsStartDateModalOpen] = useState(false);
  const openStartDatePicker = () => { setIsStartDateModalOpen(true) };
  const closeStartDatePicker = () => { setIsStartDateModalOpen(false) };
  const [isEndDateModalOpen, setIsEndDateModalOpen] = useState(false);
  const openEndDatePicker = () => { setIsEndDateModalOpen(true) };
  const closeEndDatePicker = () => { setIsEndDateModalOpen(false) };

  const submitPauseDates = async () => {
    const access_token = await AsyncStorage.getItem('storeAccesstoken');
    try {
      const response = await fetch(`${base_url}api/subscription/pause/${packageDetails.order_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          pause_start_date: moment(startDate).format('YYYY-MM-DD'),
          pause_end_date: moment(endDate).format('YYYY-MM-DD'),
        }),
      });

      const data = await response.json();
      if (response.status === 200) {
        // Alert.alert('Success', data.message);
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const handleStartDatePress = (day) => {
    setStartDate(new Date(day.dateString));
    closeStartDatePicker();
  };

  const handleEndDatePress = (day) => {
    setEndDate(new Date(day.dateString));
    closeEndDatePicker();
  };

  useEffect(() => {
    setPackageDetails(props.route.params);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerPart}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Feather name="chevron-left" color={'#555454'} size={30} />
          <Text style={styles.topHeaderText}>Subscription Details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        {packageDetails?.flower_products?.product_image_url && (
          <Image source={{ uri: packageDetails?.flower_products?.product_image_url }} style={styles.image} />
        )}
        <Text style={{ color: '#000', fontFamily: 'Montserrat-Bold', fontSize: 17 }}>Name: {packageDetails?.flower_products?.name}</Text>
        <Text style={styles.text}>Description : {packageDetails?.flower_products?.description}</Text>
      </View>
      <View style={styles.card}>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fae6e6', marginVertical: 2, padding: 5, borderRadius: 5 }}>
          <View style={{ width: '35%' }}>
            <Text style={{ color: '#000', fontSize: 14, fontWeight: 'bold' }}>Order Id:</Text>
          </View>
          <View style={{ width: '65%' }}>
            <Text style={{ color: '#000', fontSize: 14 }}>{packageDetails?.order_id}</Text>
          </View>
        </View>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fae6e6', marginVertical: 2, padding: 5, borderRadius: 5 }}>
          <View style={{ width: '35%' }}>
            <Text style={{ color: '#000', fontSize: 14, fontWeight: 'bold' }}>Start Date:</Text>
          </View>
          <View style={{ width: '65%' }}>
            <Text style={{ color: '#000', fontSize: 14 }}>{moment(packageDetails?.start_date).format('DD-MM-YYYY')}</Text>
          </View>
        </View>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fae6e6', marginVertical: 2, padding: 5, borderRadius: 5 }}>
          <View style={{ width: '35%' }}>
            <Text style={{ color: '#000', fontSize: 14, fontWeight: 'bold' }}>End Date:</Text>
          </View>
          <View style={{ width: '65%' }}>
            <Text style={{ color: '#000', fontFamily: packageDetails?.new_date ? null : 'Montserrat-Bold', textDecorationLine: packageDetails?.new_date ? 'line-through' : null }}>{moment(packageDetails?.end_date).format('DD-MM-YYYY')}</Text>
          </View>
        </View>
        {packageDetails?.new_date &&
          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fae6e6', marginVertical: 2, padding: 5, borderRadius: 5 }}>
            <View style={{ width: '35%' }}>
              <Text style={{ color: '#000', fontSize: 14, fontWeight: 'bold' }}>New End Date:</Text>
            </View>
            <View style={{ width: '65%' }}>
              <Text style={{ color: '#000', fontSize: 14 }}>{moment(packageDetails?.new_date).format('DD-MM-YYYY')}</Text>
            </View>
          </View>
        }
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fae6e6', marginVertical: 2, padding: 5, borderRadius: 5 }}>
          <View style={{ width: '35%' }}>
            <Text style={{ color: '#000', fontSize: 14, fontWeight: 'bold' }}>Subscription Status:</Text>
          </View>
          <View style={{ width: '65%' }}>
            <Text style={{ color: '#000', fontSize: 14 }}>{packageDetails?.status}</Text>
          </View>
        </View>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fae6e6', marginVertical: 2, padding: 5, borderRadius: 5 }}>
          <View style={{ width: '35%' }}>
            <Text style={styles.price}>Price:</Text>
          </View>
          <View style={{ width: '65%' }}>
            <Text style={styles.price}>{packageDetails?.order?.total_price}</Text>
          </View>
        </View>
      </View>
      {packageDetails?.order?.address &&
        <View style={styles.card}>
          <Text style={styles.subtitle}>Address</Text>
          <Text style={styles.text}>{packageDetails?.order?.address?.address_type}, {packageDetails?.order?.address?.place_category}</Text>
          <Text style={styles.text}>{packageDetails?.order?.address?.apartment_flat_plot}, {packageDetails?.order?.address?.landmark}</Text>
          <Text style={styles.text}>{packageDetails?.order?.address?.locality_details?.locality_name}, {packageDetails?.order?.address?.city}</Text>
          <Text style={styles.text}>{packageDetails?.order?.address?.state}, {packageDetails?.order?.address?.pincode}</Text>
          <Text style={styles.text}>{packageDetails?.order?.address?.country}</Text>
        </View>
      }
      {moment(packageDetails?.start_date).format('YYYY-MM-DD') <= moment().format('YYYY-MM-DD') &&
        <View style={styles.card}>
          {packageDetails?.status !== "paused" ?
            <View>
              <Text style={styles.label}>Pause Start Time</Text>
              <TouchableOpacity onPress={openStartDatePicker}>
                <TextInput
                  style={styles.input}
                  value={startDate.toLocaleDateString()}
                  editable={false}
                />
              </TouchableOpacity>

              <Text style={styles.label}>Pause End Time</Text>
              <TouchableOpacity onPress={openEndDatePicker}>
                <TextInput
                  style={styles.input}
                  value={endDate.toLocaleDateString()}
                  editable={false}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.dateButton} onPress={submitPauseDates}>
                <Text style={styles.dateText}>Submit</Text>
              </TouchableOpacity>
            </View>
            :
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#c9170a', fontSize: 17, fontFamily: 'Montserrat-ExtraBold' }}>Your subscription is paused from {moment(packageDetails?.pause_start_date).format('DD-MM-YYYY')} to {moment(packageDetails?.pause_end_date).format('DD-MM-YYYY')}</Text>
              <TouchableOpacity onPress={handleResumeButton}>
                <LinearGradient colors={['#c9170a', '#f0837f']} style={styles.submitButton}>
                  <Text style={styles.submitText}>Resume</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          }
        </View>
      }

      <Modal
        animationType="slide"
        transparent={true}
        visible={isStartDateModalOpen}
        onRequestClose={closeStartDatePicker}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ width: '90%', padding: 20, backgroundColor: 'white', borderRadius: 10, elevation: 5 }}>
            <Calendar
              onDayPress={handleStartDatePress}
              markedDates={{
                [moment(startDate).format('YYYY-MM-DD')]: {
                  selected: true,
                  marked: true,
                  selectedColor: 'blue'
                }
              }}
              minDate={moment().add(1, 'days').format('YYYY-MM-DD')}
            />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isEndDateModalOpen}
        onRequestClose={closeEndDatePicker}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ width: '90%', padding: 20, backgroundColor: 'white', borderRadius: 10, elevation: 5 }}>
            <Calendar
              onDayPress={handleEndDatePress}
              markedDates={{
                [moment(endDate).format('YYYY-MM-DD')]: {
                  selected: true,
                  marked: true,
                  selectedColor: 'blue'
                }
              }}
              minDate={moment().add(1, 'days').format('YYYY-MM-DD')}
            />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isResumeModalVisible}
        onRequestClose={closeResumeModal}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ width: '90%', backgroundColor: '#fff', padding: 20, borderRadius: 10 }}>
            <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={closeResumeModal}>
              <Feather name="x" color={'#000'} size={30} />
            </TouchableOpacity>
            <Text style={styles.label}>Resume Date</Text>
            <TouchableOpacity onPress={openResumeDatePicker}>
              <TextInput
                style={styles.input}
                value={resumeDate ? resumeDate.toLocaleDateString() : 'Select a date'}
                editable={false}
              />
            </TouchableOpacity>
            {resumeDate === null && <Text style={{ color: 'red' }}>Please select a resume date</Text>}
            <TouchableOpacity style={styles.dateButton} onPress={submitResumeDates}>
              <Text style={styles.dateText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isResumeDateModalOpen}
        onRequestClose={closeResumeDatePicker}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ width: '90%', padding: 20, backgroundColor: 'white', borderRadius: 10, elevation: 5 }}>
            <Calendar
              onDayPress={handleResumDatePress}
              markedDates={{
                [moment(resumeDate).format('YYYY-MM-DD')]: {
                  selected: true,
                  marked: true,
                  selectedColor: 'blue'
                }
              }}
              minDate={moment(pause_start_date).format('YYYY-MM-DD')}
              maxDate={moment(pause_end_date).format('YYYY-MM-DD')}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  headerPart: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 13,
    paddingHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 13,
    elevation: 5,
  },
  topHeaderText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 3,
    marginLeft: 5,
  },
  card: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    marginBottom: 5,
    elevation: 3,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#495057',
  },
  text: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 5,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    // marginTop: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  dateButton: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#c9170a',
    borderRadius: 5,
    marginVertical: 5,
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#757473',
    marginBottom: 10,
    color: '#333',
  },
  submitButton: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 3,
    marginVertical: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
