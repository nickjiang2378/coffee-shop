import React, { useState, useEffect } from "react";
import { Button, TextInput, Title, Text } from 'react-native-paper';
import { StatusBar, SafeAreaView, View, FlatList } from "react-native"
import Person from "../components/Person"
import PhoneUsageBar from "../components/PhoneUsageBar";
import AudioAdjuster from "../components/AudioAdjuster";
import { styles } from "../AppStyles"
import firebase from "firebase"
import "firebase/firestore"

export default function StudyRoom({ navigation, route }) {
    const [name, setName] = useState("")
    const [room, setRoom] = useState(null)
    const [expoPushToken, setExpoPushToken] = useState();
    const [roomData, setRoomData] = useState();
    const [initializing, setInitializing] = useState(true)

    useEffect(() => {
        let room = route.params?.assignedRoom
        let name = route.params?.name
        let token = route.params?.expoPushToken
        console.log(room, name, token)
        if (room && name && token) {
            setRoom(room)
            setName(name)
            setExpoPushToken(token)
        }
    }, [])

    useEffect(() => {
        if (room && name) {
            console.log("Current Room: " + room)
            console.log("Current Name: " + name)
            console.log("Finding room data")
            const db = firebase.firestore();
            const unsubscribe = db
            .collection("rooms")
            .doc(room)
            .onSnapshot((doc) => {
                console.log("Room Data updated")
                let data = doc.data()
                let roomAttributes = Object();
                data.members.forEach((member) => {
                    roomAttributes[member] = {
                        name: member,
                        progress: data.progress[member]
                    }
                })
                
                setRoomData(roomAttributes)
            });
            return unsubscribe;
        
        }
    }, [room, name])

    useEffect(() => {
        if (roomData && name && room && Object.keys(roomData).length > 0 && initializing) {
            //console.log("Room data collected below (sorted):")
            //console.log(Object.values(roomData).sort((a,b) => {return a.progress - b.progress}))
            
            setInitializing(false)
        }
            
    }, [room, name, roomData])

    useEffect(() => {
        if (!initializing && roomData) {
            console.log("Altering navigation control")
            //console.log(roomData)
            navigation.setOptions({
                headerLeft: () => (<AudioAdjuster numPresent={Object.keys(roomData).length} />),
                headerRight: () => (
                    <Button color="tomato" onPress={() => removeMember()}>Leave</Button>
                )
            })  
        }
        if (roomData && roomData[name] && roomData[name].progress <= 0) {
            removeMember()
        }
    }, [initializing, roomData])

    function renderItem({ item }) {

        return (
            <Person name={item.name} progress_ratio={item.progress} />
        );
    }

    async function removeMember() {
        // Construct object excluding name
        //console.log(roomData)
        //console.log(name)
        //console.log(room)
        let remainingMembers = Object()
        for (let person in roomData) {
            if (person != name) {
                //console.log(person)
                remainingMembers[person] = roomData[person].progress
            }
        }
        console.log(remainingMembers)
        const connection = firebase.firestore().collection("rooms")
        if (room && name) {
            await connection.doc(room)
                    .update({
                        "members": firebase.firestore.FieldValue.arrayRemove(name),
                        "progress": remainingMembers
                    })
                    .then(() => {
                        console.log('Finished removing ' + name + ' from ' + room)
                    })
                    .catch((error) => {
                        console.log(error)
                    }) 

            navigation.navigate("JoinRoom")
        }
        else {
            console.log("Error: Room is " + room)
            console.log("Error: Name is " + name)
        }
    }


    if (initializing) {
        return <Text></Text>
    } else {
        return (
            <SafeAreaView style={{...styles.container, marginTop: StatusBar.currentHeight || 0}}>
                <View style={{margin: 20}}>
                    <FlatList 
                        data={Object.values(roomData).sort((a,b) => {return a.progress - b.progress})}
                        renderItem={renderItem}
                        style={{height: "75%"}}
                        keyExtractor={(item) => item.name}
                    />
                    <Title style={{marginTop: 20}}>Personal Bar</Title>
                    <PhoneUsageBar  expoPushToken={expoPushToken} 
                                    roomData={roomData} 
                                    name={name} 
                                    room={room} 
                    />
                </View>
                
                
            </SafeAreaView>
        );
    }

}