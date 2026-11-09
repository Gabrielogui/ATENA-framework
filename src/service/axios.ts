import axios from 'axios';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://observatoriocti.secti.ba.gov.br/oda/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});