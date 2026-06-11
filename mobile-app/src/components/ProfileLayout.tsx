import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import TopAppBar from './TopAppBar';
import SkeuCard from './SkeuCard';
import AvatarInitials from './AvatarInitials';
import BouncyButton from './BouncyButton';
import ThemeSelector from './ThemeSelector';
import OptionMenuItem from './OptionMenuItem';
import { useTheme } from '../hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { router as expoRouter } from 'expo-router';

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
  const { colors, isDark, SIZES, SPACING, FONTS, shadows } = useTheme();

  return (
    <LinearGradient
      colors={[colors.bgPrimary, colors.bgSecondary]}
      style={styles.container}
    >
      <TopAppBar showAvatar={false} title={title} showNotification={true} />

      <View style={styles.mainContent}>
        <ScrollView contentContainerStyle={[styles.content, { padding: SPACING.md }]} showsVerticalScrollIndicator={false}>
          
          <View style={{ height: 88 + SPACING.statusBar }} />
          <View style={[styles.profileHeader, { marginBottom: SPACING.xl, marginTop: SPACING.lg }]}>
            <View style={[
              styles.avatarWrapper, 
              { 
                marginBottom: SPACING.md,
                borderColor: colors.glassHighlight,
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.3)',
                borderRadius: SIZES.radiusFull
              },
              shadows.glassPanel
            ]}>
              <AvatarInitials name={userName} size={100} fontSize={40} />
            </View>
            <Text style={[styles.name, { fontFamily: FONTS.heading, color: colors.textPrimary }]}>{userName}</Text>
            <Text style={[styles.email, { fontFamily: FONTS.bodyMedium, color: colors.textSecondary, marginBottom: SPACING.sm }]}>{userEmail}</Text>
            <View style={[
              styles.roleBadge, 
              { 
                backgroundColor: colors.primaryContainer,
                borderColor: colors.glassHighlight,
                borderRadius: SIZES.radiusFull,
                paddingHorizontal: SPACING.md,
              }
            ]}>
              <Text style={[styles.roleText, { fontFamily: FONTS.labelCaps, color: isDark ? '#7BBDE8' : colors.primary }]}>
                {userRole.replace(/_/g, ' ')}
              </Text>
            </View>
          </View>

          {sections.map((section, index) => (
            <SkeuCard key={index} style={[styles.menuCard, { marginBottom: SPACING.lg }]} isGlass>
              <Text style={[
                styles.sectionTitle, 
                { 
                  fontFamily: FONTS.headingSemi, 
                  color: colors.textSecondary,
                  marginBottom: SPACING.md,
                  marginLeft: SPACING.xs
                }
              ]}>{section.title}</Text>
              {section.items}
            </SkeuCard>
          ))}

          {/* Dukungan & Informasi Card */}
          <SkeuCard style={[styles.menuCard, { marginBottom: SPACING.lg }]} isGlass>
            <Text style={[
              styles.sectionTitle, 
              { 
                fontFamily: FONTS.headingSemi, 
                color: colors.textSecondary,
                marginBottom: SPACING.md,
                marginLeft: SPACING.xs
              }
            ]}>Dukungan & Informasi</Text>
            
            <OptionMenuItem 
              icon="help-circle-outline" 
              label="Pusat Bantuan" 
              onPress={() => expoRouter.push('/help')} 
            />
            <OptionMenuItem 
              icon="information-outline" 
              label="Tentang Aplikasi" 
              onPress={() => expoRouter.push('/about')} 
            />
          </SkeuCard>

          {/* Theme Mode Segmented Controller */}
          <SkeuCard style={[styles.menuCard, { marginBottom: SPACING.lg }]} isGlass>
            <Text style={[
              styles.sectionTitle, 
              { 
                fontFamily: FONTS.headingSemi, 
                color: colors.textSecondary,
                marginBottom: SPACING.xs,
                marginLeft: SPACING.xs
              }
            ]}>Tema Aplikasi</Text>
            <ThemeSelector />
          </SkeuCard>

          <BouncyButton 
            title="Keluar / Logout" 
            variant="danger" 
            onPress={onLogout} 
            style={[styles.logoutBtn, { marginTop: SPACING.md }]}
          />
          
          <Text style={[styles.versionText, { fontFamily: FONTS.code, color: colors.textMuted, marginTop: SPACING.xl }]}>
            Sistem Perizinan Siswa {version}
          </Text>

        </ScrollView>
      </View>

      {fab}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatarWrapper: {
    borderWidth: 1.5,
    padding: 8,
  },
  name: {
    fontSize: 26,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  roleBadge: {
    paddingVertical: 6,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  menuCard: {
    padding: 0,
  },
  sectionTitle: {
    fontSize: 16,
  },
  logoutBtn: {
    width: '100%',
  },
  versionText: {
    fontSize: 10,
    textAlign: 'center',
    opacity: 0.5,
  }
});
