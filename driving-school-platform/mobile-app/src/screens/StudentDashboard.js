import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../services/api';

const StudentDashboard = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const { logout } = useAuth();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await studentAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Student Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {profile && (
        <View style={styles.profileCard}>
          <Text style={styles.welcomeText}>
            Welcome, {profile.first_name} {profile.last_name}!
          </Text>
          <Text style={styles.profileText}>Email: {profile.email}</Text>
          <Text style={styles.profileText}>Phone: {profile.phone}</Text>
        </View>
      )}

      <View style={styles.menuGrid}>
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: '#EFF6FF' }]}
          onPress={() => navigation.navigate('Lessons')}
        >
          <Text style={styles.menuIcon}>📚</Text>
          <Text style={styles.menuText}>My Lessons</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: '#F0F9FF' }]}
          onPress={() => navigation.navigate('Schedule')}
        >
          <Text style={styles.menuIcon}>📅</Text>
          <Text style={styles.menuText}>Book Lesson</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: '#F0FDF4' }]}
          onPress={() => navigation.navigate('Payment')}
        >
          <Text style={styles.menuIcon}>💳</Text>
          <Text style={styles.menuText}>Payments</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: '#FFFBEB' }]}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={styles.menuIcon}>🔔</Text>
          <Text style={styles.menuText}>Notifications</Text>
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#3B82F6',
    marginHorizontal: 24,
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  profileText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 4,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  menuItem: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    marginHorizontal: '1.5%',
    marginBottom: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
});

export default StudentDashboard;