import { isAxiosError } from 'axios';
import type { ListPostsResponse, StoragePost } from '@/data/posts';
import { getApiClient } from '@/app/api/httpClient';

const client = getApiClient();

export interface PostRepository {
    list(): Promise<StoragePost[]>;
    get(id: string): Promise<StoragePost | undefined>;
}

export const postRepository: PostRepository = {
    async list() {
        const { data } = await client.get<ListPostsResponse>('/posts');
        return data;
    },
    async get(id: string) {
        try {
            const { data } = await client.get<StoragePost>(`/posts/${id}`);
            return data;
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 404) {
                return undefined;
            }

            if (isAxiosError(error) && error.response) {
                throw new Error(`Failed to load post ${id}: ${error.response.status}`);
            }

            throw error;
        }
    },
};
