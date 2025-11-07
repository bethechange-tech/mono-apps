import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, theme } from '@/theme';
import { ActionIconButton } from './ActionIconButton';

export function HeroSection() {
    return (
        <LinearGradient colors={[palette.primaryAlt, palette.primary]} style={styles.container}>
            <View style={styles.row}>
                <View style={styles.userRow}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>DW</Text>
                    </View>
                    <View>
                        <Text style={styles.welcome}>Need extra space, David?</Text>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={16} color="#FFFFFFCC" />
                            <Text style={styles.location}>Brooklyn, New York</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.actions}>
                    <ActionIconButton name="search-outline" />
                    <ActionIconButton name="notifications-outline" />
                </View>
            </View>
            <View style={styles.tabs}>
                <Text style={styles.tabActive}>Spaces</Text>
                <Text style={styles.tab}>Bookings</Text>
                <Text style={styles.tab}>Saved</Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 56,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
        flexWrap: 'wrap',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF33',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: { color: '#FFF', fontWeight: '700', fontSize: 18 },
    welcome: { color: '#FFF', ...theme.typography.subtitle, marginBottom: 4 },
    locationRow: { flexDirection: 'row', alignItems: 'center' },
    location: { color: '#FFFFFFCC', marginLeft: 4, ...theme.typography.caption },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 'auto',
        gap: 12,
    },
    tabs: {
        flexDirection: 'row',
        marginTop: 28,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 60,
    },
    tabActive: { color: '#FFF', ...theme.typography.label },
    tab: { color: '#FFFFFF99', ...theme.typography.label },
});
