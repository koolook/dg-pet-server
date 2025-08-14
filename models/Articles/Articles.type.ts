export interface ArticlesType {
    _id: string;

    title: string;
    body: string;
    imageId?: string;

    authorId: string;

    isPublished: boolean;
    publishAt?: number;
    createdAt: number;
    updatedAt?: number;
}
