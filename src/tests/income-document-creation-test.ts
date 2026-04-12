import { sleep, check } from 'k6';
import { Options } from 'k6/options';
import { BaseApiService } from '../api-services/base-api-services';
import { CounterpartyService } from '../api-services/counterparty-service';
import { IncomeDocumentService } from '../api-services/income-document-service';
import { DataFactory } from '../generators/data-factory';

// --- 1. НАСТРОЙКИ НАГРУЗКИ (Options) ---
export const options: Options = {
    stages: [
        { duration: '30s', target: 5 },  // Разгон: 5 пользователей за 30 сек
        { duration: '1m', target: 5 },   // Плато: держим 5 пользователей 1 минуту
        { duration: '30s', target: 0 },  // Спад: выключаем нагрузку
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'], // 95% запросов должны быть быстрее 2 сек
        http_req_failed: ['rate<0.01'],    // Ошибок должно быть меньше 1%
    },
};

// --- 2. СЦЕНАРИЙ (Default function) ---
export default function () {
    const apiService = new BaseApiService();
    const token = apiService.login();

    const counterpartyService = new CounterpartyService(token);
    const incomeService = new IncomeDocumentService(token);

    // Подготовка данных через фабрику
    const uniqueId = `load-${__VU}-${__ITER}`;
    const cpData = DataFactory.generateCounterpartyModel(); // Используем модель из фабрики
    
    // 1. Создаем контрагента
    const counterpartyHandle = counterpartyService.prepareCounterparty();

    if (counterpartyHandle) {
        // 2. Создаем документ для этого контрагента
        const docData = DataFactory.generateIncomeDocumentModel(counterpartyHandle);
        const docHandle = incomeService.createIncomeDocumentRequest(docData);
        
        // 3. Проверяем, что документ создался (условие тестирования)
        check(docHandle, {
            'Document status is 200/201': (r) => r.status === 200 || r.status === 201,
            'Document handle exists': (r) => r.json('handle') !== null,
        });

        // Пауза между итерациями (имитация действий человека)
        sleep(1);

        // 4. Очистка (необязательно, но полезно для бесконечных тестов)
        incomeService.deleteIncomeDocument(docHandle.json('handle') as string);
    }
}