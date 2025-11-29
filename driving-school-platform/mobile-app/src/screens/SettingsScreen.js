import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const SettingsScreen = () => {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' }
      ]
    );
  };

  const clearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => Alert.alert('Success', 'Cache cleared!') }
      ]
    );
  };

  const renderSettingItem = (title, subtitle, value, onValueChange, type = 'switch') => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#CBD5E1', true: '#3B82F6' }}
          thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        />
      )}
    </View>
  );

  const renderActionItem = (title, subtitle, onPress, color = '#1E293B') => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View>
        <Text style={[styles.actionTitle, { color }]}>{title}</Text>
        {subtitle && <Text style={styles.actionSubtitle}>{subtitle}</Text>}
      </View>
      <Text style={styles.actionArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {renderSettingItem(
            'Push Notifications',
            'Receive notifications about lessons and updates',
            notifications,
            setNotifications
          )}
          {renderSettingItem(
            'Email Alerts',
            'Get important updates via email',
            emailAlerts,
            setEmailAlerts
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          {renderSettingItem(
            'Dark Mode',
            'Use dark theme throughout the app',
            darkMode,
            setDarkMode
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {renderActionItem(
            'Privacy Policy',
            'View our privacy policy',
            () => Alert.alert('Info', 'Privacy policy would open here')
          )}
          {renderActionItem(
            'Terms of Service',
            'Read terms and conditions',
            () => Alert.alert('Info', 'Terms of service would open here')
          )}
          {renderActionItem(
            'Clear Cache',
            'Free up storage space',
            clearCache
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {renderActionItem(
            'Contact Support',
            'Get help with your account',
            () => Alert.alert('Support', 'Contact: support@drivelink.com')
          )}
          {renderActionItem(
            'Rate App',
            'Leave a review on the app store',
            () => Alert.alert('Thanks!', 'This would open the app store')
          )}
        </View>

        <View style={styles.section}>
          {renderActionItem(
            'Logout',
            'Sign out of your account',
            handleLogout,
            '#EF4444'
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>DriveLink v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  actionTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  actionArrow: {
    fontSize: 20,
    color: '#94A3B8',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  version: {
    fontSize: 14,
    color: '#94A3B8',
  },
});

export default SettingsScreen;