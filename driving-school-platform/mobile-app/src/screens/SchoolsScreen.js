import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { studentAPI } from '../services/api';

const SchoolsScreen = ({ navigation }) => {
  const [schools, setSchools] = useState([]);
  const [mySchool, setMySchool] = useState(null);
  const [schoolStatus, setSchoolStatus] = useState('no_school');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joiningSchool, setJoiningSchool] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userResponse = await studentAPI.getProfile();
      if (userResponse.data) {
        setCurrentUser(userResponse.data);
        console.log('Current user:', userResponse.data);
      }
    } catch (error) {
      console.log('Could not load user data:', error);
      // Set default user if profile fails
      setCurrentUser({
        first_name: 'Student',
        last_name: 'User', 
        email: 'student@example.com',
        phone: '+1234567890'
      });
    }
  };

  const loadData = async () => {
    try {
      const [schoolsResponse, mySchoolResponse] = await Promise.all([
        studentAPI.getAvailableSchools(),
        studentAPI.getMySchool()
      ]);
      
      const schools = schoolsResponse.data.schools || [];
      // Ensure services is always an array
      const processedSchools = schools.map(school => {
        let services = school.services || [];
        // If services is a string, convert to array
        if (typeof services === 'string') {
          services = services.split(',').map(s => s.trim()).filter(s => s.length > 0);
        }
        // If services is not an array, make it an empty array
        if (!Array.isArray(services)) {
          services = [];
        }
        
        return {
          ...school,
          services: services,
          average_rating: school.average_rating || 0
        };
      });
      
      console.log('Processed schools:', processedSchools);
      console.log('School status:', schoolStatus);
      setSchools(processedSchools);
      setMySchool(mySchoolResponse.data.school);
      setSchoolStatus(mySchoolResponse.data.status);
    } catch (error) {
      console.error('Failed to load schools:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleJoinSchool = async (school) => {
    if (joiningSchool) return; // Prevent multiple requests
    
    console.log('Join school button pressed for:', school.name);
    try {
      Alert.alert(
        'Join School',
        `Do you want to request to join ${school.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Join',
            onPress: async () => {
              setJoiningSchool(true);
              console.log('User confirmed join request');
              try {
                const userName = currentUser ? 
                  `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() : 
                  'Unknown User';
                
                const requestData = {
                  school_id: school.id,
                  message: `I would like to join ${school.name} for driving lessons.`,
                  student_name: userName,
                  student_email: currentUser?.email || 'unknown@email.com',
                  student_phone: currentUser?.phone || 'No phone'
                };
                console.log('Sending request with data:', requestData);
                
                const response = await studentAPI.requestSchoolJoin(requestData);
                
                console.log('API Response:', response);
                
                if (response && response.data && response.data.message) {
                  Alert.alert('Success', 'Your request has been sent to the school!');
                  setSchoolStatus('pending'); // Update status locally
                  loadData(); // Reload data to reflect changes
                } else {
                  Alert.alert('Error', 'Failed to send request');
                }
              } catch (apiError) {
                console.error('API Error:', apiError);
                Alert.alert('Error', 'Failed to send join request');
              } finally {
                setJoiningSchool(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Join school error:', error);
      Alert.alert('Error', 'Failed to send join request');
    }
  };

  const renderSchool = ({ item }) => (
    <View style={styles.schoolCard}>
      <View style={styles.schoolHeader}>
        <Text style={styles.schoolName}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {(item.average_rating || 0).toFixed(1)}</Text>
        </View>
      </View>
      
      <Text style={styles.schoolAddress}>{item.address}</Text>
      <Text style={styles.schoolPhone}>📞 {item.phone}</Text>
      
      {item.description && (
        <Text style={styles.schoolDescription}>{item.description}</Text>
      )}
      
      {(item.services || []).length > 0 && (
        <View style={styles.servicesContainer}>
          <Text style={styles.servicesTitle}>Services:</Text>
          <View style={styles.servicesList}>
            {(item.services || []).slice(0, 3).map((service, index) => (
              <Text key={index} style={styles.serviceTag}>{service}</Text>
            ))}
          </View>
        </View>
      )}
      
      <View style={styles.statsContainer}>
        <Text style={styles.stat}>👥 {item.total_students} students</Text>
        <Text style={styles.stat}>👨‍🏫 {item.total_instructors} instructors</Text>
      </View>
      
      {schoolStatus === 'no_school' && (
        <TouchableOpacity 
          style={[styles.joinButton, joiningSchool && styles.joinButtonDisabled]}
          onPress={() => handleJoinSchool(item)}
          disabled={joiningSchool}
        >
          <Text style={styles.joinButtonText}>
            {joiningSchool ? 'Sending...' : 'Request to Join'}
          </Text>
        </TouchableOpacity>
      )}
      {schoolStatus === 'pending' && (
        <View style={styles.pendingButton}>
          <Text style={styles.pendingButtonText}>⏳ Request Pending</Text>
        </View>
      )}
    </View>
  );

  const renderMySchool = () => {
    if (!mySchool) return null;
    
    return (
      <View style={styles.mySchoolContainer}>
        <Text style={styles.sectionTitle}>My School</Text>
        <View style={[styles.schoolCard, styles.mySchoolCard]}>
          <View style={styles.schoolHeader}>
            <Text style={styles.schoolName}>{mySchool.name}</Text>
            <View style={[styles.statusBadge, 
              schoolStatus === 'approved' ? styles.approvedBadge : 
              schoolStatus === 'pending' ? styles.pendingBadge : styles.rejectedBadge
            ]}>
              <Text style={styles.statusText}>
                {schoolStatus === 'approved' ? '✅ Approved' : 
                 schoolStatus === 'pending' ? '⏳ Pending' : '❌ Rejected'}
              </Text>
            </View>
          </View>
          <Text style={styles.schoolAddress}>{mySchool.address}</Text>
          <Text style={styles.schoolPhone}>📞 {mySchool.phone}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading schools...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {schools.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          {renderMySchool()}
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏢</Text>
            <Text style={styles.emptyTitle}>No Schools Available</Text>
            <Text style={styles.emptyText}>
              No driving schools are currently available. Pull down to refresh or contact support.
            </Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={() => {
                setRefreshing(true);
                loadData();
              }}
            >
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={schools}
          renderItem={renderSchool}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderMySchool}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => {
              setRefreshing(true);
              loadData();
            }} />
          }
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  mySchoolContainer: {
    marginBottom: 24,
  },
  mySchoolCard: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  schoolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rating: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  approvedBadge: {
    backgroundColor: '#D1FAE5',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  rejectedBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  servicesContainer: {
    marginBottom: 12,
  },
  servicesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceTag: {
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stat: {
    fontSize: 14,
    color: '#64748B',
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
  joinButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  pendingButton: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  pendingButtonText: {
    color: '#92400E',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SchoolsScreen;