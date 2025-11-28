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

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading lessons...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Lessons</Text>
      <FlatList
        data={lessons}
        renderItem={renderLesson}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  lessonCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  lessonType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  lessonDate: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  lessonStatus: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 5,
  },
});

export default LessonsScreen;