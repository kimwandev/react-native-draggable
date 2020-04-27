/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
function generateUniqueId() {
  let s4 = Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
  
  return s4;
}

import React from 'react';
import {View, Text, Animated, PanResponder, FlatList} from 'react-native';
import DraggableFlatList from './components/DraggableFlatList';


function reorder(arr, from, to) {
  return arr.reduce((prev, current, idx, self) => {
    if (from === to) {
      prev.push(current);
    }
    if (idx === from) {
      return prev;
    }
    if (from < to) {
      prev.push(current);
    }
    if (idx === to) {
      prev.push(self[from]);
    }
    if (from > to) {
      prev.push(current);
    }
    return prev;
  }, []);
}

class App extends React.Component {
  


  constructor(props) {
    super(props);
    this.state = {
      data: Array.from(Array(2), (_, i) => {
        return {
          id: generateUniqueId(),
          visibleInList: true,
          backgroundColor: '#' + ((Math.random() * 0xffffff) << 0).toString(16),
        };
      }),
      dataTopOffset: 0,
      dataLeftOffset: 0,
      dataZIndex: 1,
      anotherList: Array.from(Array(3), (_, i) => {
        return {
          id: generateUniqueId(),
          visibleInList: true,
          backgroundColor: '#' + ((Math.random() * 0xffffff) << 0).toString(16),
        };
      }),
      anotherListTopOffset: 0,
      anotherListLeftOffset: 0,
      anotherListZIndex: 1,
    };
  }

  reorder = (from, to) => {
    this.setState({data: reorder(this.state.data, from, to)});
  }

  reorderAnotherList = (from, to) => {
    this.setState({anotherList: reorder(this.state.anotherList, from, to)});
  }

  yToIndex = y => {
    let value = Math.floor(
      y / 76
    );

    if (value <= 0) {
      return 0;
    } else if (value > this.state.anotherList.length - 1) {
      return this.state.anotherList.length - 1;
    } else {
      return value - 1;
    }
  };

  moveToList = (index, y) => {
    let data =  [...this.state.data];
    let anotherList = [...this.state.anotherList];
    let dataItem = data[index];

    let itemIndex = anotherList.findIndex(al => al.id === dataItem.id);

    if (itemIndex < 0) {
      anotherList.push({...dataItem, visibleInList: false});
      data.splice(index, 1);
      this.setState({anotherList: anotherList});
    } else {
      let newIndex = this.yToIndex(y);
     
      if (newIndex !== itemIndex) {
        this.setState({anotherList: reorder(this.state.anotherList, itemIndex, newIndex)});
      }
    }

  }

  moveOutOfList = (index) => {
    let data =  [...this.state.data];
    let anotherList = [...this.state.anotherList];
    let dataItem = data[index];

    let itemIndex = anotherList.findIndex(al => al.id === dataItem.id);
    if (itemIndex >= 0) {
      anotherList.splice(itemIndex, 1);
      this.setState({anotherList});
    }
  }

  commitMoveToList = (index) => {
    let data = [...this.state.data];
    let anotherList = [...this.state.anotherList];

    anotherList.forEach((item) => {
      item.visibleInList = true;
    })

    data.splice(index, 1);
    this.setState({data,anotherList});
  }

  onDragReleased = (draggingIndex) => {

  }

  draggableViewRef;

  draggableView2Ref;


  render() {
    const {data, anotherList} = this.state;
    


    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Drag and Drop</Text>
        </View>
        <View style={{flex:1, flexDirection: 'row'}}>

          <View ref={ref => this.draggableViewRef = ref} onLayout={e => {
            if (this.draggableViewRef) {
              this.draggableViewRef.measure((x, y, width, height, pageX, pageY) => {
                this.setState({dataTopOffset: pageY, dataLeftOffset: pageX});
              })
            }
          }} style={{width: 150, position: 'relative', zIndex: this.state.dataZIndex, padding: 15}}>
            
            <DraggableFlatList 
              data={data}
              topOffset={this.state.dataTopOffset}
              leftOffset={this.state.dataLeftOffset}
              reorder={this.reorder}
              moveToList={this.moveToList}
              moveOutOfList={this.moveOutOfList}
              commitMove={this.commitMoveToList}
              onDragStart={() => {
                this.setState({dataZIndex: 30, anotherListZIndex: 1});
              }}/>
          </View>
          <View ref={ref => this.draggableView2Ref = ref} onLayout={e => {
              if (this.draggableView2Ref) {
                this.draggableView2Ref.measure((x, y, width, height, pageX, pageY) => {

                  this.setState({anotherListTopOffset: pageY, anotherListLeftOffset: pageX});
                })
              }
          }} style={{width: 150, position: 'relative', zIndex: this.state.anotherListZIndex, padding: 15}}>
            
            <DraggableFlatList 
              data={anotherList}
              onDragStart={() => {
                this.setState({dataZIndex: 1, anotherListZIndex: 30});
              }}
              leftOffset={this.state.anotherListLeftOffset}
              reorder={this.reorderAnotherList} topOffset={this.state.anotherListTopOffset}/>
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
  }
};
