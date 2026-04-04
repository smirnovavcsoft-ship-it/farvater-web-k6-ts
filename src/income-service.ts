import http from 'k6/http';
import { BaseService } from './base-service';
import { DataFactory } from './data-factory';

const API_BASE_URL = 'http://your-farvater-url.com/';

export class IncomeService {
    token: string;

    constructor(token: string) {
        this.token = token;
    }

    // Аналог GetDocumentTypeModel
    getSysIdByType(description: string) {
        const url = `${API_BASE_URL}api/farvater/data/v1/classifiers/ROOTNODE_ORD_DOCUMENTTYPE/children`;
        const res = http.get(url, BaseService.getAuthHeaders(this.token));
        
        const body = res.json() as any[];
        const item = body.find(i => i.description === description || i.sysId === description);
        return item ? item.sysId : null;
    }

    // Аналог CreateIncomeDocumentRequestAsync
    createDocument(senderHandle: string) {
        const url = `${API_BASE_URL}api/farvater/data/v1/incoming`;
        const payload = JSON.stringify(DataFactory.generateIncomeDocument(senderHandle));
        
        const res = http.post(url, payload, BaseService.getAuthHeaders(this.token));
        return res;
    }
}