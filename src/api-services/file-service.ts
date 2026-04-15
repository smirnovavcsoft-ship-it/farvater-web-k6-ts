import http from 'k6/http';
import { check } from 'k6';
import { BaseApiService } from './base-api-services';

export class FileService extends BaseApiService {
    
    constructor(token: string) {
        super(token);
    }

    /**
     * Загрузка файла и прикрепление его к документу
     * @param documentHandle - хендл документа, к которому цепляем файл
     * @param fileData - содержимое файла (бинарное или строка)
     */
    uploadAttachment(documentHandle: string, fileData: any, fileName: string) {
        // Убираем фигурные скобки из хендла, если они есть
        const cleanHandle = documentHandle.replace(/[{}]/g, '');
        
        // Путь может отличаться в зависимости от API Фарватера, 
        // обычно это /incoming/{id}/attachments или специальный upload-сервис
        const url = `${this.baseUrl}api/farvater/data/v1/incoming/${cleanHandle}/attachments`;

        const data = {
            // Формируем multipart/form-data
            file: http.file(fileData, fileName),
        };

        const res = http.post(url, data, {
            headers: {
                'Authorization': `Bearer ${this._accessToken}`,
                // Content-Type указывать НЕ НУЖНО, k6 сам поставит multipart/form-data с границами
            },
        });

        check(res, {
            'Attachment upload status is 200/201': (r) => r.status === 200 || r.status === 201,
            'Attachment has ID': (r) => r.json('id') !== null,
        });

        return res;
    }
}