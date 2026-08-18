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
};

export default resumeCheckerService;
