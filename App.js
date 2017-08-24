import React from 'react';
import { Constants } from 'expo';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
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
          <MainNavigator/>
        </View>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Constants.statusBarHeight
  },
});
