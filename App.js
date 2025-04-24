import React, { useEffect } from 'react';
import { StyleSheet, View, StatusBar, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import store from './store';
import CryptoListScreen from './screens/CryptoListScreen';
import CryptoDetailScreen from './screens/CryptoDetailScreen';

// 只在Web环境中导入适配器
let PlatformAdapter = null;
if (Platform.OS === 'web') {
  PlatformAdapter = require('./web/PlatformAdapter').default;
}

const Stack = createStackNavigator();

export default function App() {
  // 应用初始化时设置适配
  useEffect(() => {
    if (Platform.OS === 'web' && PlatformAdapter) {
      PlatformAdapter.setupVictoryForWeb();
    }
  }, []);

  return (
    <Provider store={store}>
      <View style={styles.container}>
        {Platform.OS !== 'web' && (
          <StatusBar backgroundColor="#031622" barStyle="light-content" />
        )}
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="CryptoList"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#031622',
                // Web环境下添加额外的样式
                ...(Platform.OS === 'web'
                  ? {
                      height: 60,
                      shadowColor: 'transparent',
                      borderBottomWidth: 1,
                      borderBottomColor: '#1a3752',
                    }
                  : {}),
              },
              headerTintColor: '#fff',
              cardStyle: { backgroundColor: '#031622' },
            }}
          >
            <Stack.Screen
              name="CryptoList"
              component={CryptoListScreen}
              options={{
                title: 'Crypto Cap',
              }}
            />
            <Stack.Screen
              name="CryptoDetail"
              component={CryptoDetailScreen}
              options={{
                title: 'Details',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#031622',
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
