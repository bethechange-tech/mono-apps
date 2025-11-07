import { View, Text, StyleSheet, Switch } from 'react-native';
import { palette, theme } from '@/theme';

type TotalPriceToggleProps = {
    value: boolean;
    onChange: (value: boolean) => void;
};

export function TotalPriceToggle({ value, onChange }: TotalPriceToggleProps) {
    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.title}>Display total storage cost</Text>
                <Text style={styles.subtitle}>Includes service fees for a 3-month hold</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onChange}
                thumbColor={value ? palette.primary : '#FFFFFF'}
                trackColor={{ false: palette.border, true: '#FFD4D6' }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: palette.surface,
        borderRadius: 18,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: palette.border,
    },
    title: { ...theme.typography.subtitle, color: palette.text },
    subtitle: { ...theme.typography.caption, color: palette.textMuted, marginTop: 4 },
});
