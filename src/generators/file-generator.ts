/**
 * Класс для генерации тестового контента файлов
 */
export class FileGenerator {

    /**
     * Генерирует текстовый контент заданного размера (в мегабайтах)
     * Подходит для быстрой генерации больших объемов данных.
     */
    static generateTextContent(sizeInMb: number): string {
        const sizeInBytes = sizeInMb * 1024 * 1024;
        // Используем repeat для быстрого создания строки
        return 'a'.repeat(sizeInBytes);
    }

    /**
     * Генерирует случайный бинарный контент (имитация реального файла)
     * Полезно, если сервер пытается сжимать файлы (gzip), случайные данные не сжимаются.
     */
    static generateRandomBinary(sizeInMb: number): ArrayBuffer {
        const sizeInBytes = sizeInMb * 1024 * 1024;
        const buffer = new ArrayBuffer(sizeInBytes);
        const view = new Uint8Array(buffer);
        
        for (let i = 0; i < sizeInBytes; i++) {
            view[i] = Math.floor(Math.random() * 256);
        }
        
        return buffer;
    }
}