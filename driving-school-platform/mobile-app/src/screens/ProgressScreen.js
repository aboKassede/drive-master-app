import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { studentAPI } from '../services/api';

const ProgressScreen = () => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const [refreshing, setRefreshing] = useState(false);

  const loadProgress = async () => {
    try {
      const response = await studentAPI.getProgress();
      setProgress(response.data);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProgress();
  };

  const getProgressPercentage = () => {
    if (!progress || progress.total_lessons === 0) return 0;
    return Math.round((progress.completed_lessons / progress.total_lessons) * 100);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>My Progress</Text>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Learning Progress</Text>
            <Text style={styles.progressPercentage}>{getProgressPercentage()}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${getProgressPercentage()}%` }]} />
          </View>
          <Text style={styles.progressSubtext}>
            {progress?.completed_lessons || 0} of {progress?.total_lessons || 0} lessons completed
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{progress?.total_lessons || 0}</Text>
            <Text style={styles.statLabel}>Total Lessons</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{progress?.completed_lessons || 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {progress?.average_rating ? progress.average_rating.toFixed(1) : '0.0'}
            </Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>

        {/* Recent Progress */}
        {progress?.progress_entries && progress.progress_entries.length > 0 ? (
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Recent Progress</Text>
            
            {progress.progress_entries.slice(0, 5).map((entry, index) => (
              <View key={index} style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressDate}>
                    {new Date(entry.created_at).toLocaleDateString()}
                  </Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>⭐ {entry.performance_rating || 'N/A'}/5</Text>
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
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No Progress Yet</Text>
            <Text style={styles.emptySubtitle}>
              Complete some lessons to see your progress!
            </Text>
          </View>
        )}
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 14,
    color: '#64748B',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
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