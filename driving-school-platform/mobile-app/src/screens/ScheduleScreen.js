import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';

const ScheduleScreen = () => {
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInstructors();
  }, []);

  useEffect(() => {
    if (selectedInstructor && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedInstructor, selectedDate]);

  const loadInstructors = async () => {
    try {
      const response = await api.get('/instructors/');
      setInstructors(response.data);
    } catch (error) {
      console.error('Failed to load instructors:', error);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/scheduling/available-slots?instructor_id=${selectedInstructor}&date=${selectedDate}`);
      setAvailableSlots(response.data.available_slots);
    } catch (error) {
      console.error('Failed to load slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookLesson = async () => {
    if (!selectedInstructor || !selectedSlot) {
      Alert.alert('Error', 'Please select instructor and time slot');
      return;
    }

    try {
      setLoading(true);
      const lessonData = {
        instructor_id: selectedInstructor,
        lesson_type: 'practical',
        scheduled_date: selectedSlot,
        duration_minutes: 60
      };

      await api.post('/lessons/', lessonData);
      Alert.alert('Success', 'Lesson booked successfully!');
      
      // Refresh available slots
      loadAvailableSlots();
      setSelectedSlot('');
    } catch (error) {
      Alert.alert('Error', 'Failed to book lesson');
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };



  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Instructor</Text>
        <Picker
          selectedValue={selectedInstructor}
          onValueChange={setSelectedInstructor}
          style={styles.picker}
        >
          <Picker.Item label="Choose instructor..." value="" />
          {instructors.map(instructor => (
            <Picker.Item
              key={instructor.id}
              label={`${instructor.first_name} ${instructor.last_name} - $${instructor.hourly_rate}/hr`}
              value={instructor.id}
            />
          ))}
        </Picker>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <TouchableOpacity style={styles.dateButton}>
          <Text style={styles.dateText}>{selectedDate}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Times</Text>
          <View style={styles.slotsContainer}>
            {availableSlots.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[styles.slotButton, selectedSlot === slot && styles.selectedSlot]}
                onPress={() => setSelectedSlot(slot)}
              >
                <Text style={[styles.slotText, selectedSlot === slot && styles.selectedSlotText]}>
                  {new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.bookButton, (!selectedSlot || loading) && styles.disabledButton]}
        onPress={handleBookLesson}
        disabled={!selectedSlot || loading}
      >
        <Text style={styles.bookButtonText}>
          {loading ? 'Booking...' : 'Book Lesson'}
        </Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#334155',
  },
  picker: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  dateButton: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  dateText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  slotButton: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    margin: 4,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    minWidth: 80,
  },
  selectedSlot: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  slotText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  selectedSlotText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loader: {
    marginVertical: 32,
  },
  bookButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ScheduleScreen;