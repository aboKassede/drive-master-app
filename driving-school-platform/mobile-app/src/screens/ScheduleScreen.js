import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const ScheduleScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleBookLesson = () => {
    Alert.alert('Book Lesson', 'Lesson booking functionality coming soon!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule Lesson</Text>
      
      <View style={styles.dateSection}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <Text style={styles.selectedDate}>
          {selectedDate.toDateString()}
        </Text>
      </View>

      <TouchableOpacity style={styles.bookButton} onPress={handleBookLesson}>
        <Text style={styles.bookButtonText}>Book Lesson</Text>
      </TouchableOpacity>
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
    marginBottom: 30,
    color: '#333',
  },
  dateSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  selectedDate: {
    fontSize: 16,
    color: '#666',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ScheduleScreen;