import { OpenAPI } from './generated';

export function configureApi() {
    OpenAPI.BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';
    OpenAPI.WITH_CREDENTIALS = false; // flip if we add cookies/auth later
}