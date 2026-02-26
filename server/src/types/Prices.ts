export interface Prices {
    status: boolean;
    messages: Record<string, string>;
    nights: Record<string, number | null>;
    min_stay: number;
    max_stay: number | null;
    extras: object[];
    total_price: number;
    tourist_tax: number;
}
