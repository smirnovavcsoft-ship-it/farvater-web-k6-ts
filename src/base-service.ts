import http from 'k6/http';
import { check } from 'k6';

const API_BASE_URL = 'http://your-farvater-url.com/'; // Взять из appsettings.json

export class BaseService {
    static login() {
        const url = `${API_BASE_URL}token?authType=TDMS`;
        
        const payload = {
            username: "SYSADMIN",
            password: "",
            grant_type: "password",
            client_id: "Web",
            authType: "TDMS"
        };

        const params = {
            headers: { 'Accept': 'application/json; charset=utf-8' },
        };

        const res = http.post(url, payload, params);
        
        check(res, {
            'login success': (r) => r.status === 200,
        });

        return res.json('access_token') as string;
    }

    static getAuthHeaders(token: string) {
        return {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        };
    }
}