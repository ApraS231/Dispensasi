import { HapticFeedback } from '../../src/utils/haptics';
import { StyleSheet, TouchableWithoutFeedback, Animated, View } from 'react-native';
import { useRef } from 'react';
import { COLORS, SHADOWS, SIZES } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ICONS } from '../utils/icons';

export default function GlassFAB({ onPress, icon, style }: { onPress: () => void; icon?: keyof typeof MaterialCommunityIcons.glyphMap; style?: any }) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    HapticFeedback.light();
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
        style,
        { transform: [{ scale: scaleValue }] }
      ]}>
        <View style={styles.inner}>
          <MaterialCommunityIcons name={icon || ICONS.add} size={28} color={COLORS.onPrimaryContainer} />
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
    width: 56,
    height: 56,
    borderRadius: SIZES.radiusButton,
    backgroundColor: COLORS.primaryContainer,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
