import React, { useRef, useState, useEffect } from "react";
import { AppState, Text, View, Button } from "react-native";
import { ProgressBar } from 'react-native-paper';
import { styles } from "../AppStyles" 

export default function PhoneUsageBar({ roomData, name }) {
    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);
    const [isActive, setActive] = useState(true);
    const [awayUsage, setAwayUsage] = useState(1)
    const timer = useRef()
    const expected = useRef()
    const timerDrift = useRef()
    const awayDate = useRef()
    const MAX_AWAY_TIME = 10000; // ms

    let interval = 1000; // ms
    let count = 0
    function step() {
        console.log("Step1")
        timerDrift.current = Date.now() - expected.current; // the drift (positive for overshooting)
        if (timerDrift > interval) {
            // something really bad happened. Maybe the browser (tab) was inactive?
            // possibly special handling to avoid futile "catch up" run
            console.log("Timer is lagging behind too slowly")
        }
        if (awayUsage < MAX_AWAY_TIME) {
            expected.current += interval;
            //console.log("Drift: " + (interval-timerDrift.current))
            setAwayUsage(awayUsage + interval)
        }

    }

    useEffect(() => {
        console.log("Entering timer hook")
        roomData[name].progress = 1 - awayUsage / MAX_AWAY_TIME
        console.log(roomData[name])
        if (!isActive) {
            console.log("Progress: " + (1 - awayUsage / MAX_AWAY_TIME))
            timer.current = setTimeout(step, Math.max(0, interval - timerDrift.current)); // take into account drift
        }
        
    }, [awayUsage])

    function showAppState(nextAppState) {
        if (
            appState.current.match(/inactive|background/) &&
            nextAppState === "active"
        ) {
            console.log("App actively being used!");
            setActive(true);
        }
        else {
            setActive(false);
            awayDate.current = new Date()
        }

        appState.current = nextAppState;
        setAppStateVisible(appState.current);
        console.log("AppState", appState.current);
    };

    useEffect(() => {
        console.log("Entering function")
        if (!isActive) {

            expected.current = Date.now() + interval
            console.log("Changed expected")
            timer.current = setTimeout(step, interval);
        }
        else if (timer.current) {
            clearTimeout(timer.current);
        }

        if (isActive && awayDate.current) {
            let trueTimeAway = new Date() - awayDate.current
            console.log("Previous Date:", awayDate.current)
            console.log(trueTimeAway)
            //setAwayUsage(awayUsage + trueTimeAway)
        }
        return () => {clearTimeout(timer.current)}
    }, [isActive])


    useEffect(() => {
        const subscription = AppState.addEventListener("change", showAppState);

        return () => {AppState.removeEventListener("change", showAppState)};  // Use the "remove" method once Expo supports latest version of React Native
        
    }, []);


    return (
        <>
            <ProgressBar progress={1 - awayUsage / MAX_AWAY_TIME} style={{width: 300}} />
            <Button 
                title="Toggle countdown"
                onPress={() => {setActive(isActive ? false : true)}}
            />
            <Button 
                title="Regenerate"
                onPress={() => {setAwayUsage(0)}}
            />
        </>
        
    );
}