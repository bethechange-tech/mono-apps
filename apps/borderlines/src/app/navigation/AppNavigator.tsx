import { SafeAreaView, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeStackNavigator } from './HomeStackNavigator';
import { navigationTheme, palette } from '@/theme';
import BookmarkScreen from '@/screens/bookmarks';
import { AppTabBar } from './AppTabBar';

const Tab = createBottomTabNavigator();

function PlaceholderScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
          gap: 12,
        }}
      >
        <View
          style={{
            width: 54,
            height: 54,
            borderRadius: 27,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#EEF2FF',
          }}
        >
          <Ionicons name="person-circle-outline" size={26} color={palette.primary} />
        </View>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 17,
            fontWeight: '600',
            color: palette.text,
          }}
        >
          Profile is in progress
        </Text>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 14,
            color: palette.textMuted,
            lineHeight: 20,
          }}
        >
          We are designing a space to personalise your routes, track updates, and manage saved
          stories.
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        initialRouteName="HomeTab"
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <AppTabBar {...props} />}
      >
        <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
        <Tab.Screen name="BookmarkTab" component={BookmarkScreen} />
        <Tab.Screen name="ProfileTab" component={PlaceholderScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
