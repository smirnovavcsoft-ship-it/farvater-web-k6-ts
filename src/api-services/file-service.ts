import http from 'k6/http';
import { check } from 'k6';
import { BaseApiService } from './base-api-services';

export class FileService extends BaseApiService {

    uploadAndAttachFile(objectHandle: string, fileData: any, fileName: string) {
        // --- ШАГ 1: Загрузка в общее хранилище ---
        const storageUrl = `${this.baseUrl}api/farvater/data/v1/files/storage`;
        
        const storageRes = http.put(storageUrl, fileData, {
            headers: {
                'Authorization': `Bearer ${this._accessToken}`,
                'Content-Type': 'application/octet-stream',
            }
        });

        check(storageRes, {
            'Storage upload status 200': (r) => r.status === 200,
        });

        // Парсим handle из первого элемента массива
        const responseData = storageRes.json();
        // @ts-ignore
        const fileHandle = responseData[0].handle;

        if (!fileHandle) {
            console.error('File handle not found in response');
            return storageRes;
        }

        // --- ШАГ 2: Привязка файла к объекту ---
        // Используем полученный fileHandle и переданный objectHandle (документа)
        const cleanObjHandle = objectHandle.replace(/[{}]/g, '');
        const cleanFileHandle = fileHandle.replace(/[{}]/g, '');
        
        const attachUrl = `${this.baseUrl}api/farvater/data/v1/files/storage/${cleanFileHandle}/objects/${cleanObjHandle}?type=FILEDEF_SECOND`;

        // Отправляем пустой PUT для связки
        const attachRes = http.put(attachUrl, null, {
            headers: { 'Authorization': `Bearer ${this._accessToken}` }
        });

        check(attachRes, {
            'File linked to document': (r) => r.status === 200 || r.status === 204,
        });

        return attachRes;
    }
}