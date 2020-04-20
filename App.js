/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {View, Text, Animated, PanResponder, FlatList} from 'react-native';
import DraggableCircle from './components/DraggableCircle';


class App extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Drag and Drop</Text>
        </View>
        <View style={styles.dropZone}>
          <Text style={styles.text}>Drop them here!</Text>
        </View>
        <View style={styles.ballContainer}>
          <View style={styles.row}>
            <DraggableCircle />
            <DraggableCircle />
            <DraggableCircle />
            <DraggableCircle />
            <DraggableCircle />
          </View>
        </View>
      </View>
    );
  }
}
export default App;

const styles = {
  container: {
    flex: 1,
  },
  header: {
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'blue',
    paddingBottom: 20,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 20,
  },

  ballContainer: {
    height:200
  },
  row: {
    flexDirection: "row",
    justifyContent: 'space-around',
    marginTop: 10
  },  
  dropZone: {
    height: 200,
    backgroundColor: "#00334d"
  },
  text: {
    marginTop: 25,
    marginLeft: 5,
    marginRight: 5,
    textAlign: "center",
    color: "#fff",
    fontSize: 25,
    fontWeight: "bold"
  }
};