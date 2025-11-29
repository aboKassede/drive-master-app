import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Alert, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const InstructorDashboard = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [pendingLessons, setPendingLessons] = useState([]);
  const { logout } = useAuth();

  useEffect(() => {
    loadProfile();
    loadPendingLessons();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/instructors/me');
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadPendingLessons = async () => {
    try {
      const response = await api.get('/instructor/pending-lessons');
      setPendingLessons(response.data);
    } catch (error) {
      console.error('Failed to load pending lessons:', error);
    }
  };

  const handleAcceptLesson = async (lessonId) => {
    try {
      await api.put(`/instructor/lessons/${lessonId}/accept`);
      Alert.alert('Success', 'Lesson accepted!');
      loadPendingLessons();
    } catch (error) {
      Alert.alert('Error', 'Failed to accept lesson');
    }
  };

  const handleRejectLesson = async (lessonId) => {
    Alert.alert(
      'Reject Lesson',
      'Are you sure you want to reject this lesson?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.put(`/instructor/lessons/${lessonId}/reject`, {
                reason: 'Schedule conflict'
              });
              Alert.alert('Success', 'Lesson rejected');
              loadPendingLessons();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject lesson');
            }
          }
        }
      ]
    );
  };

  const renderPendingLesson = ({ item }) => (
    <View style={styles.lessonCard}>
      <Text style={styles.studentName}>{item.student_name}</Text>
      <Text style={styles.lessonDate}>
        {new Date(item.scheduled_date).toLocaleString()}
      </Text>
      <Text style={styles.lessonType}>{item.lesson_type} - {item.duration_minutes} min</Text>
      <Text style={styles.studentPhone}>Phone: {item.student_phone}</Text>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAcceptLesson(item.id)}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRejectLesson(item.id)}
        >
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile ? profile.first_name?.charAt(0) : 'I'}
              </Text>
            </View>
            <View>
              <Text style={styles.greeting}>Good morning</Text>
              <Text style={styles.userName}>
                {profile ? `${profile.first_name} ${profile.last_name}` : 'Instructor'}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <Text style={styles.notificationIcon}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={styles.menuButton}>
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        {profile && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{pendingLessons.length}</Text>
              <Text style={styles.statLabel}>Pending Requests</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>${profile.hourly_rate || 0}</Text>
              <Text style={styles.statLabel}>Hourly Rate</Text>
            </View>
          </View>
        )}

        {/* Pending Requests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Lesson Requests</Text>
          {pendingLessons.length > 0 ? (
            <FlatList
              data={pendingLessons}
              renderItem={renderPendingLesson}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>No pending requests</Text>
              <Text style={styles.emptySubtext}>New lesson requests will appear here</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={[styles.actionItem, { backgroundColor: '#EFF6FF' }]}>
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionText}>My Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionItem, { backgroundColor: '#F0F9FF' }]}>
              <Text style={styles.actionIcon}>👥</Text>
              <Text style={styles.actionText}>Students</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionItem, { backgroundColor: '#F0FDF4' }]}>
              <Text style={styles.actionIcon}>💰</Text>
              <Text style={styles.actionText}>Earnings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionItem, { backgroundColor: '#FFFBEB' }]}>
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  greeting: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  notificationButton: {
    padding: 8,
    marginRight: 8,
  },
  notificationIcon: {
    fontSize: 24,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: '#64748B',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  lessonCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  lessonDate: {
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 4,
    fontWeight: '500',
  },
  lessonType: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  studentPhone: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  quickActions: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 32,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
});

export default InstructorDashboard;