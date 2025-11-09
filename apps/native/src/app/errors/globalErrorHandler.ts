import Toast from 'react-native-toast-message';

type NativeErrorUtils = {
    getGlobalHandler?: () => (error: unknown, isFatal?: boolean) => void;
    setGlobalHandler?: (handler: (error: unknown, isFatal?: boolean) => void) => void;
};

let registered = false;

const getErrorMessage = (error: unknown) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    if (typeof error === 'string' && error.length) {
        return error;
    }
    return 'An unexpected error occurred.';
};

const showErrorToast = (message: string) => {
    try {
        Toast.show({
            type: 'error',
            text1: 'Unexpected error',
            text2: message,
            topOffset: 64,
        });
    } catch {
        // Ignore failures triggered before the toast host mounts.
    }
};

/**
 * Sets up a global JS error handler so uncaught errors can be logged consistently.
 */
export const initializeGlobalErrorHandling = () => {
    if (registered) {
        return;
    }
    registered = true;

    const errorUtils = (globalThis as { ErrorUtils?: NativeErrorUtils }).ErrorUtils;
    if (errorUtils?.setGlobalHandler) {
        const previousHandler = errorUtils.getGlobalHandler?.();
        errorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
            console.error('Global error captured', { error, isFatal });
            showErrorToast(getErrorMessage(error));
            try {
                previousHandler?.(error, isFatal);
            } catch (handlerError) {
                console.error('Error running previous global handler', handlerError);
            }
        });
    }

    const processObject = (globalThis as { process?: { on?: (event: string, listener: (reason: unknown) => void) => void } }).process;
    processObject?.on?.('unhandledRejection', (reason: unknown) => {
        console.error('Unhandled promise rejection', reason);
        showErrorToast(getErrorMessage(reason));
    });
};
