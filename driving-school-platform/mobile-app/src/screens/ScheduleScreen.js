import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { studentAPI } from '../services/api';

const ScheduleScreen = ({ navigation }) => {
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [lessonType, setLessonType] = useState('driving');
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [schoolStatus, setSchoolStatus] = useState('no_school');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [instructorsResponse, schoolResponse] = await Promise.all([
        studentAPI.getInstructors(),
        studentAPI.getMySchool()
      ]);
      
      setInstructors(instructorsResponse.data || []);
      setSchoolStatus(schoolResponse.data.status);
      
      if (instructorsResponse.data && instructorsResponse.data.length > 0) {
        setSelectedInstructor(instructorsResponse.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleBookLesson = async () => {
    if (schoolStatus !== 'approved') {
      Alert.alert('Error', 'You must be approved by a school before booking lessons');
      return;
    }
    
    if (!selectedInstructor) {
      Alert.alert('Error', 'Please select an instructor');
      return;
    }

    try {
      setLoading(true);
      
      const scheduledDateTime = new Date(
        selectedDate + 'T' + selectedTime + ':00.000Z'
      );

      const lessonData = {
        instructor_id: selectedInstructor,
        lesson_type: lessonType,
        scheduled_date: scheduledDateTime.toISOString(),
        duration_minutes: duration,
        message: `Lesson booking request for ${lessonType} lesson`
      };

      const response = await studentAPI.bookLesson(lessonData);
      
      if (response.data) {
        Alert.alert(
          'Success', 
          'Lesson request sent! Wait for instructor approval.',
          [{ text: 'OK', onPress: () => navigation.navigate('Lessons') }]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to book lesson');
    } finally {
      setLoading(false);
    }
  };



  if (schoolStatus !== 'approved') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notApprovedContainer}>
          <Text style={styles.notApprovedIcon}>🏢</Text>
          <Text style={styles.notApprovedTitle}>School Approval Required</Text>
          <Text style={styles.notApprovedText}>
            You need to be approved by a driving school before you can book lessons.
          </Text>
          <TouchableOpacity 
            style={styles.goToSchoolsButton}
            onPress={() => navigation.navigate('Schools')}
          >
            <Text style={styles.goToSchoolsButtonText}>Find Schools</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Book a Lesson</Text>
        
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
          <Text style={styles.sectionTitle}>Lesson Type</Text>
          <Picker
            selectedValue={lessonType}
            onValueChange={setLessonType}
            style={styles.picker}
          >
            <Picker.Item label="Driving Lesson" value="driving" />
            <Picker.Item label="Theory Lesson" value="theory" />
            <Picker.Item label="Highway Driving" value="highway" />
            <Picker.Item label="Parking Practice" value="parking" />
            <Picker.Item label="Mock Test" value="mock_test" />
          </Picker>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <Picker
            selectedValue={duration}
            onValueChange={setDuration}
            style={styles.picker}
          >
            <Picker.Item label="45 minutes" value={45} />
            <Picker.Item label="60 minutes" value={60} />
            <Picker.Item label="90 minutes" value={90} />
            <Picker.Item label="120 minutes" value={120} />
          </Picker>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TouchableOpacity style={styles.dateButton}>
            <Text style={styles.dateText}>{selectedDate}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <Picker
            selectedValue={selectedTime}
            onValueChange={setSelectedTime}
            style={styles.picker}
          >
            <Picker.Item label="9:00 AM" value="09:00" />
            <Picker.Item label="10:00 AM" value="10:00" />
            <Picker.Item label="11:00 AM" value="11:00" />
            <Picker.Item label="1:00 PM" value="13:00" />
            <Picker.Item label="2:00 PM" value="14:00" />
            <Picker.Item label="3:00 PM" value="15:00" />
            <Picker.Item label="4:00 PM" value="16:00" />
            <Picker.Item label="5:00 PM" value="17:00" />
          </Picker>
        </View>

        <TouchableOpacity
          style={[styles.bookButton, loading && styles.disabledButton]}
          onPress={handleBookLesson}
          disabled={loading}
        >
          <Text style={styles.bookButtonText}>
            {loading ? 'Booking...' : 'Send Booking Request'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 24,
  },
  notApprovedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notApprovedIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  notApprovedTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  notApprovedText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  goToSchoolsButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goToSchoolsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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