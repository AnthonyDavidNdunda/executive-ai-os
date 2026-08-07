const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface RetryOptions {
    maxAttempts?: number;
    onRetry?: () => void;
}

export async function withRetry<>(
    fn: () => Promise<T>,
    { maxAttempts = 5, onRetry }: RetryOptions = {}
): Promise<T> {
    for (let attempt =1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxAttempts) throw error;
            onRetry?.();
            await sleep(attempt * 3000); //Exponential backoff: wait 3s, 6s, 9s etc before retrying
        }
    }
    throw new Error("unreachable");
}