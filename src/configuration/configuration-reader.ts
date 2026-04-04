// @ts-ignore
const rawConfig = JSON.parse(open("../../appsettings.json"));

export class ConfigurationReader {
    private static _configuration = rawConfig;

    /**
     * Получает базовый URL для API запросов
     */
    public static get ApiBaseUrl(): string {
        return this._configuration.PlaywrightSettings.ApiBaseUrl;
    }

    /**
     * Получает базовый URL из секции PlaywrightSettings
     */
    public static get BaseUrl(): string {
        return this._configuration.PlaywrightSettings.BaseUrl;
    }

    /**
     * Получает тип браузера ("Chromium", "Firefox" или "WebKit")
     */
    public static get BrowserType(): string {
        return this._configuration.PlaywrightSettings.BrowserType;
    }

    /**
     * Получает настройку Headless (true/false)
     */
    public static get Headless(): boolean {
        return typeof this._configuration.PlaywrightSettings.Headless === 'string' 
            ? this._configuration.PlaywrightSettings.Headless.toLowerCase() === 'true'
            : Boolean(this._configuration.PlaywrightSettings.Headless);
    }

    /**
     * Получает имя пользователя из секции UserCredentials
     */
    public static get Username(): string {
        return this._configuration.UserCredentials.Username;
    }

    /**
     * Получает пароль из секции UserCredentials
     */
    public static get Password(): string {
        return this._configuration.UserCredentials.Password;
    }
}