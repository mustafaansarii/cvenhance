import axios from 'axios';

const api = axios.create({
    baseURL: '/careerhub/api/',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// Separate instance with NO default Content-Type so the browser sets multipart boundaries.
const upload = axios.create({ baseURL: '/careerhub/api/', withCredentials: true });

const resumeCheckerService = {
    /** Runs the deterministic analysis. Sends the original file so history can render the real PDF. */
    async checkResume({ resumeText, file }) {
        const form = new FormData();
        form.append('resumeText', resumeText);
        if (file) form.append('file', file);
        const res = await upload.post('ai/resume-check', form);
        return res.data; // { overallScore, categories }
    },

    async getHistory(page = 0, size = 10) {
        const res = await api.get(`ai/resume-check/history?page=${page}&size=${size}`);
        return res.data; // Spring Page<ResumeCheckHistory> (incl. resumeFileUrl, resumeFileType, resumeSnapshot)
    },

    async getHistoryItem(id) {
        const res = await api.get(`ai/resume-check/history/${id}`);
        return res.data;
    },
};

export default resumeCheckerService;
