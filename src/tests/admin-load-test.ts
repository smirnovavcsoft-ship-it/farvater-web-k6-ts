import { sleep } from 'k6';
import { Options } from 'k6/options';
import { BaseApiService } from '../api-services/base-api-services';

// 1. Настройка нагрузки
export const options: Options = {
    stages: [
        { duration: '30s', target: 20 }, // Разгон: за 30 секунд плавно поднимаем до 20 пользователей
        { duration: '1m', target: 20 },  // Плато: держим 20 пользователей 1 минуту
        { duration: '30s', target: 50 }, // Рывок: поднимаем до 50 пользователей за 30 секунд
        { duration: '1m', target: 50 },  // Стресс: держим 50 пользователей 1 минуту
        { duration: '30s', target: 0 },  // Охлаждение: плавно снижаем нагрузку до 0
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'], // Тест провалится, если ошибок будет больше 1%
        http_req_duration: ['p(95)<500'], // 95% запросов должны быть быстрее 500мс
    },
};

// Создаем экземпляр сервиса
const apiService = new BaseApiService();

export default function () {
    console.log(`[VU ${__VU}] Попытка входа...`);

    // 2. Вызываем логику авторизации, которую мы перенесли из C#
    apiService.login();

    // 3. Имитируем паузу (think time), как будто админ что-то читает на экране
    sleep(1); 
}