import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import api from '../services/api';

const ProgressScreen = () => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      // Get current user's progress
      const response = await api.get('/progress/student/me');
      setProgress(response.data);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
      </View>
    );
  }

  if (!progress) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No Progress Yet</Text>
          <Text style={styles.emptySubtitle}>
            Complete some lessons to see your progress!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{progress.total_lessons}</Text>
          <Text style={styles.statLabel}>Total Lessons</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{progress.completed_lessons}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{progress.average_rating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Recent Progress</Text>
        
        {progress.progress_entries.map((entry, index) => (
          <View key={index} style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressDate}>
                {new Date(entry.created_at).toLocaleDateString()}
              </Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>⭐ {entry.performance_rating}/5</Text>
              </View>
            </View>
            
            {entry.notes && (
              <Text style={styles.progressNotes}>{entry.notes}</Text>
            )}
            
            {entry.skills_practiced && entry.skills_practiced.length > 0 && (
              <View style={styles.skillsContainer}>
                <Text style={styles.skillsTitle}>Skills Practiced:</Text>
                {entry.skills_practiced.map((skill, idx) => (
                  <Text key={idx} style={styles.skillItem}>• {skill}</Text>
                ))}
              </View>
            )}
            
            {entry.areas_to_improve && entry.areas_to_improve.length > 0 && (
              <View style={styles.improvementContainer}>
                <Text style={styles.improvementTitle}>Areas to Improve:</Text>
                {entry.areas_to_improve.map((area, idx) => (
                  <Text key={idx} style={styles.improvementItem}>• {area}</Text>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loader: {
    marginTop: 50,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
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
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  progressSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  ratingContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  progressNotes: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 8,
  },
  skillsContainer: {
    marginTop: 8,
  },
  skillsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 4,
  },
  skillItem: {
    fontSize: 14,
    color: '#064E3B',
    marginLeft: 8,
  },
  improvementContainer: {
    marginTop: 8,
  },
  improvementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 4,
  },
  improvementItem: {
    fontSize: 14,
    color: '#7F1D1D',
    marginLeft: 8,
  },
});

export default ProgressScreen;