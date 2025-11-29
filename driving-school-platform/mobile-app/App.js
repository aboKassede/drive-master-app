import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import StudentDashboard from './src/screens/StudentDashboard';
import InstructorDashboard from './src/screens/InstructorDashboard';
import ScheduleScreen from './src/screens/ScheduleScreen';
import LessonsScreen from './src/screens/LessonsScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SchoolsScreen from './src/screens/SchoolsScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProgressScreen from './src/screens/ProgressScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: true,
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#1E293B',
          headerTitleStyle: { fontWeight: '600' }
        }}
      >
        {user ? (
          <>
            <Stack.Screen 
              name="Dashboard" 
              component={user.userType === 'instructor' ? InstructorDashboard : StudentDashboard}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Schedule" 
              component={ScheduleScreen}
              options={{ title: 'Book Lesson' }}
            />
            <Stack.Screen 
              name="Lessons" 
              component={LessonsScreen}
              options={{ title: 'My Lessons' }}
            />
            <Stack.Screen 
              name="Payment" 
              component={PaymentScreen}
              options={{ title: 'Payments' }}
            />
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen}
              options={{ title: 'Notifications' }}
            />
            <Stack.Screen 
              name="Schools" 
              component={SchoolsScreen}
              options={{ title: 'Driving Schools' }}
            />
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen}
              options={({ route }) => ({ title: route.params?.otherUserName || 'Chat' })}
            />
            <Stack.Screen 
              name="Progress" 
              component={ProgressScreen}
              options={{ title: 'My Progress' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ title: 'Create Account' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}