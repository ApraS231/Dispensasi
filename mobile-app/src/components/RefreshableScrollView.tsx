import React, { useState } from 'react';
import { 
  ScrollView, 
  RefreshControl, 
  StyleSheet, 
  View, 
  Platform,
  ScrollViewProps
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  SharedValue
} from 'react-native-reanimated';
import LiquidRefreshControl from './LiquidRefreshControl';
import { COLORS } from '../utils/theme';

interface RefreshableScrollViewProps extends ScrollViewProps {
  refreshing: boolean;
  onRefresh: () => void;
  scrollY?: SharedValue<number>;
  children: React.ReactNode;
}

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function RefreshableScrollView({ 
  refreshing, 
  onRefresh, 
  scrollY: externalScrollY,
  children, 
  contentContainerStyle,
  ...props 
}: RefreshableScrollViewProps) {
  const internalScrollY = useSharedValue(0);
  const scrollY = externalScrollY || internalScrollY;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const liquidStyle = useAnimatedStyle(() => {
    // When pulling down (negative scroll), we show the refresh indicator
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

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="transparent" // Hide default spinner
            colors={['transparent']} // Hide default spinner on Android
            progressBackgroundColor="transparent"
          />
        }
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Animated.ScrollView>
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
