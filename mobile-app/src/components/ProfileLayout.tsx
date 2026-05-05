import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import TopAppBar from './TopAppBar';
import SkeuCard from './SkeuCard';
import AvatarInitials from './AvatarInitials';
import BouncyButton from './BouncyButton';
import LiquidBackground from './LiquidBackground';
import { COLORS, FONTS, SPACING, SHADOWS } from '../utils/theme';
import { commonStyles } from '../utils/commonStyles';

export interface ProfileSection {
  title: string;
  items: React.ReactNode;
}

interface ProfileLayoutProps {
  title: string;
  userName: string;
  userEmail: string;
  userRole: string;
  sections: ProfileSection[];
  onLogout: () => void;
  version?: string;
  fab?: React.ReactNode;
}

export default function ProfileLayout({
  title,
  userName,
  userEmail,
  userRole,
  sections,
  onLogout,
  version = "v1.0.0",
  fab
}: ProfileLayoutProps) {
  return (
    <View style={commonStyles.container}>
      <LiquidBackground />
      <TopAppBar showAvatar={false} title={title} showNotification={true} />

      <View style={commonStyles.mainContent}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={{ height: 88 + SPACING.statusBar }} />
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              <AvatarInitials name={userName} size={100} fontSize={40} />
            </View>
            <Text style={styles.name}>{userName}</Text>
            <Text style={styles.email}>{userEmail}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{userRole.replace(/_/g, ' ')}</Text>
            </View>
          </View>

          {sections.map((section, index) => (
            <SkeuCard key={index} style={styles.menuCard} isGlass>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items}
            </SkeuCard>
          ))}

          <BouncyButton 
            title="Keluar / Logout" 
            variant="danger" 
            onPress={onLogout} 
            style={styles.logoutBtn}
          />
          
          <Text style={styles.versionText}>SiDispen App {version}</Text>

        </ScrollView>
      </View>

      {fab}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.lg,
  },
  avatarWrapper: {
    marginBottom: SPACING.md,
    ...SHADOWS.glassPanel,
    borderRadius: 50,
    backgroundColor: 'transparent',
    padding: 4,
  },
  name: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  roleBadge: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  roleText: {
    fontFamily: FONTS.labelCaps,
    fontSize: 11,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  menuCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    marginLeft: SPACING.xs,
  },
  logoutBtn: {
    marginTop: SPACING.md,
  },
  versionText: {
    fontFamily: FONTS.code,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xl,
    opacity: 0.5,
  }
});
