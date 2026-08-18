import axios from 'axios';

const api = axios.create({
    baseURL: '/careerhub/api/',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

const resumeCheckerService = {
    /** Runs the hybrid resume analysis. Requires an authenticated user (401/403 otherwise). */
    async checkResume({ resumeText, targetRole }) {
        const res = await api.post('ai/resume-check', { resumeText, targetRole });
        return res.data; // { overallScore, categories: [{ key, label, score, status, summary, findings }] }
    },

    async getHistory(page = 0, size = 20) {
        const res = await api.get(`ai/resume-check/history?page=${page}&size=${size}`);
        return res.data; // Spring Page<ResumeCheckHistory>
    },

    async getHistoryItem(id) {
        const res = await api.get(`ai/resume-check/history/${id}`);
        return res.data; // { overallScore, categories }
    },
};

export default resumeCheckerService;
