/**
 * Аналог namespace FarvaterWeb.Data - DocumentTypeModel
 */
export interface DocumentTypeModel {
    sysId?: string;
    description?: string;
}

/**
 * Аналог namespace FarvaterWeb.Data - SenderModel
 */
export interface SenderModel {
    handle?: string;
}

/**
 * Аналог namespace FarvaterWeb.Data - IncomeDocumentModel
 */
export interface IncomeDocumentModel {
    againTo?: any; // В C# object?, в TS используем any или null
    appendicesCount: number;
    content?: string;
    documentType?: DocumentTypeModel;
    executor?: any;
    finishDate?: string;
    inResponseTo?: any;
    listCount: number;
    projects: any[]; // В C# List<object>
    sender?: SenderModel;
    senderNumber?: string;
    sendingDate?: string;
    sheetOfAppendicesCount: number;
    signer?: any;
    title?: string;
}