import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://54.157.242.59:8000/api/v1';
console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    return api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  
  register: (userData) => 
    api.post('/auth/register', userData),
};

export const studentAPI = {
  getProfile: () => api.get('/students/me'),
  updateProfile: (data) => api.put('/students/me', data),
  getUpcomingLessons: () => api.get('/lessons/upcoming'),
  getProgress: () => api.get('/progress/me'),
  getInstructors: () => api.get('/instructors'),
  getAvailableSchools: () => api.get('/schools/available'),
  getMySchool: () => api.get('/schools/my-school'),
  requestSchoolJoin: (data) => api.post('/booking/school/join', data),
  bookLesson: (data) => api.post('/booking/lesson', data),
  getMyBookings: () => api.get('/booking/my-requests'),
};

export const instructorAPI = {
  getProfile: () => api.get('/instructors/me'),
  updateProfile: (data) => api.put('/instructors/me', data),
  getPendingLessons: () => api.get('/instructor/pending-lessons'),
  acceptLesson: (lessonId) => api.put(`/booking/lesson/${lessonId}/accept`),
  rejectLesson: (lessonId, reason) => api.put(`/instructor/lessons/${lessonId}/reject`, { reason }),
};

export default api;