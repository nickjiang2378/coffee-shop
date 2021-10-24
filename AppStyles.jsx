import { StyleSheet } from "react-native"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',

  },
  personCell: {
    backgroundColor: "#ecf0f1",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    flexDirection: "row",
    marginVertical: 8,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 3.84,
    elevation: 5,
  },
  personCellLeft: { backgroundColor: "tomato", borderRadius: 15, justifyContent: "center", height: 30, width: 30 },
  personCellRight: {
    flex: 1,
    marginLeft: 20,
    justifyContent: "center",
    alignItems: "baseline",
  },
  
});

export { styles }