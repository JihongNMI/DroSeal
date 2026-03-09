import { apiClient } from './apiClient';
import { PageableResponse } from './inventory';

export type TransactionType = 'PURCHASE' | 'SALE';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface TransactionDto {
    transactionId: number;
    transactionType: TransactionType;
    price: number;
    platform?: string;
    status: TransactionStatus;
    transactionDate: string;
    createdAt: string;
    inventoryId?: number;
    inventoryItemName?: string;
    receiptImageUrl?: string;
}

export interface AccountingSummaryResponseDto {
    totalRevenue: number;
    businessIncome: number;
    miscellaneousIncome: number;
    totalExpense: number;
    netIncome: number;
}

export interface TransactionCreateRequest {
    transactionType: TransactionType;
    price: number;
    platform?: string;
    transactionDate: string;
    inventoryId?: number;
    receiptImageUrl?: string;
}

export interface TransactionSearchCondition {
    type?: TransactionType;
    startDate?: string;
    endDate?: string;
    platform?: string;
}

export const fetchMyTransactions = async (
    page: number = 0,
    size: number = 20,
    condition?: TransactionSearchCondition
): Promise<PageableResponse<TransactionDto>> => {
    const response = await apiClient.get<PageableResponse<TransactionDto>>('/accounting/transactions', {
        params: {
            page,
            size,
            ...condition,
        },
    });
    return response.data;
};

export const createTransaction = async (request: TransactionCreateRequest): Promise<TransactionDto> => {
    const response = await apiClient.post<TransactionDto>('/accounting/transactions', request);
    return response.data;
};

export const getAccountingSummary = async (condition?: TransactionSearchCondition): Promise<AccountingSummaryResponseDto> => {
    const response = await apiClient.get<AccountingSummaryResponseDto>('/accounting/summary', {
        params: condition,
    });
    return response.data;
};
