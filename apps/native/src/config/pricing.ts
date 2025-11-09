const DEFAULT_RESERVE_PERCENT = 5;

const parsePercent = (value: string | undefined): number | undefined => {
    if (!value) return undefined;
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return undefined;
    }
    return parsed;
};

const envPercent = parsePercent(process.env.EXPO_PUBLIC_RESERVE_PERCENT);

export const reserveDepositPercent = envPercent ?? DEFAULT_RESERVE_PERCENT;

export const getReserveDepositPercentLabel = () => `${reserveDepositPercent}%`;

export const calculateReserveAmount = (pricePerMonth: number) => {
    return (pricePerMonth * reserveDepositPercent) / 100;
};
