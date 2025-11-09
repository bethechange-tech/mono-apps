import React from 'react';
import Screen from '@/components/Screen';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Pressable,
    Switch,
} from 'react-native';
import { palette, theme } from '@/theme';
import type { ListingCategory } from '@/data/listings';

const UK_POSTCODE_REGEX = /^(GIR 0AA|(?:(?:[A-PR-UWYZ][0-9][0-9]?|(?:[A-PR-UWYZ][A-HK-Y][0-9][0-9]?|[A-PR-UWYZ][0-9][A-HJKPSTUW]|[A-PR-UWYZ][A-HK-Y][0-9][ABEHMNPRVWXY])) ?[0-9][ABD-HJLNP-UW-Z]{2}))$/i;
const CATEGORIES: ListingCategory[] = ['garage', 'basement', 'room', 'attic', 'outdoor', 'all'];

type FormState = {
    id: string;
    title: string;
    location: string;
    postcode: string;
    pricePerMonth: string;
    access: string;
    climateControlled: boolean;
    image: string;
    category: ListingCategory;
};

type ValidationResult = {
    errors: Record<string, string>;
    payload?: Record<string, unknown>;
};

const initialForm: FormState = {
    id: generateStorageId(),
    title: 'Secure London Garage Space',
    location: 'London, UK',
    postcode: 'SW1A 1AA',
    pricePerMonth: '249.99',
    access: '24/7 keypad access',
    climateControlled: true,
    image: 'https://cdn.example.com/images/stg_123_cover.jpg',
    category: 'garage',
};

