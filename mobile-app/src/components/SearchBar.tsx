import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
  const { colors, SIZES, SPACING, FONTS, shadows } = useTheme();

  return (
    <View
      style={[
        styles.searchBar,
        shadows.inset,
        {
          backgroundColor: colors.inputBg || 'rgba(0, 0, 0, 0.25)',
          borderRadius: SIZES.radiusInput,
          paddingHorizontal: SPACING.md,
          height: 55, // design.md §4C input height 55px
          marginBottom: SPACING.md,
        },
      ]}
    >
      <MaterialCommunityIcons
        name="magnify"
        size={20}
        color={colors.textMuted}
        style={[styles.searchIcon, { marginRight: SPACING.sm }]}
      />
      <TextInput
        style={[
          styles.searchInput,
          {
            fontFamily: FONTS.body,
            fontSize: 16, // Modular scale
            color: colors.textPrimary,
          },
        ]}
        placeholder={placeholder || 'Cari...'}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          style={[styles.clearBtn, { padding: SPACING.xs }]}
        >
          <MaterialCommunityIcons name="close" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
  },
  clearBtn: {},
});
