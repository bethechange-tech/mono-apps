import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../screens/home';
import ArticleDetailScreen from '../../screens/articleDetail';
import CreateStoryScreen from '../../screens/createStory';

const Stack = createNativeStackNavigator();

export function HomeStackNavigator() {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="Home" component={HomeScreen} />
			<Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
			<Stack.Screen name="CreateStory" component={CreateStoryScreen} />
		</Stack.Navigator>
	);
}
