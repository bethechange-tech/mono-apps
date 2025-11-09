import React, { useCallback, useMemo, useRef } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    ScrollView,
    Pressable,
    Dimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
    useWindowDimensions,
    Modal,
    Image,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette, theme } from '@/theme';
import Screen from '@/components/Screen';
import { calculateReserveAmount, getReserveDepositPercentLabel } from '@/config/pricing';
import { formatCurrency } from '@/utils/currency';
import { createListingSelector, useListingStore } from '@/store/listingStore';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

type RootStackParamList = {
    ListingDetail: { id: string };
    ListingPosts: { id: string };
};

export default function ListingDetailScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const carouselRef = useRef<ScrollView | null>(null);
    const route = useRoute<RouteProp<RootStackParamList, 'ListingDetail'>>();
    const { id } = route.params;
    const fetchListing = useListingStore((state) => state.fetchListing);
    const selector = useMemo(() => createListingSelector(id), [id]);
    const entry = useListingStore(selector);
    const listingData = entry.data;

    const heroImages = useMemo(() => {
        if (listingData?.images?.length) {
            return listingData.images;
        }
        if (listingData?.image) {
            return [listingData.image];
        }
        return [] as string[];
    }, [listingData]);

    const [activeImage, setActiveImage] = React.useState(0);
    const [isImageModalVisible, setIsImageModalVisible] = React.useState(false);

    const handleCarouselMomentum = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, layoutMeasurement } = event.nativeEvent;
        if (!layoutMeasurement?.width) {
            return;
        }
        const index = Math.round(contentOffset.x / layoutMeasurement.width);
        setActiveImage(index);
    }, []);

    const handleSelectImage = useCallback((index: number) => {
        if (!carouselRef.current) return;
        carouselRef.current.scrollTo({ x: index * width, animated: true });
        setActiveImage(index);
    }, [width]);

    const ensureListing = useCallback(() => {
        if (entry.status === 'idle') {
            void fetchListing(id);
        }
    }, [entry.status, fetchListing, id]);

    React.useEffect(() => {
        ensureListing();
    }, [ensureListing]);

    React.useEffect(() => {
        setActiveImage(0);
    }, [heroImages.length, listingData?.id]);

    if (entry.status === 'idle' || entry.status === 'loading') {
        return <Screen><Text style={styles.loading}>Loading...</Text></Screen>;
    }
    if (entry.status === 'error' || !entry.data) {
        return <Screen><Text style={styles.loading}>Listing not found.</Text></Screen>;
    }

    const item = entry.data!;

    const postsCount = item.posts?.length ?? 0;
    const reserveAmount = calculateReserveAmount(item.pricePerMonth);
    const reserveLabel = getReserveDepositPercentLabel();
    const monthlyPrice = formatCurrency(item.pricePerMonth);
    const threeMonthTotal = formatCurrency(item.pricePerMonth * 3);
    const leadTag = item.tags?.[0];
    const climateLabel = item.climateControlled ? 'Climate controlled' : 'Ambient storage';
    const summaryCopy = [
        climateLabel,
        `with ${item.access.toLowerCase()} access`,
        leadTag ? `and ${leadTag.toLowerCase()}` : '',
    ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

    const features: Array<{ icon: keyof typeof Ionicons.glyphMap; value: string; label: string }> = [
        { icon: 'expand-outline', value: `${item.sizeSqFt} sq ft`, label: 'Footprint' },
        { icon: 'key-outline', value: item.access, label: 'Access' },
        {
            icon: (item.climateControlled ? 'thermometer-outline' : 'leaf-outline') as keyof typeof Ionicons.glyphMap,
            value: climateLabel,
            label: 'Environment',
        },
    ];

    return (
        <Screen padded={false}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.carousel}>
                    <ScrollView
                        ref={carouselRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={handleCarouselMomentum}
                    >
                        {heroImages.length ? heroImages.map((uri, index) => (
                            <Pressable
                                key={`${uri}-${index}`}
                                onPress={() => {
                                    setActiveImage(index);
                                    setIsImageModalVisible(true);
                                }}
                            >
                                <ImageBackground
                                    source={{ uri }}
                                    style={styles.carouselItem}
                                    imageStyle={styles.heroImage}
                                >
                                    <View style={styles.heroOverlay} />
                                    <View style={styles.heroContent}>
                                        <View style={styles.heroBadgeRow}>
                                            <View style={styles.heroBadge}>
                                                <Text style={styles.heroBadgeText}>Featured storage</Text>
                                            </View>
                                            {postsCount ? (
                                                <Text style={styles.heroBadgeMeta}>{postsCount} host {postsCount === 1 ? 'story' : 'stories'}</Text>
                                            ) : null}
                                        </View>
                                        <Text style={styles.heroTitle}>{item.title}</Text>
                                        <View style={styles.heroLocationRow}>
                                            <Ionicons name="location-outline" size={16} color={palette.overlay} />
                                            <Text style={styles.heroLocation}>{item.location}</Text>
                                        </View>
                                        <View style={styles.heroStatsRow}>
                                            <View style={styles.heroStat}>
                                                <Ionicons name="star" size={16} color="#FFB703" />
                                                <Text style={styles.heroStatText}>{item.rating.toFixed(1)} ({item.reviews} reviews)</Text>
                                            </View>
                                            <View style={styles.heroDot} />
                                            <Text style={styles.heroStatText}>{reserveLabel} deposit</Text>
                                        </View>
                                    </View>
                                </ImageBackground>
                            </Pressable>
                        )) : (
                            <View style={styles.carouselFallback}>
                                <Ionicons name="image-outline" size={28} color={palette.textSubtle} />
                                <Text style={styles.carouselFallbackTitle}>Photos coming soon</Text>
                                <Text style={styles.carouselFallbackCaption}>
                                    This host hasn’t added images yet. Check back later.
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                    {heroImages.length > 1 ? (
                        <View style={styles.carouselIndicators}>
                            {heroImages.map((_, index) => (
                                <Pressable
                                    key={`indicator-${index}`}
                                    onPress={() => handleSelectImage(index)}
                                    style={[styles.carouselDot,
                                        index === activeImage && styles.carouselDotActive,
                                    ]}
                                >
                                    <Text style={styles.carouselDotLabel}>{index + 1}</Text>
                                </Pressable>
                            ))}
                        </View>
                    ) : null}
                </View>

                <Modal
                    visible={isImageModalVisible}
                    transparent={false}
                    animationType="fade"
                    onRequestClose={() => setIsImageModalVisible(false)}
                >
                    <View style={styles.modalFullscreenRoot}>
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={handleCarouselMomentum}
                            ref={carouselRef}
                            contentOffset={{ x: activeImage * width, y: 0 }}
                        >
                            {heroImages.map((uri, index) => (
                                <View key={`${uri}-modal-${index}`} style={{ width }}>
                                    <Image
                                        source={{ uri }}
                                        style={styles.modalImage}
                                        resizeMode="cover"
                                    />
                                </View>
                            ))}
                        </ScrollView>
                        <Pressable
                            style={styles.modalCloseButton}
                            onPress={() => setIsImageModalVisible(false)}
                        >
                            <Ionicons name="close" size={22} color={palette.surface} />
                        </Pressable>
                        {heroImages.length > 1 ? (
                            <View style={styles.modalIndicators}>
                                {heroImages.map((_, index) => (
                                    <View
                                        key={`modal-dot-${index}`}
                                        style={[styles.modalDot,
                                            index === activeImage && styles.modalDotActive,
                                        ]}
                                    />
                                ))}
                            </View>
                        ) : null}
                    </View>
                </Modal>

                <View style={[styles.section, isTablet && styles.sectionTablet]}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.sectionEyebrow}>Space overview</Text>
                        <Text style={styles.summaryBody}>{summaryCopy}</Text>
                        <View style={styles.featureGrid}>
                            {features.map((feature) => (
                                <View key={feature.label} style={styles.featureItem}>
                                    <View style={styles.featureIcon}>
                                        <Ionicons name={feature.icon} size={18} color={palette.primary} />
                                    </View>
                                    <Text style={styles.featureValue}>{feature.value}</Text>
                                    <Text style={styles.featureLabel}>{feature.label}</Text>
                                </View>
                            ))}
                        </View>
                        {item.tags?.length ? (
                            <View style={styles.tagRow}>
                                {item.tags.map((tag) => (
                                    <View key={tag} style={styles.tagPill}>
                                        <Text style={styles.tagLabel}>{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : null}
                    </View>

                    <View style={styles.pricingCard}>
                        <Text style={styles.sectionEyebrow}>Pricing</Text>
                        <View style={styles.priceHeader}>
                            <Text style={styles.priceValue}>{monthlyPrice}</Text>
                            <Text style={styles.priceSuffix}>/month</Text>
                        </View>
                        <Text style={styles.priceCaption}>3 month total {threeMonthTotal}</Text>
                        <View style={styles.reserveRow}>
                            <Ionicons name="shield-checkmark-outline" size={18} color={palette.primary} />
                            <Text style={styles.reserveCopy}>Reserve for {formatCurrency(reserveAmount)} ({reserveLabel})</Text>
                        </View>
                        <Text style={styles.supportText}>No charge until the host confirms your move-in date.</Text>
                        <Pressable
                            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
                            onPress={() => { /* booking flow later */ }}
                        >
                            <Text style={styles.primaryButtonLabel}>Reserve Space</Text>
                        </Pressable>
                    </View>

                    {postsCount > 0 ? (
                        <Pressable
                            style={({ pressed }) => [styles.storiesCard, pressed && styles.storiesCardPressed]}
                            onPress={() => navigation.navigate('ListingPosts', { id: item.id })}
                        >
                            <View style={styles.storiesBadge}>
                                <Text style={styles.storiesBadgeLabel}>Host stories</Text>
                            </View>
                            <Text style={styles.storiesTitle}>Hear from the host</Text>
                            <Text style={styles.storiesCopy}>
                                Go behind the scenes of upgrades, maintenance rituals, and renter tips.
                            </Text>
                            <View style={styles.storiesFooter}>
                                <Text style={styles.storiesCount}>{postsCount} {postsCount === 1 ? 'story' : 'stories'}</Text>
                                <Ionicons name="arrow-forward" size={16} color={palette.primary} />
                            </View>
                        </Pressable>
                    ) : null}
                </View>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    scroll: {
        paddingBottom: 48,
        backgroundColor: palette.background,
    },
    carousel: {
        height: 320,
        position: 'relative',
        backgroundColor: palette.surfaceAlt,
    },
    carouselItem: {
        width: SCREEN_WIDTH,
        height: 320,
        justifyContent: 'flex-end',
    },
    heroImage: {
        borderBottomLeftRadius: theme.radii.xl,
        borderBottomRightRadius: theme.radii.xl,
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(17, 24, 39, 0.32)',
    },
    heroContent: {
        padding: 24,
        gap: 12,
    },
    heroBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    heroBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.radii.pill,
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    heroBadgeText: {
        ...theme.typography.caption,
        color: palette.overlay,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    heroBadgeMeta: {
        ...theme.typography.caption,
        color: palette.overlay,
    },
    heroTitle: {
        ...theme.typography.title,
        color: palette.overlay,
    },
    heroLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    heroLocation: {
        ...theme.typography.body,
        color: palette.overlay,
    },
    heroStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    heroStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    heroStatText: {
        ...theme.typography.caption,
        color: palette.overlay,
    },
    heroDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: palette.overlay,
        opacity: 0.75,
    },
    carouselIndicators: {
        position: 'absolute',
        bottom: 18,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    carouselDot: {
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        paddingHorizontal: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.26)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    carouselDotActive: {
        backgroundColor: palette.surface,
    },
    carouselDotLabel: {
        ...theme.typography.caption,
        fontSize: 11,
        color: palette.text,
    },
    carouselFallback: {
        width: SCREEN_WIDTH,
        height: 320,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        backgroundColor: palette.surfaceAlt,
    },
    carouselFallbackTitle: {
        ...theme.typography.subtitle,
        color: palette.text,
        marginTop: 10,
    },
    carouselFallbackCaption: {
        ...theme.typography.caption,
        color: palette.textMuted,
        textAlign: 'center',
        marginTop: 4,
    },
    modalImage: {
        width: '100%',
        height: '100%',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalFullscreenRoot: {
        flex: 1,
        backgroundColor: '#000',
    },
    modalIndicators: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    modalDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.35)',
    },
    modalDotActive: {
        backgroundColor: '#FFF',
    },
    section: {
        paddingHorizontal: 16,
        paddingTop: 24,
        gap: 24,
    },
    sectionTablet: {
        width: '100%',
        maxWidth: 720,
        alignSelf: 'center',
    },
    summaryCard: {
        backgroundColor: palette.surface,
        borderRadius: theme.radii.xl,
        borderWidth: 1,
        borderColor: palette.border,
        padding: 24,
        gap: 20,
        shadowColor: '#0F172A',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 24,
        elevation: 6,
    },
    sectionEyebrow: {
        ...theme.typography.caption,
        color: palette.textSubtle,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    summaryBody: {
        ...theme.typography.body,
        color: palette.textMuted,
        lineHeight: 24,
    },
    featureGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    featureItem: {
        flexBasis: '30%',
        flexGrow: 1,
        minWidth: 120,
        backgroundColor: palette.surfaceAlt,
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: palette.border,
        padding: 12,
        gap: 6,
    },
    featureIcon: {
        width: 32,
        height: 32,
        borderRadius: theme.radii.sm,
        backgroundColor: palette.highlight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureValue: {
        ...theme.typography.body,
        color: palette.text,
        fontWeight: '600',
    },
    featureLabel: {
        ...theme.typography.caption,
        color: palette.textSubtle,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tagPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.radii.pill,
        backgroundColor: palette.highlight,
    },
    tagLabel: {
        ...theme.typography.caption,
        color: palette.primary,
        fontWeight: '600',
    },
    pricingCard: {
        backgroundColor: palette.surface,
        borderRadius: theme.radii.xl,
        borderWidth: 1,
        borderColor: palette.border,
        padding: 24,
        gap: 16,
        shadowColor: '#0F172A',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 24,
        elevation: 6,
    },
    priceHeader: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    priceValue: {
        ...theme.typography.hero,
        color: palette.text,
    },
    priceSuffix: {
        ...theme.typography.body,
        color: palette.textSubtle,
        marginBottom: 4,
    },
    priceCaption: {
        ...theme.typography.caption,
        color: palette.textSubtle,
    },
    reserveRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    reserveCopy: {
        ...theme.typography.caption,
        color: palette.text,
        fontWeight: '600',
    },
    supportText: {
        ...theme.typography.caption,
        color: palette.textMuted,
        lineHeight: 20,
    },
    primaryButton: {
        marginTop: 8,
        backgroundColor: palette.primary,
        paddingVertical: 14,
        borderRadius: theme.radii.pill,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: palette.primary,
    },
    primaryButtonPressed: {
        opacity: 0.92,
    },
    primaryButtonLabel: {
        ...theme.typography.label,
        color: palette.surface,
        fontWeight: '700',
        letterSpacing: 0.6,
    },
    storiesCard: {
        backgroundColor: palette.surfaceAlt,
        borderRadius: theme.radii.xl,
        borderWidth: 1,
        borderColor: palette.border,
        padding: 24,
        gap: 14,
    },
    storiesCardPressed: {
        transform: [{ scale: 0.99 }],
        opacity: 0.96,
    },
    storiesBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.radii.pill,
        backgroundColor: palette.highlight,
    },
    storiesBadgeLabel: {
        ...theme.typography.caption,
        color: palette.primary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    storiesTitle: {
        ...theme.typography.subtitle,
        color: palette.text,
    },
    storiesCopy: {
        ...theme.typography.body,
        color: palette.textMuted,
        lineHeight: 22,
    },
    storiesFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    storiesCount: {
        ...theme.typography.caption,
        color: palette.primary,
        fontWeight: '600',
    },
    loading: { ...theme.typography.body, padding: 20 },
});