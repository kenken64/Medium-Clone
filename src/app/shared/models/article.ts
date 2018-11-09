export interface Article {
    id?: string;
    title: string;
    author?: string;
    authorName?: string;
    publish_date: Date;
    category: string;
    category_name?: string;
    article: string;
    gallery_url?: string;
}