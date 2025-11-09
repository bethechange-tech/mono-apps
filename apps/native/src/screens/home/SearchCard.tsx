import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, theme } from '@/theme';
import { HOME_CATEGORIES } from './constants';
import { CategoryGrid } from './CategoryGrid';

type SearchCardProps = {
    selectedCategory: string;
    onSelectCategory: (id: string) => void;
};

export function SearchCard({ selectedCategory, onSelectCategory }: SearchCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.field}>
                    <Ionicons name="location-outline" size={18} color={palette.text} />
                    <View style={styles.fieldText}>
                        <Text style={styles.label}>Store near</Text>
                        <Text style={styles.value}>Brooklyn, New York</Text>
                    </View>
                </View>
                <Pressable style={styles.swapButton}>
                    <Ionicons name="swap-horizontal" size={18} color={palette.primary} />
                </Pressable>
            </View>
            <CategoryGrid
                categories={HOME_CATEGORIES}
                selectedId={selectedCategory}
                onSelect={onSelectCategory}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 0,
        marginTop: -32,
        backgroundColor: palette.surface,
        borderRadius: 20,
        padding: 18,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    field: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    fieldText: { marginLeft: 12 },
    label: { color: palette.textSubtle, ...theme.typography.caption },
    value: { color: palette.text, ...theme.typography.body },
    swapButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: palette.highlight,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
});
