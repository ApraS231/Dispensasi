import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../utils/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
  return (
    <View style={[styles.searchBar, SHADOWS.inset]}>
      <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
      <TextInput 
        style={styles.searchInput}
        placeholder={placeholder || "Cari..."}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearBtn}>
          <MaterialCommunityIcons name="close" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassSurface,
    borderRadius: SIZES.radiusButton,
    paddingHorizontal: SPACING.md,
    height: 48,
    marginBottom: SPACING.md,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  clearBtn: {
    padding: SPACING.xs,
  },
});
