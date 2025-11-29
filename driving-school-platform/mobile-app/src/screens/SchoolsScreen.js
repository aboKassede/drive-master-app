import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import api from '../services/api';

const SchoolsScreen = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const response = await api.get('/schools/');
      setSchools(response.data);
    } catch (error) {
      console.error('Failed to load schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinSchool = async (schoolId) => {
    try {
      await api.post(`/schools/${schoolId}/join`);
      Alert.alert('Success', 'Join request sent! Wait for school approval.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send join request');
    }
  };

  const renderSchool = ({ item }) => (
    <View style={styles.schoolCard}>
      <Text style={styles.schoolName}>{item.name}</Text>
      <Text style={styles.schoolAddress}>{item.address}, {item.city}</Text>
      <Text style={styles.schoolPhone}>📞 {item.phone}</Text>
      {item.description && (
        <Text style={styles.schoolDescription}>{item.description}</Text>
      )}
      
      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => joinSchool(item.id)}
      >
        <Text style={styles.joinButtonText}>Request to Join</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading schools...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={schools}
        renderItem={renderSchool}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 24,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#64748B',
  },
  schoolCard: {
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
  schoolName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  schoolAddress: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 4,
  },
  schoolPhone: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  schoolDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  joinButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SchoolsScreen;