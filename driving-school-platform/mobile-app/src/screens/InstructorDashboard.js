import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Instructor Dashboard</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {profile && (
        <View style={styles.profileCard}>
          <Text style={styles.welcomeText}>
            Welcome, {profile.first_name} {profile.last_name}!
          </Text>
          <Text style={styles.profileText}>Email: {profile.email}</Text>
          <Text style={styles.profileText}>Rate: ${profile.hourly_rate}/hour</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Lesson Requests ({pendingLessons.length})</Text>
        {pendingLessons.length > 0 ? (
          <FlatList
            data={pendingLessons}
            renderItem={renderPendingLesson}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Text style={styles.noLessonsText}>No pending requests</Text>
        )}
      </View>

      <View style={styles.menuGrid}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>My Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Students</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Earnings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  profileCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  profileText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  menuItem: {
    width: '45%',
    backgroundColor: 'white',
    margin: '2.5%',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  lessonCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  lessonDate: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 3,
  },
  lessonType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  studentPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  rejectButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noLessonsText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
});

export default InstructorDashboard;