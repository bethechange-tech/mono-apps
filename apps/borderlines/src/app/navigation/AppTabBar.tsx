import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette } from '@/theme';
import { appTabBarStyles as styles } from './AppTabBar.styles';

type IconName = keyof typeof Ionicons.glyphMap;

type TabConfig = {
  label: string;
  activeIcon: IconName;
  inactiveIcon: IconName;
};

const TAB_CONFIG: Record<string, TabConfig> = {
  HomeTab: {
    label: 'Discover',
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
  },
  BookmarkTab: {
    label: 'Bookmarks',
    activeIcon: 'bookmark',
    inactiveIcon: 'bookmark-outline',
  },
  ProfileTab: {
    label: 'Profile',
    activeIcon: 'person',
    inactiveIcon: 'person-outline',
  },
};

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const routes = useMemo(() => state.routes, [state.routes]);

  const focusedRoute = routes[state.index];
  const focusedNestedRouteName = getFocusedRouteNameFromRoute(focusedRoute) ?? focusedRoute.name;

  const shouldHideTabBar = focusedRoute.name === 'HomeTab' && focusedNestedRouteName === 'CreateStory';

  if (shouldHideTabBar) {
    return null;
  }

  const handlePress = (routeName: string, index: number) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: routes[index].key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const handleLongPress = (_routeName: string, index: number) => {
    navigation.emit({
      type: 'tabLongPress',
      target: routes[index].key,
    });
  };

  const handleCreateStory = () => {
    navigation.navigate('HomeTab', {
      screen: 'CreateStory',
    });
  };

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, 16), paddingTop: 12 },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.shell} pointerEvents="box-none">
        <View style={styles.container}>
          {routes.map((route, index) => {
            const isFocused = state.index === index;
            const config = TAB_CONFIG[route.name] ?? {
              label: route.name,
              activeIcon: 'ellipse' as IconName,
              inactiveIcon: 'ellipse-outline' as IconName,
            };
            const { options } = descriptors[route.key];
            const tabBarTestID =
              'tabBarTestID' in options
                ? (options as { tabBarTestID?: string }).tabBarTestID
                : undefined;

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={tabBarTestID}
                onPress={() => handlePress(route.name, index)}
                onLongPress={() => handleLongPress(route.name, index)}
                activeOpacity={0.9}
                style={[styles.tab, isFocused && styles.tabActive]}
              >
                <Ionicons
                  name={isFocused ? config.activeIcon : config.inactiveIcon}
                  size={20}
                  color={isFocused ? '#FFFFFF' : palette.textSubtle}
                />
                <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default AppTabBar;
