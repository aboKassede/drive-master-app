import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import api from '../services/api';

const LessonsScreen = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      const response = await api.get('/lessons/my-lessons');
      setLessons(response.data);
    } catch (error) {
      console.error('Failed to load lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderLesson = ({ item }) => (
    <View style={styles.lessonCard}>
      <Text style={styles.lessonType}>{item.lesson_type}</Text>
      <Text style={styles.lessonDate}>
        {new Date(item.scheduled_date).toLocaleDateString()}
      </Text>
      <Text style={styles.lessonStatus}>Status: {item.status}</Text>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return { bg: '#F0FDF4', text: '#16A34A' };
      case 'cancelled': return { bg: '#FEF2F2', text: '#DC2626' };
      case 'in_progress': return { bg: '#FFFBEB', text: '#D97706' };
      default: return { bg: '#EFF6FF', text: '#2563EB' };
    }
  };

  const renderLesson = ({ item }) => {
    const statusColors = getStatusColor(item.status);
    return (
      <View style={styles.lessonCard}>
        <View style={styles.lessonHeader}>
          <Text style={styles.lessonType}>{item.lesson_type}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {item.status}
            </Text>
          </View>
        </View>
        <Text style={styles.lessonDate}>
          {new Date(item.scheduled_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
        <Text style={styles.lessonDuration}>{item.duration_minutes} minutes</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Lessons</Text>
        </View>
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Lessons</Text>
      </View>
      
      {lessons.length > 0 ? (
        <FlatList
          data={lessons}
          renderItem={renderLesson}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyTitle}>No lessons yet</Text>
          <Text style={styles.emptySubtitle}>
            Book your first lesson to start{"\n"}your driving journey!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  lessonCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  lessonType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
  lessonDate: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 4,
  },
  lessonDuration: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default LessonsScreen;