import axios from 'axios';

const api = axios.create({
    baseURL: '/careerhub/api/',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

const aiService = {
    async assist({ section, currentText, instruction, answers, format }) {
        const res = await api.post('ai/assist', { section, currentText, instruction, answers, format });
        return res.data;
    },

    async analyzeAts({ resumeText, targetRole }) {
        const res = await api.post('ai/ats-analyze', { resumeText, targetRole });
        return res.data;
    },

    async getAtsHistory(page = 0, size = 20) {
        const res = await api.get(`ai/ats-history?page=${page}&size=${size}`);
        return res.data;
    },

    async getAtsHistoryItem(id) {
        const res = await api.get(`ai/ats-history/${id}`);
        return res.data;
    },

    async tailorResume({ resumeText, jobDescription, section }) {
        const res = await api.post('ai/tailor', { resumeText, jobDescription, section });
        return res.data;
    },

    async searchVault(query = '') {
        const res = await api.get(`ai/vault/experiences?query=${encodeURIComponent(query)}`);
        return res.data;
    },
};

export default aiService;
