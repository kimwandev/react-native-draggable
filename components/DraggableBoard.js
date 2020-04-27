import React from 'react';
import {View, Text, Animated, PanResponder, FlatList} from 'react-native';

function generateUniqueId() {
  let s4 = Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
  
  return s4;
}


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

export default class DraggableBoard extends React.Component {
  panResponder;

  currentY = 0;
  currentX = 0;
  scrollOffset = 0;
  flatListTopOffset = 0;
  rowHeight = 0;
  currentIndex = -1;
  active = false;
  point = new Animated.ValueXY();

  constructor(props) {
    super(props);
    this.state = {
      dragging: false,
      draggingIndex: -1,
      currentX: 0,
      currentY: 0,
      list1: {
        data:  Array.from(Array(2), (_, i) => {
          return {
            id: generateUniqueId(),
            visibleInList: true,
            backgroundColor: '#' + ((Math.random() * 0xffffff) << 0).toString(16),
          };
        }),
      },
      list2: {
        data: Array.from(Array(3), (_, i) => {
          return {
            id: generateUniqueId(),
            visibleInList: true,
            backgroundColor: '#' + ((Math.random() * 0xffffff) << 0).toString(16),
          };
        }),
      }
    }


    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        this.currentIndex = this.yToIndex(gestureState.y0);
        this.active = true;
        this.setState(
          {dragging: true, draggingIndex: this.currentIndex },
          () => {
            this.animateList();
          },
        );
      },
      onPanResponderMove: (event, gestureState) => {
        this.currentY = gestureState.moveY;
        this.currentX = gestureState.moveX;

        // // debugging
        // this.setState({currentX: this.currentX, currentY: this.currentY});

        Animated.event([{y: this.point.y, x: this.point.x}])({y: gestureState.moveY - 130, x: gestureState.moveX - 30});
      },
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onPanResponderRelease: () => {
        this.reset();
      },
      onPanResponderTerminate: (evt, gestureState) => {
        this.reset();
      },
    });
  }


  animateList() {
    if (!this.active) {
      return;
    }

    requestAnimationFrame(() => {
      // check y
      const newIndex = this.yToIndex(this.currentY);
      if (this.currentIndex !== newIndex) {

        

        this.setState({
          list1: {
            data: reorder(this.state.list1.data, this.currentIndex, newIndex)
          },
          draggingIndex: newIndex,
        });
        this.currentIndex = newIndex;
      }

      this.animateList();
    });
  }


  reset() {
    this.active = false;
    this.setState({dragging: false, draggingIndex: -1});
  }

  yToIndex = y => {
    let value = Math.floor(
      y / this.rowHeight,
    );

    if (value <= 0) {
      return 0;
    } else if (value > this.state.list1.data.length - 1) {
      return this.state.list1.data.length - 1;
    } else {
      return value - 1;
    }
  };

  render() {
    const {dragging, draggingIndex} = this.state;
    const list1Data = this.state.list1.data;
    const list2Data = this.state.list2.data;
    const renderItem = ({item, index}, noPanHandlers = false) => {
      return (
        <View
          onLayout={e => {
            this.rowHeight = e.nativeEvent.layout.height;
          }}
          style={{
            padding: 20,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: item.backgroundColor,
            opacity: draggingIndex === index || !item.visibleInList ? 0 : 1,
          }}>
          <Animated.View {...(noPanHandlers ? {} : this.panResponder.panHandlers)}>
            <Text style={{fontSize: 30}}>@</Text>
          </Animated.View>
          <Text style={{flex: 1, textAlign: 'center'}}>{item.id}</Text>
        </View>
      );
    };
    
    return (
      <View>
        {dragging && (
          <Animated.View
            style={{
              position: 'absolute',
              zIndex: 100,
              width: '100%',
              top: this.point.getLayout().top,
              left: this.point.getLayout().left
            }}>
            {renderItem({item: data[draggingIndex], index: -1}, false)}
          </Animated.View>
        )}
        
        <View style={{flexDirection: 'row'}}>
          <FlatList
            scrollEnabled={!dragging}
            onScroll={e => {
              this.scrollOffset = e.nativeEvent.contentOffset.y;
            }}
            onLayout={e => {
              this.flatListTopOffset = e.nativeEvent.layout.y;
            }}
            data={list1Data}
            style={{width: 150}}
            renderItem={renderItem}
            keyExtractor={item => '' + item.id}
          />
            <FlatList
            scrollEnabled={!dragging}
            onScroll={e => {
              this.scrollOffset = e.nativeEvent.contentOffset.y;
            }}
            onLayout={e => {
              this.flatListTopOffset = e.nativeEvent.layout.y;
            }}
            data={list2Data}
            style={{width: 150}}
            renderItem={renderItem}
            keyExtractor={item => '' + item.id}
          />
        </View>
        <Text>x: {this.state.currentX}</Text>
        <Text>y: {this.state.currentY}</Text>
      </View>
    )
  }
}