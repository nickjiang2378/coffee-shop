import React, { useState, useEffect } from "react";
import { Button, TextInput } from 'react-native-paper';
import { SafeAreaView, View } from "react-native"
import { styles } from "../AppStyles"
import firebase from "firebase"
import "firebase/firestore"
import { data } from "browserslist";


export default function JoinRoom({ navigation }) {
    const [name, setName] = useState("")
    const [room, setRoom] = useState(null)

    const CAP_MEMBERS = 15

    function assignRoom(name) {
        firebase.firestore()
            .collection("rooms")
            .get()
            .then((querySnapshot) => {
                let assigned_room = null

                querySnapshot.forEach(doc => {
                    if (!assigned_room && doc.data().members.length < CAP_MEMBERS) {
                        console.log("Setting room")
                        assigned_room = doc.id
                        return
                    }
                })
                console.log("Assigned Room: " + assigned_room)
                navigation.navigate("StudyRoom", {"assignedRoom": assigned_room})
            })
            .catch((error) => {
                console.log(error)
            })
    } 

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
                    onPress={() => {console.log("Moving to username screen"); assignRoom(name)}}
                >
                    Join a study room
                </Button>
            </View>
            
        </SafeAreaView>
    );
}