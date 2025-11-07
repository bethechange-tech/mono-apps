import React, { useEffect, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { navigationTheme, palette } from '@/theme';
import HomeScreen from '@/screens/home';
import FavoritesScreen from '@/screens/favorites';
import TripsScreen from '@/screens/trips';
import PostsScreen from '@/screens/posts';
import InboxScreen from '@/screens/inbox';
import ListingDetailScreen from '@/screens/listingDetail';



const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }): BottomTabNavigationOptions => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: palette.surface,
                    borderTopColor: palette.border,
                    paddingTop: 6,
                    paddingBottom: Platform.select({ ios: 22, android: 12 }),
                    height: Platform.select({ ios: 82, android: 72 })
                },
                tabBarActiveTintColor: palette.primary,
                tabBarInactiveTintColor: palette.textMuted,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600'
                },
                tabBarIcon: ({ color, size }: { color: string; size: number }) => {
                    const iconName = route.name === 'Home'
                        ? 'compass-outline'
                        : route.name === 'Favorites'
                            ? 'heart-outline'
                            : route.name === 'Trips'
                                ? 'briefcase-outline'
                                : route.name === 'Posts'
                                    ? 'document-text-outline'
                                    : 'chatbubble-ellipses-outline';
                    return <Ionicons name={iconName} size={size} color={color} />;
                }
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Explore' }} />
            <Tab.Screen name="Favorites" component={FavoritesScreen} />
            <Tab.Screen name="Trips" component={TripsScreen} />
            <Tab.Screen name="Posts" component={PostsScreen} options={{ tabBarLabel: 'Stories' }} />
            <Tab.Screen name="Inbox" component={InboxScreen} />
        </Tab.Navigator>
    );
}

export const AppNavigator: React.FC<{ onReady?: () => void }> = ({ onReady }) => {
    return (
        <NavigationContainer theme={navigationTheme} onReady={onReady}>
            <Stack.Navigator>
                <Stack.Screen name="Root" component={Tabs} options={{ headerShown: false }} />
                <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Listing', headerShown: true }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
