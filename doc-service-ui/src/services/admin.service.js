import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: '/careerhub/api/admin/',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// params: { page, size, keyword, sortBy, direction }
class AdminService {
    async listUsers(params) {
        const res = await axiosInstance.get('users', { params });
        return res.data;
    }

    async updateUsers(updates) {
        const res = await axiosInstance.patch('users', updates);
        return res.data;
    }

    async listTemplates(params) {
        const res = await axiosInstance.get('templates', { params });
        return res.data;
    }

    async updateTemplates(updates) {
        const res = await axiosInstance.patch('templates', updates);
        return res.data;
    }

    async listUserDocs(params) {
        const res = await axiosInstance.get('user-docs', { params });
        return res.data;
    }

    async updateUserDocs(updates) {
        const res = await axiosInstance.patch('user-docs', updates);
        return res.data;
    }

    async listAudit(params) {
        const res = await axiosInstance.get('audit-events', { params });
        return res.data;
    }
}

export default new AdminService();
