import http from 'k6/http';
import { ConfigurationReader } from '../configuration/configuration-reader';

export class BaseApiService {
    protected _accessToken: string | null = null;

    /**
     * Логика авторизации аналогична LoginAsync в C#
     */
    public LoginAsync(): void {
        const url = `${ConfigurationReader.ApiBaseUrl}token?authType=TDMS`;
        
        const payload = {
            username: ConfigurationReader.Username,
            password: ConfigurationReader.Password,
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
    }

    /**
     * Аналог GetAuthHeaders()
     */
    protected GetAuthHeaders() {
        return {
            headers: {
                "Authorization": `Bearer ${this._accessToken}`,
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        };
    }
}