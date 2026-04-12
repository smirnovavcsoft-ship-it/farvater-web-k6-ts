import http from 'k6/http';
//import { ConfigurationReader } from '../configuration/configuration-reader';
import { Config } from '../config';

export class BaseApiService {
    protected _accessToken: string | null = null;
    protected baseUrl: string;

    constructor(token: string | null = null) {
        this.baseUrl = Config.env.apiBaseUrl;
        this._accessToken = token;
    }

    /**
     * Логика авторизации аналогична LoginAsync в C#
     */
    public login(): string {
        const url = `${Config.env.apiBaseUrl}token?authType=TDMS`;
        
        const payload = {
            username: Config.credentials.username,
            password: Config.credentials.password,
            grant_type: "password",
            client_id: "Web",
            authType: "TDMS"
        };

        const params = {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        };

        const response = http.post(url, payload, params);

        if (response.status !== 200) {
            throw new Error(`[API] Login Failed. Status: ${response.status}. Body: ${response.body}`);
        }

        const json = response.json() as any;
        this._accessToken = json.access_token;
        return this._accessToken!;
    }

    /**
     * Аналог GetAuthHeaders()
     */
    public getAuthHeaders() {
        return {
            headers: {
                "Authorization": `Bearer ${this._accessToken}`,
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        };
    }
}