export default function CreateStorageScreen() {
    const [form, setForm] = React.useState<FormState>(initialForm);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [result, setResult] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const updateField = React.useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    }, []);

    const regenerateId = React.useCallback(() => {
        setForm((prev) => ({ ...prev, id: generateStorageId() }));
    }, []);

    const handleSubmit = React.useCallback(async () => {
        const validation = validateStorage(form);
        if (!validation.payload) {
            setErrors(validation.errors);
            setResult(null);
            return;
        }

        setErrors({});
        setIsSubmitting(true);
        setResult(null);

        try {
            const response = await mockCreateStorage(validation.payload);
            setResult(JSON.stringify(response, null, 2));
        } catch (error) {
            setResult(`Failed to create storage: ${(error as Error).message}`);
        } finally {
            setIsSubmitting(false);
        }
    }, [form]);

    const handleReset = React.useCallback(() => {
        setForm({ ...initialForm, id: generateStorageId() });
        setErrors({});
        setResult(null);
    }, []);

    return (
        <Screen padded={false}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create storage listing</Text>
                    <Text style={styles.subtitle}>
                        Configure a mock storage space that satisfies Storage Creation Rules v1 for UK listings.
                    </Text>
                </View>

                <View style={styles.group}>
                    <View style={styles.fieldRow}>
                        <View style={styles.flex1}>
                            <FieldLabel label="Listing ID" />
                            <TextInput
                                value={form.id}
                                onChangeText={(value) => updateField('id', value)}
                                style={[styles.input, errors.id && styles.inputError]}
                                autoCapitalize="none"
                                placeholder="stg_XXXXXXXX"
                            />
                            {errors.id ? <Text style={styles.error}>{errors.id}</Text> : null}
                        </View>
                        <Pressable style={styles.secondaryButton} onPress={regenerateId}>
                            <Text style={styles.secondaryButtonLabel}>Regenerate</Text>
                        </Pressable>
                    </View>

                    <Field label="Title" error={errors.title}>
                        <TextInput
                            value={form.title}
                            onChangeText={(value) => updateField('title', value)}
                            style={[styles.input, errors.title && styles.inputError]}
                            placeholder="Marketing headline"
                        />
                    </Field>

                    <Field label="Location summary" error={errors.location}>
                        <TextInput
                            value={form.location}
                            onChangeText={(value) => updateField('location', value)}
                            style={[styles.input, errors.location && styles.inputError]}
                            placeholder="City or neighbourhood"
                        />
                    </Field>

                    <Field label="Postcode" error={errors.postcode}>
                        <TextInput
                            value={form.postcode}
                            onChangeText={(value) => updateField('postcode', value)}
                            style={[styles.input, errors.postcode && styles.inputError]}
                            autoCapitalize="characters"
                            placeholder="SW1A 1AA"
                        />
                    </Field>

                    <Field label="Price per month (USD)" error={errors.pricePerMonth}>
                        <TextInput
                            value={form.pricePerMonth}
                            onChangeText={(value) => updateField('pricePerMonth', value)}
                            style={[styles.input, errors.pricePerMonth && styles.inputError]}
                            keyboardType="decimal-pad"
                            placeholder="249.99"
                        />
                    </Field>

                    <Field label="Access description" error={errors.access}>
                        <TextInput
                            value={form.access}
                            onChangeText={(value) => updateField('access', value)}
                            style={[styles.input, errors.access && styles.inputError]}
                            placeholder="24/7 keypad access"
                        />
                    </Field>

                    <Field label="Primary image URL" error={errors.image}>
                        <TextInput
                            value={form.image}
                            onChangeText={(value) => updateField('image', value)}
                            style={[styles.input, errors.image && styles.inputError]}
                            autoCapitalize="none"
                            placeholder="https://..."
                        />
                    </Field>

                    <View style={styles.field}>
                        <FieldLabel label="Category" />
                        <View style={styles.categoryRow}>
                            {CATEGORIES.map((category) => {
                                const isActive = form.category === category;
                                return (
                                    <Pressable
                                        key={category}
                                        onPress={() => updateField('category', category)}
                                        style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                                    >
                                        <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                                            {category}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                        {errors.category ? <Text style={styles.error}>{errors.category}</Text> : null}
                    </View>

                    <View style={styles.toggleRow}>
                        <FieldLabel label="Climate controlled" />
                        <Switch
                            value={form.climateControlled}
                            onValueChange={(value) => updateField('climateControlled', value)}
                            thumbColor={form.climateControlled ? palette.primary : palette.surface}
                            trackColor={{ true: palette.primary, false: palette.border }}
                        />
                    </View>
                </View>


                <View style={styles.actions}>
                    <Pressable
                        style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.primaryButtonLabel}>
                            {isSubmitting ? 'Validating...' : 'Validate & Mock Create'}
                        </Text>
                    </Pressable>
                    <Pressable style={styles.clearButton} onPress={handleReset}>
                        <Text style={styles.clearButtonLabel}>Reset form</Text>
                    </Pressable>
                </View>

                {result ? (
                    <View style={styles.resultCard}>
                        <Text style={styles.resultTitle}>Mock response</Text>
                        <ScrollView style={styles.resultScroll} nestedScrollEnabled>
                            <Text style={styles.resultText}>{result}</Text>
                        </ScrollView>
                    </View>
                ) : null}
            </ScrollView>
        </Screen>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <View style={styles.field}>
            <FieldLabel label={label} />
            {children}
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

function FieldLabel({ label }: { label: string }) {
    return <Text style={styles.label}>{label}</Text>;
}

function generateStorageId() {
    return `stg_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizePostcode(value: string) {
    const trimmed = value.trim().toUpperCase();
    if (!trimmed) {
        return '';
    }
    const collapsed = trimmed.replace(/\s+/g, '');
    if (collapsed.length <= 3) {
        return collapsed;
    }
    return `${collapsed.slice(0, collapsed.length - 3)} ${collapsed.slice(-3)}`;
}

function validateStorage(form: FormState): ValidationResult {
    // Enforce Storage Creation Rules v1 before invoking the mock persistence layer.
    const errors: Record<string, string> = {};

    const id = form.id.trim();
    if (!id || id.length < 12 || id.length > 16) {
        errors.id = 'ID must be between 12 and 16 characters.';
    }
    if (id && !id.startsWith('stg_')) {
        errors.id = 'ID must start with stg_ prefix.';
    }

    const title = form.title.trim();
    if (!title || title.length > 128) {
        errors.title = 'Title must be 1-128 characters.';
    }

    const location = form.location.trim();
    if (!location || location.length > 128) {
        errors.location = 'Location summary must be 1-128 characters.';
    }

    const postcode = normalizePostcode(form.postcode);
    if (!postcode) {
        errors.postcode = 'Postcode is required.';
    } else if (!UK_POSTCODE_REGEX.test(postcode)) {
        errors.postcode = 'Postcode must be a valid UK postcode.';
    }

    const price = Number.parseFloat(form.pricePerMonth);
    if (!Number.isFinite(price) || price <= 0) {
        errors.pricePerMonth = 'Monthly price must be a positive number.';
    }

    const access = form.access.trim();
    if (!access) {
        errors.access = 'Access description is required.';
    }

    const image = form.image.trim();
    try {
        if (!image) {
            throw new Error('Missing image URL');
        }
        const url = new URL(image);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            throw new Error('URL must use http or https');
        }
    } catch (error) {
        errors.image = 'Image must be an absolute http(s) URL.';
    }

    if (!CATEGORIES.includes(form.category)) {
        errors.category = 'Select a valid category.';
    }

    if (Object.keys(errors).length > 0) {
        return { errors };
    }

    const payload: Record<string, unknown> = {
        id,
        title,
        location,
        postcode,
        pricePerMonth: Number(price.toFixed(2)),
        access,
        climateControlled: form.climateControlled,
        image,
        category: form.category,
        storageRulesVersion: 'storage-rules-v1',
    };

    return { errors, payload };
}

async function mockCreateStorage(payload: Record<string, unknown>) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
        status: 'success',
        listing: payload,
    };
}

const styles = StyleSheet.create({
    scroll: {
        padding: 24,
        gap: 28,
        backgroundColor: palette.background,
    },
    header: {
        gap: 8,
    },
    title: {
        ...theme.typography.hero,
        color: palette.text,
    },
    subtitle: {
        ...theme.typography.body,
        color: palette.textMuted,
        lineHeight: 22,
    },
    group: {
        backgroundColor: palette.surface,
        borderRadius: theme.radii.xl,
        borderWidth: 1,
        borderColor: palette.border,
        padding: 20,
        gap: 16,
    },
    field: {
        gap: 8,
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
    },
    flex1: {
        flex: 1,
    },
    label: {
        ...theme.typography.caption,
        color: palette.textSubtle,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    input: {
        borderWidth: 1,
        borderColor: palette.border,
        borderRadius: theme.radii.lg,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: palette.surfaceAlt,
        ...theme.typography.body,
        color: palette.text,
    },
    inputError: {
        borderColor: palette.danger,
    },
    error: {
        ...theme.typography.caption,
        color: palette.danger,
    },
    categoryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryPill: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.surfaceAlt,
    },
    categoryPillActive: {
        borderColor: palette.primary,
        backgroundColor: palette.highlight,
    },
    categoryText: {
        ...theme.typography.caption,
        color: palette.textSubtle,
        textTransform: 'capitalize',
    },
    categoryTextActive: {
        color: palette.primary,
        fontWeight: '600',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    actions: {
        gap: 12,
    },
    primaryButton: {
        backgroundColor: palette.primary,
        paddingVertical: 16,
        borderRadius: theme.radii.pill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonDisabled: {
        opacity: 0.8,
    },
    primaryButtonLabel: {
        ...theme.typography.label,
        color: palette.surface,
        fontWeight: '700',
        letterSpacing: 0.6,
    },
    secondaryButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: palette.primary,
        backgroundColor: palette.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
    },
    secondaryButtonLabel: {
        ...theme.typography.caption,
        color: palette.primary,
        fontWeight: '600',
    },
    clearButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    clearButtonLabel: {
        ...theme.typography.caption,
        color: palette.textSubtle,
    },
    resultCard: {
        backgroundColor: palette.surface,
        borderRadius: theme.radii.xl,
        borderWidth: 1,
        borderColor: palette.border,
        padding: 20,
        gap: 12,
    },
    resultTitle: {
        ...theme.typography.subtitle,
        color: palette.text,
    },
    resultScroll: {
        maxHeight: 240,
    },
    resultText: {
        ...theme.typography.mono,
        color: palette.textMuted,
    },
});
