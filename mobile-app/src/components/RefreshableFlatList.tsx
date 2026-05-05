import React from 'react';
import { 
  FlatList, 
  RefreshControl, 
  StyleSheet, 
  View,
  FlatListProps
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  SharedValue
} from 'react-native-reanimated';
import LiquidRefreshControl from './LiquidRefreshControl';

interface RefreshableFlatListProps extends FlatListProps<any> {
  refreshing: boolean;
  onRefresh: () => void;
  scrollY?: SharedValue<number>;
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function RefreshableFlatList({ 
  refreshing, 
  onRefresh, 
  scrollY: externalScrollY,
  ...props 
}: RefreshableFlatListProps) {
  const internalScrollY = useSharedValue(0);
  const scrollY = externalScrollY || internalScrollY;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const liquidStyle = useAnimatedStyle(() => {
    const pullDistance = -scrollY.value;
    const opacity = interpolate(pullDistance, [0, 50], [0, 1], Extrapolation.CLAMP);
    const translateY = interpolate(pullDistance, [0, 100], [-20, 0], Extrapolation.CLAMP);
    const scale = interpolate(pullDistance, [0, 80], [0.5, 1], Extrapolation.CLAMP);

    return {
      opacity: refreshing ? 1 : opacity,
      transform: [
        { translateY: refreshing ? 0 : translateY },
        { scale: refreshing ? 1 : scale }
      ],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.refreshWrapper, liquidStyle]}>
        <LiquidRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      </Animated.View>

      <AnimatedFlatList
        {...props}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="transparent"
            colors={['transparent']}
            progressBackgroundColor="transparent"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  refreshWrapper: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
});
