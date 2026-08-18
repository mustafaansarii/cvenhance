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
};

export default aiService;
