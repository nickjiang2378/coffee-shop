import React, { useRef, useState, useEffect } from "react";
import { AppState, Text, View, SafeAreaView} from "react-native";
import { ProgressBar, Button, Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { styles } from "./AppStyles" 
import firebase from "firebase"
import JoinRoom from "./screens/JoinRoom"
import StudyRoom from "./screens/StudyRoom"
//import PhoneUsageBar from "./components/PhoneUsageBar";
//import RNIsDeviceRooted from 'react-native-is-device-locked';
import { Audio } from 'expo-av';
import TestScreen from "./screens/TestScreen";


const firebaseConfig = require("./keys.json")
if (firebase.apps.length == 0) {
  firebase.initializeApp(firebaseConfig);
}

const RootStack = createNativeStackNavigator()

// Check if device is rooted or jailbroken.
async function isDeviceRooted() {
  try {
      const result = await RNIsDeviceRooted.isDeviceRooted();
      console.log(result);
  } catch (e) {
      console.error(e);
  }
}
  
// Check if device has screenslock enabled.
async function isDeviceLocked() {
  try {
      const result = await RNIsDeviceRooted.isDeviceLocked();
      console.log(result);
  } catch (e) {
      console.error(e);
  }
}

export default function App() {
  let testing = false;
  //isDeviceLocked().then(() => {console.log("success")}).catch((e) => {console.log(e)})


  if (testing) {
    return TestScreen();
  } else {
  return (
    <PaperProvider>
      <NavigationContainer>
        <RootStack.Navigator>
          <RootStack.Screen 
            name="JoinRoom" 
            options={{title: "Join a Room"}}
            component={JoinRoom} 
          />
          <RootStack.Screen 
            name="StudyRoom" 
            options={{title: "Your Room"}}
            component={StudyRoom} 
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </PaperProvider> 

  );
  }
};



