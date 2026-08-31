export interface MetaData {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: MetaData;
}