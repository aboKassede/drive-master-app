import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../services/api';

const { width } = Dimensions.get('window');

const StudentDashboard = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [upcomingLesson, setUpcomingLesson] = useState(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const { logout } = useAuth();

  const banners = [
    { id: 1, title: 'Book Your Next Lesson', subtitle: 'Learn with certified instructors', color: '#3B82F6' },
    { id: 2, title: 'Track Your Progress', subtitle: 'See how far you\'ve come', color: '#10B981' },
    { id: 3, title: 'Safe Driving Tips', subtitle: 'Master the road with confidence', color: '#F59E0B' }
  ];

  useEffect(() => {
    loadProfile();
    loadUpcomingLesson();
    
    // Auto-slide banners
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const loadProfile = async () => {
    try {
      const response = await studentAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadUpcomingLesson = async () => {
    try {
      const response = await studentAPI.getUpcomingLessons();
      if (response.data && response.data.length > 0) {
        setUpcomingLesson(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load upcoming lesson:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile ? profile.first_name?.charAt(0) : 'S'}
              </Text>
            </View>
            <View>
              <Text style={styles.greeting}>Good morning</Text>
              <Text style={styles.userName}>
                {profile ? `${profile.first_name} ${profile.last_name}` : 'Student'}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <Text style={styles.notificationIcon}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.menuButton}>
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sliding Banner */}
        <View style={styles.bannerContainer}>
          <View style={[styles.banner, { backgroundColor: banners[currentBanner].color }]}>
            <Text style={styles.bannerTitle}>{banners[currentBanner].title}</Text>
            <Text style={styles.bannerSubtitle}>{banners[currentBanner].subtitle}</Text>
          </View>
          <View style={styles.bannerDots}>
            {banners.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, { opacity: index === currentBanner ? 1 : 0.3 }]}
              />
            ))}
          </View>
        </View>

        {/* Upcoming Lesson Card */}
        {upcomingLesson && (
          <View style={styles.upcomingCard}>
            <View style={styles.upcomingHeader}>
              <Text style={styles.upcomingTitle}>Upcoming Lesson</Text>
              <Text style={styles.upcomingTime}>
                {new Date(upcomingLesson.scheduled_date).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.upcomingInstructor}>
              With {upcomingLesson.instructor_name}
            </Text>
            <Text style={styles.upcomingType}>
              {upcomingLesson.lesson_type} • {upcomingLesson.duration_minutes} min
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={[styles.actionItem, { backgroundColor: '#EFF6FF' }]}
              onPress={() => navigation.navigate('Schedule')}
            >
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionText}>Book Lesson</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionItem, { backgroundColor: '#F0F9FF' }]}
              onPress={() => navigation.navigate('Lessons')}
            >
              <Text style={styles.actionIcon}>📚</Text>
              <Text style={styles.actionText}>My Lessons</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionItem, { backgroundColor: '#F0FDF4' }]}
              onPress={() => navigation.navigate('Progress')}
            >
              <Text style={styles.actionIcon}>📈</Text>
              <Text style={styles.actionText}>Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionItem, { backgroundColor: '#FFFBEB' }]}
              onPress={() => navigation.navigate('Payment')}
            >
              <Text style={styles.actionIcon}>💳</Text>
              <Text style={styles.actionText}>Payments</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>More Options</Text>
          <View style={styles.menuList}>
            <TouchableOpacity 
              style={styles.menuListItem}
              onPress={() => navigation.navigate('Chat')}
            >
              <Text style={styles.menuListIcon}>💬</Text>
              <Text style={styles.menuListText}>Chat with Instructor</Text>
              <Text style={styles.menuListArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuListItem}
              onPress={() => navigation.navigate('Schools')}
            >
              <Text style={styles.menuListIcon}>🏢</Text>
              <Text style={styles.menuListText}>My School</Text>
              <Text style={styles.menuListArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuListItem}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Text style={styles.menuListIcon}>🔔</Text>
              <Text style={styles.menuListText}>Notifications</Text>
              <Text style={styles.menuListArrow}>›</Text>
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
    backgroundColor: '#3B82F6',
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
  bannerContainer: {
    marginHorizontal: 24,
    marginTop: 20,
  },
  banner: {
    height: 120,
    borderRadius: 16,
    padding: 24,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginHorizontal: 4,
  },
  upcomingCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  upcomingTime: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  upcomingInstructor: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 4,
  },
  upcomingType: {
    fontSize: 14,
    color: '#64748B',
  },
  quickActions: {
    marginHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
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
  menuSection: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 32,
  },
  menuList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuListIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuListText: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
  },
  menuListArrow: {
    fontSize: 20,
    color: '#94A3B8',
  },
});

export default StudentDashboard;