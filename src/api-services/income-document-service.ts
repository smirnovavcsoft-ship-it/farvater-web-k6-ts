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

    /*private getHeaders() {
        return {
            'Authorization': `Bearer ${this._accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
    }*/

    /**
     * Получение sysId типа документа (аналог GetDocumentTypeModel)
     */
    public getDocumentTypeSysId(documentType: string): string | null {
        
         if (!this._accessToken) {this.login();}
         const url = `${this.baseUrl}api/farvater/data/v1/classifiers/ROOTNODE_ORD_DOCUMENTTYPE/children`;
        const res = http.get(url, this.getAuthHeaders());

        /*if (res.status !== 200) {
            console.error(`[API] Ошибка получения типов документов: ${res.status}`);
            return null;
        }*/

        const items = res.json() as any[];
        const element = items.find(i => i.description === documentType || i.sysId === documentType);

        return element ? element.sysId : null;
    }

    /**
     * Создание документа (аналог CreateIncomeDocumentRequestAsync)
     */
    public createIncomeDocument(data: any) {
        if (!this._accessToken) {this.login();}
        const url = `${this.baseUrl}api/farvater/data/v1/incoming`;
        const payload = JSON.stringify(data);

        return http.post(url, payload, this.getAuthHeaders());

        /*check(response, {
            'Income document created': (r) => r.status === 200 || r.status === 201,
        });*/

        /*if (res.status !== 200 && res.status !== 201) {
            console.error(`[API] Ошибка создания документа: ${res.status}. Body: ${res.body}`);
            return null;
        }*/

       /* const body = res.json() as { handle: string };
        console.info(`[API] Входящий документ создан. Handle: ${body.handle}`);
        return body.handle;*/
    }

    public prepareIncomeDocument(senderHandle: string) {
        //if (!this._accessToken) {this.login();}
        //const url = `${this.baseUrl}api/farvater/data/v1/incoming`;
        //const payload = JSON.stringify(DataFactory.generateIncomeDocumentModel(senderHandle));

        

        

        const data = DataFactory.generateIncomeDocumentModel(senderHandle);
        const response = this.createIncomeDocument(data);

        check(response, {
            'Income document created': (r) => r.status === 200 || r.status === 201,
        });

        if (response.status !== 200 && response.status !== 201) {
            console.error(`[API] Ошибка создания документа: ${response.status}. Body: ${response.body}`);
            return null;
        }

        const body = response.json() as { handle: string };
        console.info(`[API] Входящий документ создан. Handle: ${body.handle}`);
        console.info(`[API] Status: ${response.status}`)
        return body.handle;
    }

    

    /**
     * Удаление документа (аналог DeleteIncomeDocumentAsync)
     */
    public deleteIncomeDocument(handle: string) {
        if (!handle) return;

        const cleanHandle = handle.replace(/[{}]/g, '');
        const url = `${this.baseUrl}api/farvater/data/v1/incoming/${cleanHandle}`;

        const res = http.del(url, null, this.getAuthHeaders() );

        console.info(`[API] Результат удаления ${cleanHandle}: ${res.status}`);
        
        check(res, {
            'Document deleted successfully': (r) => r.status === 200 || r.status === 204,
        });
    }
}