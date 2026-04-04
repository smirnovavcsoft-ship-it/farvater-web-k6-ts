import { sleep, check } from 'k6';
import { BaseService } from './base-service';
import { IncomeService } from './income-service';

export const options = {
    vus: 1, 
    duration: '10s',
};

export function setup() {
    // Выполняется 1 раз: логинимся и получаем токен
    const token = BaseService.login();
    return { token };
}

export default function (data: { token: string }) {
    const incomeService = new IncomeService(data.token);
    
    // 1. Пытаемся создать документ (подставьте реальный handle отправителя из вашей БД)
    const response = incomeService.createDocument("YOUR_SENDER_HANDLE_HERE");

    check(response, {
        'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
        'has handle': (r) => r.json('handle') !== undefined,
    });

    if (response.status === 200) {
        console.log(`Документ успешно создан: ${response.json('handle')}`);
    } else {
        console.error(`Ошибка создания: ${response.status} ${response.body}`);
    }

    sleep(1);
}