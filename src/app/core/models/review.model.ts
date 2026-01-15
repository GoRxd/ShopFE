export interface Review {
    id: number;
    productId: number;
    userId: number;
    userFirstName: string;
    rating: number;
    comment: string;
    createdAt: string;
    productName?: string;
    isReported?: boolean;
}

export interface CreateReviewDto {
    productId: number;
    rating: number;
    comment: string;
}
