import React, { useRef, useState, useEffect } from "react";
import { AppState, Text, View, Button } from "react-native";
import { ProgressBar } from 'react-native-paper';
import { styles } from "../AppStyles" 
import firebase from "firebase";
import "firebase/firestore";
import { sendPushNotification } from "../helpers/notifications.js"
import * as Notifications from 'expo-notifications';

export default function PhoneUsageBar({ roomData, name, room, expoPushToken }) {
    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);

    // Usage bar management
    const [isActive, setActive] = useState(true);
    const [decreaseBar, setDecreaseBar] = useState(false);
    const [awayUsage, setAwayUsage] = useState(0)
    const [trueAwayUsage, setTrueAwayUsage] = useState(0);

    // Reducing bar health in gradual way
    const timer = useRef()
    const expected = useRef()
    const timerDrift = useRef()
    const awayDate = useRef()
    const time_dif = useRef()
    const responseListener = useRef();
    const MAX_AWAY_TIME = 30000; // ms

    let interval = 1000; // ms
    let count = 0
    function step() {
        //console.log("Step1")
        timerDrift.current = Date.now() - expected.current; // the drift (positive for overshooting)
        if (timerDrift > interval) {
            // something really bad happened. Maybe the browser (tab) was inactive?
            // possibly special handling to avoid futile "catch up" run
            console.log("Timer is lagging behind too slowly")
        }
        if (awayUsage < MAX_AWAY_TIME) {
            expected.current += interval;
            //console.log("Drift: " + (interval-timerDrift.current))
            console.log("Adding interval1 to awayUsage")
            setAwayUsage(awayUsage + interval)
        }

    }

    function updateUsage() {
        const newProgress = {};
        //console.log(roomData)
        for (let person of Object.values(roomData)) {
            console.log(person)
            if (person["name"] == name) {
                newProgress[name] = Math.max((1 - trueAwayUsage/MAX_AWAY_TIME), 0)
            } else {
                newProgress[person["name"]] = person["progress"]
            }  
        }
        console.log("New progress object created")
        console.log(newProgress)

        firebase.firestore().collection("rooms")
                .doc(room).update({
                    "progress": newProgress
                }).then(() => {
                    console.log("Successfully updated")
                })
                .catch((e) => {console.log(e)})

    }

    function showAppState(nextAppState) {

        let tmp = new Date();
        if (nextAppState === "background" && appState.current === "inactive") {
            // Going to another app
            if (tmp - time_dif.current > 100) {
                awayDate.current = new Date()
                console.log("Sending notification"); 
                sendPushNotification(expoPushToken, {
                    "title": "Study Room Alert",
                    "body": "Hurry back, or your health meter will die!"
                })
                setDecreaseBar(true);
            }
            else if (tmp - time_dif.current < 60) {
                console.log("Ignoring time away")
                awayDate.current = null
                setDecreaseBar(false);
            }
        } else if (nextAppState === "inactive" && appState.current == "active") {
            awayDate.current = new Date() 
        }

        if (
            appState.current.match(/inactive|background/) &&
            nextAppState === "active"
        ) {
            console.log("App actively being used!");
            setActive(true);
            setDecreaseBar(false);
        }
        else {
            setActive(false);
            //awayDate.current = new Date()
        }

        appState.current = nextAppState;
        setAppStateVisible(appState.current);
        console.log("AppState", appState.current, tmp - time_dif.current);
        time_dif.current = tmp
    };

    useEffect(() => {
        //console.log("Entering timer hook")
        roomData[name].progress = 1 - awayUsage / MAX_AWAY_TIME
        console.log(roomData[name])
        if (!isActive && awayDate.current) {
            //console.log("Progress: " + (1 - awayUsage / MAX_AWAY_TIME))
            timer.current = setTimeout(step, Math.max(0, interval - timerDrift.current)); // take into account drift
        }
        
    }, [awayUsage])

    useEffect(() => {
        //console.log("Entering function with awayDate:", awayDate.current)
        if (!isActive && awayDate.current) {

            expected.current = Date.now() + interval
            console.log("Changed expected")
            timer.current = setTimeout(step, interval);
        }
        else if (timer.current) {
            clearTimeout(timer.current);
        }

        // User using app and left earlier
        if (isActive && awayDate.current) {
            let trueTimeAway = new Date() - awayDate.current
            //console.log("Previous Date:", awayDate.current)
            console.log("Cumulative Away Usage: " + (trueAwayUsage + trueTimeAway))
            setTrueAwayUsage(trueAwayUsage + trueTimeAway)
            
            //setAwayUsage(awayUsage + trueTimeAway)
        }
        return () => {clearTimeout(timer.current)}
    }, [decreaseBar])

    useEffect(() => {
        if (trueAwayUsage) {
            console.log("True Away Hook invoked")
            console.log(`${trueAwayUsage} vs ${awayUsage}`)
            setAwayUsage(trueAwayUsage)
            updateUsage() // call to firebase
        }
    }, [trueAwayUsage])


    useEffect(() => {
        time_dif.current = new Date();
        const subscription = AppState.addEventListener("change", showAppState);
        // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log("Test")
            console.log(response);
        });

        return () => {
            AppState.removeEventListener("change", showAppState)
            Notifications.removeNotificationSubscription(responseListener.current);
        };  // Use the "remove" method once Expo supports latest version of React Native
        
    }, []);


    return (
        <>
            <ProgressBar progress={1 - awayUsage/MAX_AWAY_TIME} style={{width: 350}} />
        </>
        
    );
}