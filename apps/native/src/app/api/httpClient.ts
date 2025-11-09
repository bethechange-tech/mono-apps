import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import Toast from 'react-native-toast-message';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://stashspot-api-v2-e76vzky47q-ew.a.run.app';

const SKIP_TOAST_HEADER = 'x-skip-error-toast';

const getErrorMessage = (error: AxiosError) => {
    if (error.response?.data) {
        const data = error.response.data as unknown;
        if (typeof data === 'string') {
            return data;
        }
        if (typeof data === 'object' && data !== null) {
            const message =
                (data as { message?: string }).message ||
                (data as { error?: string }).error;
            if (message) {
                return message;
            }
        }
    }

    if (error.message) {
        return error.message;
    }

    if (error.code === 'ERR_NETWORK') {
        return 'We could not reach the server. Check your connection and try again.';
    }

    return 'Something went wrong. Please try again in a moment.';
};

const showErrorToast = (message: string) => {
    try {
        Toast.show({
            type: 'error',
            text1: 'Request failed',
            text2: message,
            topOffset: 64,
        });
    } catch {
        // Ignore failures triggered before the toast host mounts.
    }
};

const shouldShowToast = (error: AxiosError) => {
    const headers = error.config?.headers as
        | undefined
        | (Record<string, unknown> & { get?: (name: string) => unknown; has?: (name: string) => boolean });

    if (headers) {
        if (typeof headers[SKIP_TOAST_HEADER] !== 'undefined') {
            return false;
        }

        if (typeof headers.has === 'function' && headers.has(SKIP_TOAST_HEADER)) {
            return false;
        }

        if (typeof headers.get === 'function' && typeof headers.get(SKIP_TOAST_HEADER) !== 'undefined') {
            return false;
        }
    }

    const status = error.response?.status;
    // Allow screens to handle expected 404 flows without showing a toast.
    if (status === 404) {
        return false;
    }

    return true;
};

const attachResponseInterceptor = (instance: AxiosInstance) => {
    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (axios.isAxiosError(error) && shouldShowToast(error)) {
                showErrorToast(getErrorMessage(error));
            }

            return Promise.reject(error);
        },
    );

    return instance;
};

const createDefaultConfig = (override?: AxiosRequestConfig): AxiosRequestConfig => {
    const baseConfig: AxiosRequestConfig = {
        baseURL: API_BASE_URL,
        timeout: 10_000,
    };

    if (!override) {
        return baseConfig;
    }

    return {
        ...baseConfig,
        ...override,
        headers: {
            ...(baseConfig.headers ?? {}),
            ...(override.headers ?? {}),
        },
    };
};

let sharedClient: AxiosInstance | null = null;

export const getApiClient = () => {
    if (!sharedClient) {
        sharedClient = attachResponseInterceptor(axios.create(createDefaultConfig()));
    }
    return sharedClient;
};

export const createApiClient = (override?: AxiosRequestConfig) => {
    return attachResponseInterceptor(axios.create(createDefaultConfig(override)));
};

export const ERROR_TOAST_HEADER = SKIP_TOAST_HEADER;
