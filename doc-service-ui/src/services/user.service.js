import axios from 'axios';

const API_URL = '/careerhub/api/users/';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

class UserService {
  async getProfile() {
    const response = await axiosInstance.get('/careerhub/api/auth/me', { baseURL: '' });
    return response.data;
  }

  /** Persist the user's structured resume/profile details (free-form JSON). Returns updated UserResponse. */
  async updateProfile(profileData) {
    const response = await axiosInstance.patch('/careerhub/api/auth/profile', profileData, { baseURL: '' });
    return response.data;
  }

  async deleteAccount() {
    const response = await axiosInstance.delete('/careerhub/api/auth/delete-account', { baseURL: '' });
    return response.data;
  }
}

export default new UserService();

