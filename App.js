import React from 'react';
import { Constants } from 'expo';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Provider } from 'react-redux';
import store from './store';
import { StackNavigator } from 'react-navigation';
import CryptoListScreen from './screens/CryptoListScreen';
import CryptoDetailScreen from './screens/CryptoDetailScreen';

export default class App extends React.Component {
  render() {
    const MainNavigator = StackNavigator({
      CryptoList: { screen: CryptoListScreen },
      CryptoDetail: { screen: CryptoDetailScreen }
    });

    return (
      <Provider store={store}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <StatusBar backgroundColor="#031622" barStyle="light-content" />
            <MainNavigator />
          </View>
        </TouchableWithoutFeedback>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#031622'
  }
});
