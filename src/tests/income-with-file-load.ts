import { sleep, check } from 'k6';
import { Options } from 'k6/options';
import { BaseApiService } from '../api-services/base-api-services';
import { CounterpartyService } from '../api-services/counterparty-service';
import { IncomeDocumentService } from '../api-services/income-document-service';
import { FileService } from '../api-services/file-service';
import { FileGenerator } from '../generators/file-generator';

// Подготовка файла 1 МБ (средний размер скана одной-двух страниц)
const fileContent = FileGenerator.generateTextContent(1);

export const options: Options = {
    stages: [
        { duration: '30s', target: 5 },  // Плавный вход 5 пользователей
        { duration: '3m', target: 20 }, // Стабильная рабочая нагрузка (20 человек)
        { duration: '30s', target: 0 },  // Плавный выход
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],   // Ожидаем 100% успех
        http_req_duration: ['p(95)<2000'], // 95% запросов должны быть быстрее 2 сек
    },
};

export default function () {
    const api = new BaseApiService();
    const token = api.login();
    
    if (!token) return;

    const counterparty = new CounterpartyService(token);
    const incomeDocument = new IncomeDocumentService(token);
    const file = new FileService(token);

    // 1. Создание контрагента
    const cpHandle = counterparty.prepareCounterparty();
    
    if (cpHandle) {
        // 2. Создание документа
        const docHandle = incomeDocument.prepareIncomeDocument(cpHandle);
        
        if (docHandle) {
            // 3. Загрузка файла
            const uploadRes = file.uploadAttachment(
                docHandle, 
                fileContent, 
                `doc_attach_${Math.random().toString(36).substring(7)}.txt`
            );

            check(uploadRes, {
                'File upload success': (r) => r.status === 200 || r.status === 201,
            });

            // Имитируем, что пользователь проверяет созданную карточку (3-5 секунд)
            sleep(Math.random() * 2 + 3);

            // 4. Очистка
            incomeDocument.deleteIncomeDocument(docHandle);
        }
    }
}

export function handleSummary(data: any) {
    // @ts-ignore
    const { htmlReport } = require("https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js");
    return {
        "load_test_summary.html": htmlReport(data),
    };
}