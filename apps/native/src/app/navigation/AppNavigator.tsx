import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    BottomTabBar,
    createBottomTabNavigator,
    type BottomTabBarProps,
    type BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import { NavigationContainer, type NavigationContainerProps } from '@react-navigation/native';
import {
    createNativeStackNavigator,
    type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { navigationTheme, palette } from '@/theme';
import HomeScreen from '@/screens/home';
import FavoritesScreen from '@/screens/favorites';
import CreateStorageScreen from '@/screens/trips';
import PostsScreen from '@/screens/posts';
import InboxScreen from '@/screens/inbox';
import InboxThreadScreen from '@/screens/inboxThread';
import InboxUserSearchScreen from '@/screens/inboxUserSearch';
import InboxProfileScreen from '@/screens/inboxProfile';
import ListingDetailScreen from '@/screens/listingDetail';
import ListingPostsScreen from '@/screens/listingPosts';
import PostDetailScreen from '@/screens/postDetail';
import BackButton from '@/app/navigation/BackButton';

type TabRouteName = 'Home' | 'Favorites' | 'Create' | 'Posts' | 'Inbox';

type StackScreenConfig = {
    name: string;
    component: React.ComponentType;
    options?: NativeStackNavigationOptions;
};

const Tab = createBottomTabNavigator();

const stackContentStyle = {
    paddingBottom: 96,
    backgroundColor: palette.background,
} as const;

const styles = StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 0,
        zIndex: 10,
    },
    tabBarSurface: {
        backgroundColor: palette.surface,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: palette.border,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'visible',
    },
    tabBar: {
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        elevation: 0,
        height: 72,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
});

const TAB_ICON_MAP: Record<TabRouteName, keyof typeof Ionicons.glyphMap> = {
    Home: 'compass-outline',
    Favorites: 'heart-outline',
    Create: 'add-circle',
    Posts: 'document-text-outline',
    Inbox: 'chatbubble-ellipses-outline',
} as const;

const FALLBACK_ICON: keyof typeof Ionicons.glyphMap = 'ellipse-outline';

const renderTabIcon = (routeName: TabRouteName, color: string, size: number) => (
    <Ionicons name={TAB_ICON_MAP[routeName] ?? FALLBACK_ICON} size={size} color={color} />
);

const PrimaryTabBar: React.FC<BottomTabBarProps> = React.memo((props) => {
    const insets = useSafeAreaInsets();
    const bottomInset = Math.max(insets.bottom, 20);

    return (
        <View pointerEvents="box-none" style={[styles.tabBarContainer, { bottom: bottomInset }]}>
            <View
                style={[
                    styles.tabBarSurface,
                    {
                        paddingBottom: Math.max(insets.bottom, 14),
                        paddingHorizontal: 18,
                    },
                ]}
            >
                <BottomTabBar {...props} />
            </View>
        </View>
    );
});

PrimaryTabBar.displayName = 'PrimaryTabBar';

const baseTabOptions: BottomTabNavigationOptions = {
    headerShown: false,
    tabBarActiveTintColor: palette.primary,
    tabBarInactiveTintColor: palette.textMuted,
    tabBarStyle: styles.tabBar,
    tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    tabBarHideOnKeyboard: true,
};

const withBackButton = (options: NativeStackNavigationOptions): NativeStackNavigationOptions => ({
    headerShown: true,
    headerLeft: () => <BackButton />,
    headerShadowVisible: false,
    ...options,
});

const createStackScreen = (
    name: string,
    component: React.ComponentType,
    options?: NativeStackNavigationOptions,
): StackScreenConfig => ({
    name,
    component,
    options,
});

const listingDetailScreen = createStackScreen(
    'ListingDetail',
    ListingDetailScreen,
    withBackButton({ title: 'Listing' }),
);

const listingPostsScreen = createStackScreen(
    'ListingPosts',
    ListingPostsScreen,
    withBackButton({ title: 'Host Stories' }),
);

const postDetailScreen = createStackScreen('PostDetail', PostDetailScreen, withBackButton({ title: 'Story' }));

const inboxThreadScreen = createStackScreen('InboxThread', InboxThreadScreen, withBackButton({ title: 'Messages' }));
const inboxUserSearchScreen = createStackScreen('InboxUserSearch', InboxUserSearchScreen, withBackButton({ title: 'Find users' }));
const inboxProfileScreen = createStackScreen('InboxProfile', InboxProfileScreen, withBackButton({ title: 'Profile' }));

const buildStackNavigator = (screens: ReadonlyArray<StackScreenConfig>) => {
    const Stack = createNativeStackNavigator();

    const Navigator: React.FC = () => (
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: stackContentStyle }}>
            {screens.map(({ name, component, options }) => (
                <Stack.Screen key={name} name={name} component={component} options={options} />
            ))}
        </Stack.Navigator>
    );

    Navigator.displayName = `${screens[0]?.name ?? 'Stack'}Navigator`;
    return Navigator;
};

const ExploreNavigator = buildStackNavigator([
    createStackScreen('ExploreHome', HomeScreen),
    listingDetailScreen,
    listingPostsScreen,
    postDetailScreen,
]);

const FavoritesNavigator = buildStackNavigator([
    createStackScreen('FavoritesHome', FavoritesScreen),
    listingDetailScreen,
    listingPostsScreen,
    postDetailScreen,
]);

const CreateNavigator = buildStackNavigator([
    createStackScreen('CreateStorage', CreateStorageScreen, withBackButton({ title: 'Create storage' })),
    listingDetailScreen,
    listingPostsScreen,
    postDetailScreen,
]);

const StoriesNavigator = buildStackNavigator([
    createStackScreen('StoriesFeed', PostsScreen),
    postDetailScreen,
    listingDetailScreen,
    listingPostsScreen,
]);

const InboxNavigator = buildStackNavigator([
    createStackScreen('InboxHome', InboxScreen),
    inboxThreadScreen,
    inboxUserSearchScreen,
    inboxProfileScreen,
    postDetailScreen,
    listingDetailScreen,
    listingPostsScreen,
]);

const tabScreens: ReadonlyArray<{
    name: TabRouteName;
    label: string;
    component: React.ComponentType;
}> = [
        { name: 'Home', label: 'Explore', component: ExploreNavigator },
        { name: 'Favorites', label: 'Favorites', component: FavoritesNavigator },
        { name: 'Create', label: 'Create', component: CreateNavigator },
        { name: 'Posts', label: 'Stories', component: StoriesNavigator },
        { name: 'Inbox', label: 'Inbox', component: InboxNavigator },
    ];

const Tabs = () => (
    <Tab.Navigator
        tabBar={(props) => <PrimaryTabBar {...props} />}
        screenOptions={({ route }) => ({
            ...baseTabOptions,
            tabBarIcon: ({ color, size }) => renderTabIcon(route.name as TabRouteName, color, size),
        })}
    >
        {tabScreens.map(({ name, component, label }) => (
            <Tab.Screen key={name} name={name} component={component} options={{ tabBarLabel: label }} />
        ))}
    </Tab.Navigator>
);

type AppNavigatorProps = Pick<NavigationContainerProps, 'onReady'>;

export const AppNavigator: React.FC<AppNavigatorProps> = ({ onReady }) => (
    <NavigationContainer theme={navigationTheme} onReady={onReady}>
        <Tabs />
    </NavigationContainer>
);

export default AppNavigator;
