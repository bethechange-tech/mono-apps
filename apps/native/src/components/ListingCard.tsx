import { Image, StyleSheet, Text, View, Pressable } from 'react-native';
import { theme, palette } from '@/theme';
import type { ListingSummary } from '@/data/listings';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { calculateReserveAmount, getReserveDepositPercentLabel } from '@/config/pricing';
import { formatCurrency } from '@/utils/currency';

type RootStackParamList = {
    Root: undefined;
    ListingDetail: { id: string };
};

type Props = {
    item: ListingSummary;
    onPress?: () => void;
    showTotal?: boolean;
};

export function ListingCard({ item, onPress, showTotal }: Props) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const reserveAmount = calculateReserveAmount(item.pricePerMonth);
    const reserveLabel = getReserveDepositPercentLabel();
    const monthlyPrice = formatCurrency(item.pricePerMonth);
    const threeMonthTotal = formatCurrency(item.pricePerMonth * 3);
    return (
        <Pressable
            onPress={() => {
                if (onPress) onPress(); else navigation.navigate('ListingDetail', { id: item.id });
            }}
            style={styles.card}
            android_ripple={{ color: palette.highlight }}
        >
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
            <View style={styles.heart}>
                <Ionicons name="heart-outline" size={18} color={palette.text} />
            </View>
            <View style={styles.body}>
                <View style={styles.rowBetween}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.price}>{monthlyPrice}<Text style={styles.night}> /Month{showTotal ? ` · 3 months ${threeMonthTotal}` : ''}</Text></Text>
                </View>
                <Text style={styles.reserve}>Reserve {formatCurrency(reserveAmount)} ({reserveLabel})</Text>
                <View style={styles.row}>
                    <Ionicons name="location-outline" size={14} color={palette.textMuted} />
                    <Text style={styles.location}>{' '}{item.location}</Text>
                </View>
                <View style={[styles.row, { marginTop: 4 }]}>
                    <Ionicons name="star" size={14} color="#FFB703" />
                    <Text style={styles.rating}>{' '}{item.rating} <Text style={styles.reviews}>({item.reviews} reviews)</Text></Text>
                </View>
                <Text style={styles.meta} numberOfLines={1}>
                    {item.sizeSqFt} sq ft • {item.access} access • {item.climateControlled ? 'Climate controlled' : 'Not climate controlled'}
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: theme.radii.md,
        overflow: 'hidden',
        backgroundColor: palette.surface,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: palette.border,
    },
    image: { width: '100%', height: 160, backgroundColor: palette.surfaceAlt },
    heart: {
        position: 'absolute',
        right: 10,
        top: 10,
        backgroundColor: '#FFFFFFCC',
        borderRadius: 16,
        padding: 6,
    },
    body: { padding: 12 },
    row: { flexDirection: 'row', alignItems: 'center' },
    rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { ...theme.typography.subtitle, flex: 1, marginRight: 8 },
    price: { ...theme.typography.subtitle, color: palette.text },
    night: { ...theme.typography.caption, color: palette.textMuted },
    reserve: { ...theme.typography.caption, color: palette.textSubtle, marginTop: 4 },
    location: { ...theme.typography.caption, color: palette.textMuted },
    rating: { ...theme.typography.caption, color: palette.text },
    reviews: { color: palette.textMuted },
    meta: { ...theme.typography.caption, color: palette.textMuted, marginTop: 4 },
});

export default ListingCard;
