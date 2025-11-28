import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async getToken() {
    return await AsyncStorage.getItem('access_token');
  },

  async getUserType() {
    return await AsyncStorage.getItem('user_type');
  },

  async setAuthData(token, userType) {
    await AsyncStorage.setItem('access_token', token);
    await AsyncStorage.setItem('user_type', userType);
  },

  async clearAuthData() {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('user_type');
  },

  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }
};