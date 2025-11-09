export const formatCurrency = (value: number, locale: string = 'en-GB', currency: string = 'GBP') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(value);
};
