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

  async updateProfile(profileData) {
    const response = await axiosInstance.patch('/careerhub/api/auth/profile', profileData, { baseURL: '' });
    return response.data;
  }

  // Text is extracted on the client; JD is optional and tailors the result via AI.
  async importResume(resumeText, jobDescription) {
    const response = await axiosInstance.post(
      '/careerhub/api/profile/import-resume',
      { resumeText, jobDescription: jobDescription || undefined },
      { baseURL: '' },
    );
    return response.data;
  }

  async deleteAccount() {
    const response = await axiosInstance.delete('/careerhub/api/auth/delete-account', { baseURL: '' });
    return response.data;
  }
}

export default new UserService();

