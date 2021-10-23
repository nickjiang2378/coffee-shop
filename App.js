import React, { useRef, useState, useEffect } from "react";
import { AppState, Text, View, SafeAreaView} from "react-native";
import { ProgressBar, Button, Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { styles } from "./AppStyles" 
import firebase from "firebase"
import JoinRoom from "./screens/JoinRoom"
import StudyRoom from "./screens/StudyRoom"

const firebaseConfig = require("./keys.json")
if (firebase.apps.length == 0) {
  firebase.initializeApp(firebaseConfig);
}

const RootStack = createNativeStackNavigator()

export default function App() {
  
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
};



