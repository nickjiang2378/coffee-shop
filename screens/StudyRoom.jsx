import React, { useState, useEffect } from "react";
import { Button, TextInput } from 'react-native-paper';
import { SafeAreaView, View } from "react-native"
import { styles } from "../AppStyles"

export default function StudyRoom({ navigation, route }) {
    const [name, setName] = useState("")

    useEffect(() => {
        let room = route.params?.assignedRoom
        console.log(room)
    }, [])

    return (
        <SafeAreaView style={{...styles.container, justifyContent: "center"}}>
            <View style={{backgroundColor: "white", padding: 20, height: "30%", justifyContent: "space-evenly", margin: 20}}>
                <TextInput 
                    label="Name"
                    placeholder="One will be provided if left blank"
                    value={name}
                    onChangeText={(text) => {setName(text)}}
                />
                <Button 
                    mode="contained"
                    onPress={() => {console.log("Moving to username screen")}}
                >
                    Join a study room
                </Button>
            </View>
            
        </SafeAreaView>
    );
}