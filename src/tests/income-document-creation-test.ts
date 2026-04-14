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
    

    const counterparty = new CounterpartyService(token);
    const incomeDocument = new IncomeDocumentService(token);


    // Подготовка данных через фабрику
   // const uniqueId = `load-${__VU}-${__ITER}`;
   // const cpData = DataFactory.generateCounterpartyModel(); // Используем модель из фабрики
    
    // 1. Создаем контрагента
    const counterpartyHandle = counterparty.prepareCounterparty();

    if (counterpartyHandle) {
        // 1. Создаем документ. Здесь incomeDocumentHandle — это просто STRING или NULL
        const incomeDocumentHandle = incomeDocument.prepareIncomeDocument(counterpartyHandle);
        
        // 2. Исправленный блок проверок
        check(incomeDocumentHandle, {
            'Income document handle is valid': (h) => h !== null && h !== undefined && h.length > 0,
        });

        sleep(1);

        // 3. Исправленная очистка
        if (incomeDocumentHandle) {
            // Передаем строку напрямую, без .json(), потому что это И ЕСТЬ handle
            incomeDocument.deleteIncomeDocument(incomeDocumentHandle);
        }

        if (counterpartyHandle) {
            counterparty.deleteCounterparty(counterpartyHandle);
        }
    }
}

// --- 3. Генерация отчета (выполняется в конце теста) ---

export function handleSummary(data: any) {
    console.info('Генерация HTML-отчета...');
    
    // Используем require прямо здесь, чтобы TypeScript/Webpack не ругались при сборке
    // @ts-ignore
    const { htmlReport } = require("https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js");
    
    return {
        "summary.html": htmlReport(data),
    };
}