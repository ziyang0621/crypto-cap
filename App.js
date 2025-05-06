import React, { useEffect, useState } from 'react';
import { StyleSheet, View, StatusBar, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import store from './store';
import CryptoListScreen from './screens/CryptoListScreen';
import CryptoDetailScreen from './screens/CryptoDetailScreen';
import HomeScreen from './screens/HomeScreen';
import WatchlistScreen from './screens/WatchlistScreen';
import NewsScreen from './screens/NewsScreen';
import ProfileScreen from './screens/ProfileScreen';
import SearchScreen from './screens/SearchScreen';
import Theme from './tools/Theme';

// 只在Web环境中导入适配器
let PlatformAdapter = null;
if (Platform.OS === 'web') {
  PlatformAdapter = require('./web/PlatformAdapter').default;
}

const Stack = createStackNavigator();

export default function App() {
  const [themeColors, setThemeColors] = useState(Theme.colors);

  // 应用初始化时设置适配
  useEffect(() => {
    if (Platform.OS === 'web' && PlatformAdapter) {
      PlatformAdapter.setupVictoryForWeb();
    }

    // 监听主题变化
    const unsubscribe = Theme.addThemeListener((newColors) => {
      setThemeColors(newColors);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Provider store={store}>
      <View style={styles(themeColors).container}>
        {Platform.OS !== 'web' && (
          <StatusBar
            backgroundColor={themeColors.headerBackground}
            barStyle={themeColors.statusBarStyle}
          />
        )}
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: themeColors.headerBackground,
                // Web环境下添加额外的样式
                ...(Platform.OS === 'web'
                  ? {
                      height: 60,
                      shadowColor: 'transparent',
                      borderBottomWidth: 1,
                      borderBottomColor: themeColors.borderColor,
                    }
                  : {}),
              },
              headerTintColor: themeColors.headerTintColor,
              cardStyle: { backgroundColor: themeColors.backgroundColor },
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: 'Market',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="CryptoList"
              component={CryptoListScreen}
              options={{
                title: 'All Cryptocurrencies',
              }}
            />
            <Stack.Screen
              name="CryptoDetail"
              component={CryptoDetailScreen}
              options={{
                title: 'Details',
              }}
            />
            <Stack.Screen
              name="Watchlist"
              component={WatchlistScreen}
              options={{
                title: 'Watchlist',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="News"
              component={NewsScreen}
              options={{
                title: 'News',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                title: 'Profile',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{
                title: 'Search',
                headerShown: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </Provider>
  );
}

const styles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
      ...(Platform.OS === 'web'
        ? {
            maxWidth: 800,
            width: '100%',
            marginHorizontal: 'auto',
            height: '100vh',
          }
        : {}),
    },
  });
