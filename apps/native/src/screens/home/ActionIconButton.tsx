import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/theme';

type ActionIconButtonProps = {
    name: keyof typeof Ionicons.glyphMap;
};

export function ActionIconButton({ name }: ActionIconButtonProps) {
    return (
        <Pressable style={styles.button}>
            <Ionicons name={name} size={20} color={palette.primary} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 40,
        height: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
});
