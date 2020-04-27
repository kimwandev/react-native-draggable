import React from 'react';
import {View, Text, Animated, PanResponder, FlatList} from 'react-native';


export default class DraggableFlatList extends React.Component {
  panResponder;

  currentY = 0;
  currentX = 0;
  scrollOffset = 0;
  flatListTopOffset = 0;
  rowHeight = 0;
  currentIndex = -1;
  active = false;
  containerWidth = 0;
  point = new Animated.ValueXY();

  constructor(props) {
    super(props);
    this.initial
    this.state = {
      dragging: false,
      draggingIndex: -1,
      currentX: 0,
      currentY: 0,
      isMovingOutOfList: false
    }


    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        
        this.currentIndex = this.yToIndex(gestureState.y0);
        this.active = true;
        this.setState(
          {dragging: true, draggingIndex: this.currentIndex, isMovingOutOfList: false},
          () => {
            this.animateList();
          },
        );

        if(this.props.onDragStart) {
          this.props.onDragStart();
        }
      },
      onPanResponderMove: (event, gestureState) => {
        this.currentY = gestureState.moveY;
        this.currentX = gestureState.moveX;

        console.log('dx', gestureState.dx);
        console.log('dy', gestureState.dy);

        // debugging
        this.setState({currentX: this.currentX, currentY: this.currentY});

        // dx can be use to check if moving out of list
        if (gestureState.dx + 30 > this.containerWidth) {
          if (!this.state.isMovingOutOfList) {
            this.setState({isMovingOutOfList: true});
          }
        } else if (this.state.isMovingOutOfList) {
          this.setState({isMovingOutOfList: false});
        }
        
        let topOffset =  (this.props.topOffset ? this.props.topOffset : 0) + (this.rowHeight / 2)
        let leftOffset = (this.props.leftOffset ? this.props.leftOffset : 0) + 30;
        console.log('topoffest', topOffset);
        console.log('leftoffset', leftOffset);
        Animated.event([{y: this.point.y, x: this.point.x}])({y: gestureState.moveY - topOffset, x: gestureState.moveX - leftOffset});
      },
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onPanResponderRelease: () => {
        if (this.currentX > this.containerWidth && this.props.commitMove) {
          this.props.commitMove(this.currentIndex);
        }
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
      if (!this.active){
        return
      }

      console.log('animating...');
      // check y
      const newIndex = this.yToIndex(this.currentY);
      if (this.currentIndex !== newIndex) {

        if (this.props.reorder) {
          this.props.reorder(this.currentIndex, newIndex);
        }

        this.setState({
          // data: reorder(this.state.data, this.currentIndex, newIndex),
          draggingIndex: newIndex,
        });
        this.currentIndex = newIndex;
      }
      if (this.state.isMovingOutOfList && this.props.moveToList) {
        this.props.moveToList(this.currentIndex, this.currentY);
      } else if (this.props.moveOutOfList) {
        this.props.moveOutOfList(this.currentIndex);
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
    } else if (value > this.props.data.length - 1) {
      return this.props.data.length - 1;
    } else {
      return value - 1;
    }
  };

  render() {
    const {dragging, draggingIndex} = this.state;
    const {data} = this.props;
    const renderItem = ({item, index}, noPanHandlers = false) => {
      return (
        <View
          onLayout={e => {
            if (!this.rowHeight) {
              this.rowHeight = e.nativeEvent.layout.height;
            }
          }}
          style={{
            padding: 20,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: item.backgroundColor,
            opacity: draggingIndex === index || !item.visibleInList ? 0 : 1,
            display: (draggingIndex === index && this.state.isMovingOutOfList) ? 'none' : 'flex',
          }}>
          <Animated.View {...(noPanHandlers ? {} : this.panResponder.panHandlers)}>
            <Text style={{fontSize: 30}}>@</Text>
          </Animated.View>
          <Text style={{flex: 1, textAlign: 'center'}}>{item.id}</Text>
        </View>
      );
    };
    
    return (
      <View onLayout={e => console.log('Layout', e.nativeEvent.layout.x)}>
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
        

        <FlatList
          scrollEnabled={!dragging}
          onScroll={e => {
            this.scrollOffset = e.nativeEvent.contentOffset.y;
          }}
          onLayout={e => {
            this.flatListTopOffset = e.nativeEvent.layout.y;
            this.containerWidth = e.nativeEvent.layout.width;
          }}
          data={data}
          style={{width: '100%'}}
          renderItem={renderItem}
          keyExtractor={item => '' + item.id}
        />
        <Text>x: {this.state.currentX}</Text>
        <Text>y: {this.state.currentY}</Text>
        <Text>moving out: {this.state.isMovingOutOfList.toString()}</Text>
      </View>
    )
  }
}