import React, { useState, useEffect } from "react";
import { Button, TextInput, IconButton, Provider as PaperProvider } from 'react-native-paper';
import { StatusBar, Text, SafeAreaView, View, FlatList } from "react-native"
import { styles } from "../AppStyles"
import AudioAdjuster from "../components/AudioAdjuster"
import { Audio } from 'expo-av';
import { setStatusBarNetworkActivityIndicatorVisible } from "expo-status-bar";

export default function TestScreen() {
  const [numPresent, setNumPresent] = useState(1);

  return (
    <PaperProvider>
        <SafeAreaView style={{...styles.container, marginLeft: 20, justifyContent: "center"}}>
            <Button onPress={() => {setNumPresent(numPresent + 1)}}>Increase NumPresent</Button>
            <AudioAdjuster numPresent={numPresent} />

        </SafeAreaView>
    </PaperProvider>
  );
}