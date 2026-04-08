import { sleep } from 'k6';
import { Options } from 'k6/options';
import { BaseApiService } from '../api-services/base-api-services';
import { CounterpartyService } from 'api-services/counterparty-service';
import { IncomeDocumentService } from 'api-services/income-document-service';

// 1. Настройка нагрузки




// Создаем экземпляр сервиса

const apiService = new BaseApiService();
const token = apiService.LoginAsync();

const counterpartyService = new CounterpartyService(token);
const incomeDocumentService = new IncomeDocumentService(token);
