import axios from 'axios';

const api = axios.create({
    baseURL: '/careerhub/api/',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

const upload = axios.create({ baseURL: '/careerhub/api/', withCredentials: true });

const resumeCheckerService = {
    async checkResume({ resumeText, file }) {
        const form = new FormData();
        form.append('resumeText', resumeText);
        if (file) form.append('file', file);
        const res = await upload.post('ai/resume-check', form);
        return res.data;
    },

    async getHistory(page = 0, size = 10) {
        const res = await api.get(`ai/resume-check/history?page=${page}&size=${size}`);
        return res.data;
    },

    async getHistoryItem(id) {
        const res = await api.get(`ai/resume-check/history/${id}`);
        return res.data;
    },
};

export default resumeCheckerService;
