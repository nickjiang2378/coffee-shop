import React from "react";
import { View, Image } from "react-native";
import { ProgressBar, Text } from 'react-native-paper';
import { styles } from "../AppStyles";

export default function Person ({ name, progress_ratio }) {

  return (
    <View style={styles.personCell}>
        <View style={styles.personCellLeft}>
            <Text style={{textAlign: "center", color: "white"}}>{name[0]}</Text>
        </View>
        <View style={styles.personCellRight}>
            <Text style={{marginBottom: 5}}>{name}</Text>
            <ProgressBar progress={progress_ratio} style={{width: 200}}/>
        </View>
    

    </View>
  );
};
