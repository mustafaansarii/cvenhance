import axios from 'axios';

const api = axios.create({
    baseURL: '/careerhub/api/resume-builder/',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

const resumeBuilderService = {
    async listTemplates() {
        const response = await api.get('templates');
        return response.data;
    },

    async getTemplate(code) {
        const response = await api.get(`templates/${encodeURIComponent(code)}`);
        return response.data;
    },

    async openDocument(code) {
        const response = await api.post(`documents/by-template/${encodeURIComponent(code)}`);
        return response.data;
    },

    async saveDocument(id, { name, resumeData, sectionOrder, editorSettings }) {
        const response = await api.patch(`documents/${id}`, { name, resumeData, sectionOrder, editorSettings });
        return response.data;
    },

    async claimDocument(id) {
        const response = await api.post(`documents/${id}/claim`);
        return response.data;
    },
};

export default resumeBuilderService;
