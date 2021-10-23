import React, { useRef, useState, useEffect } from "react";
import { AppState, Text, View, Button } from "react-native";
import { ProgressBar } from 'react-native-paper';
import { styles } from "../AppStyles" 

export function PhoneUsageBar() {
    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);
    const [isActive, setActive] = useState(true);
    const [awayUsage, setAwayUsage] = useState(0)
    const timer = useRef()
    const expected = useRef()
    const timerDrift = useRef()
    const awayDate = useRef()
    const MAX_AWAY_TIME = 60000; // ms

    let interval = 100; // ms
    let count = 0
    function step() {
        console.log("Step")
        timerDrift.current = Date.now() - expected.current; // the drift (positive for overshooting)
        if (timerDrift > interval) {
            // something really bad happened. Maybe the browser (tab) was inactive?
            // possibly special handling to avoid futile "catch up" run
            console.log("Timer is lagging behind too slowly")
        }
        if (awayUsage < MAX_AWAY_TIME) {
            expected.current += interval;
            console.log("Drift: " + (interval-timerDrift.current))
            setAwayUsage(awayUsage + interval)
        }

    }

    useEffect(() => {
        console.log("Entering timer hook")
        if (!isActive) {
            console.log("Away usage: " + awayUsage)
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
        }

        appState.current = nextAppState;
        setAppStateVisible(appState.current);
        console.log("AppState", appState.current);
    };

    useEffect(() => {
        console.log("Entering function")
        if (!isActive) {
            awayDate.current = new Date()

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
            setAwayUsage(awayUsage + trueTimeAway)
        }
        return () => {clearTimeout(timer.current)}
    }, [isActive])


    useEffect(() => {
        const subscription = AppState.addEventListener("change", showAppState);

        return () => {AppState.removeEventListener("change", showAppState)};  // Use the "remove" method once Expo supports latest version of React Native
        
    }, []);


    return (
        <ProgressBar progress={1 - awayUsage / MAX_AWAY_TIME} style={{width: 200}} />
    );
}