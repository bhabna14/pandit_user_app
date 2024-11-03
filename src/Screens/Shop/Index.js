import { SafeAreaView, StyleSheet, Text, View, TextInput, TouchableOpacity, TouchableHighlight, Dimensions, Image, Modal, Alert, ScrollView, FlatList, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { WebView } from 'react-native-webview';

const Index = (props) => {
    return (
        <SafeAreaView style={{ flex: 1, flexDirection: 'column' }}>
            <View style={{ flex: 1 }}>
                <WebView source={{ uri: 'https://poojastore.33crores.com/' }} style={{ flex: 1 }} />
            </View>
        </SafeAreaView>
    )
}

export default Index

const styles = StyleSheet.create({})