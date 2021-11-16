import React, { useState, useEffect } from "react";
import { Button, TextInput, IconButton } from 'react-native-paper';
import { StatusBar, Text, SafeAreaView, View, FlatList } from "react-native"
import { styles } from "../AppStyles"
import { Audio } from 'expo-av';

const MAX_MEMBERS = 15;
export default function AudioAdjuster({ numPresent }) {
    const [icon, setIcon] = useState("volume-off")
    const [sound, setSound] = useState();
    const [volume, setVolume] = useState(0.1);
    const [intervalTick, setIntervalTick] = useState(0);
    const intervalUpdate = 0.5 * 60000; 

    async function createSound() {
        console.log('Loading Sound');
        const { sound } = await Audio.Sound.createAsync(
        require('../assets/audio_files/rain.mp3'), { volume: volume }
        ).catch((e) => {console.log("Failed to load " + e)});
        
        if (sound) {
            const playbackStatus = await sound.getStatusAsync();
            console.log(playbackStatus) 
        } else {
            console.log("Sound is not a valid object")
        } 
        //console.log(sound);
        setSound(sound);
    }

    async function play() {
        console.log("Playing")
        await sound.playAsync()
        console.log("Now playing")
    }

    async function pause() {
        await sound.pauseAsync()
        console.log("Now pausing")
    }

    function increaseVolume() {
        setVolume(Math.min(volume + 0.2, 1))
    }

    function decreaseVolume() {
        setVolume(Math.max(volume - 0.2, 0))
    }

    function updateVolume(numMembers) {
        const ratio = numMembers / MAX_MEMBERS
        if (ratio <= 0.2) {
            setVolume(0.2)
        } else if (ratio > 0.2 && ratio <= 0.4) {
            setVolume(0.4)
        } else if (ratio > 0.4 && ratio <= 0.7) {
            setVolume(0.6)
        } else if (ratio > 0.7 && ratio <= 1) {
            setVolume(0.8)
        } else {
            console.log("Error: Volume not updated with numMembers " + numMembers)
        }
    }

    useEffect(() => {
        if (sound) {
        return () => {console.log("Unloading sound"); sound.unloadAsync()}
        }
    }, [sound])

    useEffect(() => {
        createSound()
    }, []) 

    useEffect(() => {
        console.log("Entering interval")
        let interval = setInterval(() => {
            console.log("Updating volume with numPresent: " + numPresent)
            updateVolume(numPresent)
            setIntervalTick(intervalTick ? 0 : 1)
        }, intervalUpdate)
        return () => {clearInterval(interval)}
    }, [intervalTick, numPresent])

    useEffect(() =>{
        console.log("Current numPresent: " + numPresent)
    })

    useEffect(() => {
        if (sound) {
        sound.getStatusAsync().then((status) => {
            if (status.isLoaded) {
            console.log("Changing volume to " + volume)
            sound.setVolumeAsync(volume).then(() => {console.log("Volume changed")})
                .catch((e) => {console.log("Failed: " + e)})
            } 
        }).catch((e) => {
            console.log(e)
        }) 
        }
    
    }, [volume])

    function alterAudioState() {
        console.log("Button pressed")
        if (sound && icon == "volume-off") {
            play()
        } else if (sound && icon == "volume-high") {
            pause()
        } 
        setIcon((icon == "volume-high" ? "volume-off" : "volume-high"))
    }

    return (
        <>
            <IconButton
                icon={icon}
                onPress={alterAudioState}
            />
        </>

    );
}
