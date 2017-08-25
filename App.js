import React from 'react';
import { Constants } from 'expo';
import { StyleSheet, Text, View, ScrollView, StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import store from './store';
import { StackNavigator } from 'react-navigation';
import CryptoListScreen from './screens/CryptoListScreen';

export default class App extends React.Component {
  render() {
    const MainNavigator = StackNavigator({
      CryptoList: { screen: CryptoListScreen }
    });

    return (
      <Provider store={store}>
        <View style={styles.container}>
          <StatusBar
             backgroundColor="#031622"
             barStyle="light-content"
          />
          <MainNavigator/>
        </View>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#031622',
    paddingTop: Constants.statusBarHeight
  },
});
