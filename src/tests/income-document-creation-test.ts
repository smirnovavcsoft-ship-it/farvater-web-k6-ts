import http from 'k6/http';
import { check } from 'k6';

import { BaseApiService } from '../api-services/base-api-services';
import { Config } from 'config';

export class IncomeDocumentService extends BaseApiService {
    
    constructor(token: string | null = null) {
        super(token);
    }

    /**
     * Получение sysId типа документа (аналог GetDocumentTypeModel)
     */
    public getDocumentTypeSysId(documentType: string): string | null {
        const url = `${Config.env.baseUrl}api/farvater/data/v1/classifiers/ROOTNODE_ORD_DOCUMENTTYPE/children`;
        
        const res = http.get(url, this.GetAuthHeaders());

        if (res.status !== 200) {
            console.error(`[API] Ошибка получения типов документов: ${res.status}`);
            return null;
        }

        const items = res.json() as any[];
        // Ищем элемент по описанию или sysId (как в твоем C# коде через LINQ)
        const element = items.find(i => i.description === documentType || i.sysId === documentType);

        return element ? element.sysId : null;
    }

    /**
     * Прямой запрос на создание (аналог CreateIncomeDocumentRequestAsync)
     */
    public createIncomeDocumentRequest(data: any) {
        const url = `${this.baseUrl}api/farvater/data/v1/incoming`;
        const payload = JSON.stringify(data);

        return http.post(url, payload, this.GetAuthHeaders());
    }

    /**
     * Основной метод подготовки и создания (аналог PrepareAndCreateIncomeDocumentAsync)
     */
    public prepareAndCreateIncomeDocument(senderHandle: string): string | null {
        // Генерируем модель данных через твой DataFactory
        const data = {};

        const response = this.createIncomeDocumentRequest(data);

        if (response.status === 200 || response.status === 201) {
            const body = response.json() as { handle: string };
            console.info(`[API] Входящий документ создан. Handle: ${body.handle}`);
            return body.handle;
        } else {
            const errorText = response.body ? response.body.toString() : "No body";
            console.error(`[API] Ошибка при создании входящего документа: ${response.status}. Ответ: ${errorText}`);
            return null;
        }
    }

    /**
     * Удаление документа (аналог DeleteIncomeDocumentAsync)
     */
    public deleteIncomeDocument(handle: string | null) {
        if (!handle) {
            console.warn("[API] Попытка удаления входящего документа: Handle пустой.");
            return;
        }

        const cleanHandle = handle.replace(/[{}]/g, '');
        const url = `${this.baseUrl}api/farvater/data/v1/incoming/${cleanHandle}`;

        const res = http.del(url, null, this.GetAuthHeaders());

        console.info(`[API] Результат удаления входящего документа ${cleanHandle}: ${res.status}`);
        
        check(res, {
            'Income document deleted': (r) => r.status === 200 || r.status === 204,
        });

        return res;
    }
}

