/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {View, Text, Animated, PanResponder, FlatList} from 'react-native';

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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    height: 40,
    width: 40,
    backgroundColor: 'red',
    borderRadius: 10,
  },
};

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
  panResponder;

  currentY = 0;
  scrollOffset = 0;
  flatListTopOffset = 0;
  rowHeight = 0;
  currentIndex = -1;
  active = false;
  point = new Animated.ValueXY();

  state = {
    dragging: false,
    draggingIndex: -1,
    data: Array.from(Array(200), (_, i) => {
      return {
        index: i,
        backgroundColor: '#' + ((Math.random() * 0xffffff) << 0).toString(16),
      };
    }),
    message: 'hello',
    pointX: 0,
  };

  constructor(props) {
    super(props);

    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        // this.point.setOffset({
        //   x: this.point.x._value,
        //   y: this.point.y._value,
        // });
        this.currentIndex = this.yToIndex(gestureState.y0);
        this.active = true;
        this.setState(
          {dragging: true, draggingIndex: this.currentIndex},
          () => {
            this.animateList();
          },
        );
      },
      onPanResponderMove: (event, gestureState) => {
        // Animated.event([{y: this.point.y, x: this.point.x}])({
        //   y: gestureState.dy,
        //   x: gestureState.dx,
        // });
        // this.setState({pointX: this.point.x._value});

        this.currentY = gestureState.moveY;
        Animated.event([{y: this.point.y}])({y: gestureState.moveY - 40});
      },
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onPanResponderRelease: () => {
        // this.point.flattenOffset();

        this.reset();
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
        this.reset();
      },
    });
  }

  reset() {
    this.active = false;
    this.setState({dragging: false, draggingIndex: -1});
  }
  yToIndex = y => {
    let value = Math.floor(
      (this.scrollOffset + y - this.flatListTopOffset) / this.rowHeight,
    );

    if (value < 0) {
      return 0;
    } else if (value > this.state.data.length - 1) {
      return this.state.data.length - 1;
    }

    return value;
  };

  animateList() {
    if (!this.active) {
      return;
    }

    requestAnimationFrame(() => {
      // check y
      const newIndex = this.yToIndex(this.currentY);
      if (this.currentIndex !== newIndex) {
        this.setState({
          data: reorder(this.state.data, this.currentIndex, newIndex),
          draggingIndex: newIndex,
        });
        this.currentIndex = newIndex;
      }
      this.animateList();
    });
  }

  render() {
    const {data, dragging, draggingIndex} = this.state;

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
            opacity: draggingIndex === index ? 0 : 1,
          }}>
          <View {...(noPanHandlers ? {} : this.panResponder.panHandlers)}>
            <Text style={{fontSize: 30}}>@</Text>
          </View>
          <Text style={{flex: 1, textAlign: 'center'}}>{item.index}</Text>
        </View>
      );
    };

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Drag and Drop</Text>
        </View>
        {dragging && (
          <Animated.View
            style={{
              position: 'absolute',
              zIndex: 2,
              width: '100%',
              top: this.point.getLayout().top,
            }}>
            {renderItem({item: data[draggingIndex], index: -1}, false)}
          </Animated.View>
        )}

        <FlatList
          scrollEnabled={!dragging}
          onScroll={e => {
            this.scrollOffset = e.nativeEvent.contentOffset.y;
          }}
          onLayout={e => {
            this.flatListTopOffset = e.nativeEvent.layout.y;
          }}
          data={data}
          style={{width: '100%'}}
          renderItem={renderItem}
          keyExtractor={item => '' + item.index}
        />
        {/* <View style={styles.content}>
          <Animated.View
            style={{
              transform: [
                {translateX: this.point.x},
                {translateY: this.point.y},
              ],
            }}
          {...this.panResponder.panHandlers}>
            <View style={styles.box} />
          </Animated.View>
        </View>*/}
      </View>
    );
  }
}
export default App;
