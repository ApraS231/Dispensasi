import { StyleSheet, TouchableWithoutFeedback, Animated, View } from 'react-native';
import { useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { COLORS, SHADOWS } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ICONS } from '../utils/icons';

export default function GlassFAB({ onPress }: { onPress: () => void }) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 20,
      bounciness: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 15,
      bounciness: 10,
    }).start();
  };

  return (
    <TouchableWithoutFeedback onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[
        styles.container, 
        { transform: [{ scale: scaleValue }] }
      ]}>
        <View style={styles.inner}>
          <MaterialCommunityIcons name={ICONS.add} size={32} color={COLORS.onPrimaryContainer} />
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56, // M3 standard FAB size
    height: 56,
    borderRadius: 16, // M3 standard FAB radius
    backgroundColor: COLORS.primaryContainer,
    ...SHADOWS.elevation3,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
