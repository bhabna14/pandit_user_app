import { StyleSheet, Text, View, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import Notification from './src/Component/Notification';
import NetInfo from "@react-native-community/netinfo";

// SplashScreen
import SplashScreen from './src/Screens/SplashScreen/Index'

// No Internet Page
import NoInternet from './src/Screens/NoInternet/Index'

// Auth
import SelectLanguage from './src/Screens/Auth/SelectLanguage'
import OnBord from './src/Screens/Auth/OnBord'
import Login from './src/Screens/Auth/Login'
import OTP from './src/Screens/Auth/OTP'

// Pages
import Home from './src/Screens/Home/Index'
import SearchPage from './src/Screens/SearchPage/Index'
import AllPandit from './src/Screens/AllPandit/Index'
import PanditDetails from './src/Screens/PanditDetails/Index'
import AllPuja from './src/Screens/AllPuja/Index'
import PujaDetails from './src/Screens/PujaDetails/Index'
import Checkout from './src/Screens/Checkout/Index'
import Profile from './src/Screens/Profile/Index'
import PanditBookingHistory from './src/Screens/PanditBookingHistory/Index'
import BookingDetails from './src/Screens/BookingDetails/Index'
import AllAddress from './src/Screens/AllAddress/Index'
import BookingPending from './src/Screens/BookingPending/Index'
import CancelBooking from './src/Screens/CancelBooking/Index'
import RatingPuja from './src/Screens/RatingPuja/Index'
import Flower from './src/Screens/Flower/Index'
import FlowerCheckoutPage from './src/Screens/FlowerCheckoutPage/Index'
import PackageHistory from './src/Screens/PackageHistory/Index'
import PackageDetails from './src/Screens/PackageDetails/Index'
import Shop from './src/Screens/Shop/Index'
import YoutubeLive from './src/Screens/YoutubeLive/Index'
import Panji from './src/Screens/Panji/Index'
import TermsOfUse from './src/Screens/TermsOfUse/Index'
import PrivacyPolicy from './src/Screens/PrivacyPolicy/Index'
import AboutUs from './src/Screens/AboutUs/Index'
import ContactUs from './src/Screens/ContactUs/Index'
import Help from './src/Screens/Help/Index'

const Stack = createNativeStackNavigator()

// export const base_url = "https://panditapp.mandirparikrama.com/"
export const base_url = "https://pandit.33crores.com/"

const App = () => {

  const [showSplash, setShowSplash] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      setIsConnected(state.isConnected ?? false);
    });
    return () => {
      unsubscribe();
      // setTimeout(unsubscribe, 5000);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setShowSplash(false);
    }, 5000)
  }, []);

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
    // Handle background message here
  });

  return (
    <NavigationContainer>
      <Notification />
      <StatusBar backgroundColor="#c9170a" barStyle="light-content" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showSplash ? (<Stack.Screen name="SplashScreen" component={SplashScreen} options={{ presentation: 'modal', animationTypeForReplace: 'push', animation: 'slide_from_right' }} />) : null}
        {!isConnected ? (
          <Stack.Screen name="NoInternet" component={NoInternet} />
        ) : (
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="SearchPage" component={SearchPage} />
            <Stack.Screen name="SelectLanguage" component={SelectLanguage} />
            <Stack.Screen name="OnBord" component={OnBord} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="OTP" component={OTP} />
            <Stack.Screen name="AllPandit" component={AllPandit} />
            <Stack.Screen name="PanditDetails" component={PanditDetails} />
            <Stack.Screen name="AllPuja" component={AllPuja} />
            <Stack.Screen name="PujaDetails" component={PujaDetails} />
            <Stack.Screen name="Checkout" component={Checkout} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="PanditBookingHistory" component={PanditBookingHistory} />
            <Stack.Screen name="BookingDetails" component={BookingDetails} />
            <Stack.Screen name="AllAddress" component={AllAddress} />
            <Stack.Screen name="BookingPending" component={BookingPending} />
            <Stack.Screen name="CancelBooking" component={CancelBooking} />
            <Stack.Screen name="RatingPuja" component={RatingPuja} />
            <Stack.Screen name="Flower" component={Flower} />
            <Stack.Screen name='FlowerCheckoutPage' component={FlowerCheckoutPage} />
            <Stack.Screen name="PackageHistory" component={PackageHistory} />
            <Stack.Screen name="PackageDetails" component={PackageDetails} />
            <Stack.Screen name="Shop" component={Shop} />
            <Stack.Screen name="YoutubeLive" component={YoutubeLive} />
            <Stack.Screen name="Panji" component={Panji} />
            <Stack.Screen name="TermsOfUse" component={TermsOfUse} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
            <Stack.Screen name="AboutUs" component={AboutUs} />
            <Stack.Screen name="ContactUs" component={ContactUs} />
            <Stack.Screen name="Help" component={Help} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App

const styles = StyleSheet.create({})