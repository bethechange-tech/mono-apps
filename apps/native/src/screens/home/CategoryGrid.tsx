import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, theme } from '@/theme';
import type { HomeCategory } from './constants';

type CategoryGridProps = {
    categories: HomeCategory[];
    selectedId: string;
    onSelect: (id: string) => void;
};

export function CategoryGrid({ categories, selectedId, onSelect }: CategoryGridProps) {
    return (
        <View style={styles.grid}>
            {categories.map((category) => {
                const isActive = selectedId === category.id;
                return (
                    <Pressable
                        key={category.id}
                        style={[styles.item, isActive && styles.itemActive]}
                        onPress={() => onSelect(category.id)}
                    >
                        <Ionicons
                            name={category.icon}
                            size={20}
                            color={isActive ? palette.primary : palette.textMuted}
                        />
                        <Text style={[styles.label, isActive && styles.labelActive]}>{category.label}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    item: {
        width: '30%',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: palette.border,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: palette.surface,
    },
    itemActive: {
        borderColor: palette.primary,
        backgroundColor: '#FFF6F6',
    },
    label: { marginTop: 6, color: palette.textMuted, ...theme.typography.caption },
    labelActive: { color: palette.primary },
});
