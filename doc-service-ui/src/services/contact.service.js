import axios from 'axios';

const api = axios.create({
    baseURL: '/careerhub/api/',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

const contactService = {
    async submit({ name, email, message }) {
        const res = await api.post('contact', { name, email, message });
        return res.data;
    },
};

export default contactService;
