import http from 'k6/http';
// Если тебе нужно явно указывать тип ответа в коде (например, для переменной):
//import { Response } from 'k6/http'; 
import { check /*fail*/ } from 'k6';
import { Config } from '../config';
import { DataFactory } from '../generators/data-factory';
import { BaseApiService } from './base-api-services';


export class IncomeDocumentService extends BaseApiService {
    

    constructor(token: string)
    {        
        super(token);
    }

    private getHeaders() {
        return {
            'Authorization': `Bearer ${this._accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
    }

    /**
     * Получение sysId типа документа (аналог GetDocumentTypeModel)
     */
    getDocumentTypeSysId(documentType: string): string | null {
        const url = `${this.baseUrl}api/farvater/data/v1/classifiers/ROOTNODE_ORD_DOCUMENTTYPE/children`;
        const res = http.get(url, { headers: this.getHeaders() });

        if (res.status !== 200) {
            console.error(`[API] Ошибка получения типов документов: ${res.status}`);
            return null;
        }

        const items = res.json() as any[];
        const element = items.find(i => i.description === documentType || i.sysId === documentType);

        return element ? element.sysId : null;
    }

    /**
     * Создание документа (аналог CreateIncomeDocumentRequestAsync)
     */
    createIncomeDocument(senderHandle: string) {
        const url = `${this.baseUrl}api/farvater/data/v1/incoming`;
        const payload = JSON.stringify(DataFactory.generateIncomeDocumentModel(senderHandle));

        const res = http.post(url, payload, { headers: this.getHeaders() });

        check(res, {
            'Income document created': (r) => r.status === 200 || r.status === 201,
        });

        if (res.status !== 200 && res.status !== 201) {
            console.error(`[API] Ошибка создания документа: ${res.status}. Body: ${res.body}`);
            return null;
        }

        const body = res.json() as { handle: string };
        console.info(`[API] Входящий документ создан. Handle: ${body.handle}`);
        return body.handle;
    }

    /**
     * Удаление документа (аналог DeleteIncomeDocumentAsync)
     */
    deleteIncomeDocument(handle: string) {
        if (!handle) return;

        const cleanHandle = handle.replace(/[{}]/g, '');
        const url = `${this.baseUrl}api/farvater/data/v1/incoming/${cleanHandle}`;

        const res = http.del(url, null, { headers: this.getHeaders() });

        console.info(`[API] Результат удаления ${cleanHandle}: ${res.status}`);
        
        check(res, {
            'Document deleted successfully': (r) => r.status === 200 || r.status === 204,
        });
    }
}