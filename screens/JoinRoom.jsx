import React, { useState, useEffect, useRef } from "react";
import { Button, TextInput } from 'react-native-paper';
import { SafeAreaView, View, Text } from "react-native"
import { styles } from "../AppStyles"
import firebase from "firebase"
import "firebase/firestore"
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, sendPushNotification } from "../helpers/notifications.js"


export default function JoinRoom({ navigation }) {
    const [name, setName] = useState("")
    const [room, setRoom] = useState(null)
    const [isLoading, setLoading] = useState(false);
    const [expoPushToken, setExpoPushToken] = useState('');
    const CAP_MEMBERS = 15

    async function assignRoom(name) {
        if (!name) {
            console.log("Enter a name")
            return
        }
        setLoading(true)
        let assigned_room = null, room_data = null;
        let connection = firebase.firestore().collection("rooms")
        let val = await connection
            .get()
            .then((querySnapshot) => {

                querySnapshot.forEach(doc => {
                    if (!assigned_room && doc.data().members.length < CAP_MEMBERS) {
                        console.log("Setting room")
                        assigned_room = doc.id
                        room_data = doc.data()
                        return
                    }
                })
                console.log("Assigned Room: " + assigned_room)
            })
            .catch((error) => {
                console.log(error)
            })
        await connection.doc(assigned_room)
                        .update({
                            "members": firebase.firestore.FieldValue.arrayUnion(name),
                            "progress": {...room_data.progress, [name]: 1}
                        })
                        .then(() => {
                            console.log('Finished adding ' + name + ' to study room')
                        })
                        .catch((error) => {
                            console.log(error)
                        })
        console.log("Navigating to StudyRoom")
        setLoading(false)
        navigation.navigate("StudyRoom", {"assignedRoom": assigned_room, "name": name, "expoPushToken": expoPushToken})

    } 

    useEffect(() => {
        registerForPushNotificationsAsync()
            .then(token => setExpoPushToken(token))
            .catch((e) => {console.log(e)});
    
        // This listener is fired whenever a notification is received while the app is foregrounded
        /*notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
            
        });*/

        return () => {
            //Notifications.removeNotificationSubscription(notificationListener.current);
        };
      }, []);

    return (
        <SafeAreaView style={{...styles.container, justifyContent: "center"}}>
            <View style={{
                    backgroundColor: "white", 
                    padding: 20, 
                    height: "30%", 
                    justifyContent: "space-evenly", 
                    margin: 20
            }}>
                <TextInput 
                    label="Name"
                    placeholder="One will be provided if left blank"
                    value={name}
                    onChangeText={(text) => {setName(text)}}
                />
                <Button 
                    mode="contained"
                    onPress={() => {assignRoom(name)}}
                    loading={isLoading}
                >
                    Join a study room
                </Button>
            </View>
            
        </SafeAreaView>
    );
}

// https://docs.expo.dev/push-notifications/overview/