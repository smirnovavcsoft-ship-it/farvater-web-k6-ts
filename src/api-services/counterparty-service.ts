import http from 'k6/http';
import { check, sleep } from 'k6';
import { Config } from '../config';
import { DataFactory } from '../generators/data-factory';
import { BaseApiService } from './base-api-services';

export class CounterpartyService extends BaseApiService {
    
    constructor(token: string | null = null) {
        // Вызываем конструктор BaseApiService, чтобы инициализировать _accessToken и baseUrl
        super(token);
    }

    /**
     * Создание контрагента (аналог CreateCounterpartyAsync)
     */
    public createCounterparty(data: any) {
        const url = `${this.baseUrl}api/farvater/data/v1/contractors/legal`;
        
        const res = http.post(url, JSON.stringify(data), this.GetAuthHeaders());

        check(res, {
            'Counterparty created': (r) => r.status === 200 || r.status === 201,
        });

        return res;
    }

    /**
     * Подготовка контрагента с логикой и извлечением Handle (аналог PrepareCounterpartyAsync)
     */
    public prepareCounterparty(title: string, shortTitle: string, inn: string): string | null {
        const model = {
            fullTitle: title,
            shortTitle: shortTitle,
            inn: inn
        };

        const response = this.createCounterparty(model);

        if (response.status === 200 || response.status === 201) {
            const body = response.json() as { handle: string };
            console.info(`[API] Контрагент создан. Handle: ${body.handle}`);
            return body.handle;
        } else {
            console.error(`[API] Ошибка создания контрагента: ${response.status}`);
            return null;
        }
    }

    /**
     * Удаление контрагента (аналог DeleteCounterpartyAsync)
     */
    public deleteCounterparty(handle: string | null) {
        if (!handle) {
            console.warn("[API] Попытка удаления: Handle пустой.");
            return;
        }

        const cleanHandle = handle.replace(/[{}]/g, '');
        const url = `${this.baseUrl}api/farvater/data/v1/contractors/${cleanHandle}`;

        const res = http.del(url, null, this.GetAuthHeaders());

        console.info(`[API] Результат удаления контрагента ${cleanHandle}: ${res.status}`);
        
        check(res, {
            'Counterparty deleted': (r) => r.status === 200 || r.status === 204,
        });

        return res;
    }

    /**
     * Ожидание готовности контрагента (аналог PrepareCounterpartyWithRetryAsync)
     * В k6 это "Polling", используется для проверки записи в БД под нагрузкой
     */
    public waitForCounterpartyReady(handle: string): boolean {
        const cleanHandle = handle.replace(/[{}]/g, '');
        const url = `${this.baseUrl}api/farvater/data/v1/contractors/legal/${cleanHandle}`;
        
        let attempts = 0;
        const maxAttempts = 10; // Уменьшил для нагрузочного теста

        while (attempts < maxAttempts) {
            attempts++;
            const res = http.get(url, this.GetAuthHeaders());

            if (res.status === 200) {
                console.info(`[API] Контрагент ${handle} готов на попытке ${attempts}`);
                return true;
            }

            console.warn(`[API] Контрагент ${handle} еще не готов...`);
            sleep(1); // В k6 используем sleep вместо Task.Delay
        }

        return false;
    }
}