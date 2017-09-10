import React, { Component } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  ListView,
  Platform } from 'react-native';
import { Header, Avatar, Icon, Button, Card } from 'react-native-elements';
import { connect } from 'react-redux';
import * as actions from '../actions';

class CryptoDetailScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: ({ navigate }) => {
      return (
        <Header
          centerComponent={
            <Text style={styles.headerTitleTextView}>
              Details
            </Text>
          }
          leftComponent={
            <Icon
              name="arrow-back"
              color="#cdd3d7"
              onPress={() => {
                navigation.goBack();
              }}
            />
          }
          backgroundColor="#031622"
        />
      )
    }
  })

  renderCryptoDetailView = (crypto) => {
    const { id, name, symbol, price_usd, price_btc,
      available_supply, total_supply, market_cap_usd,
      percent_change_1h, percent_change_24h, percent_change_7d } = crypto;
    return (
      <Card title={name} key={id}>
        <View style={styles.detailWrapper}>
          <Text>Market Cap: ${market_cap_usd}</Text>
          <Text>24 Hour Volume: ${crypto['24h_volume_usd']}</Text>
          <Text>Available Supply: {available_supply} {symbol}</Text>
          <Text>Total Supply: {total_supply} {symbol}</Text>
          <Text>Price: ${price_usd}</Text>
          <Text>Price BTC: {price_btc} BTC</Text>
          <Text>% Change(1h): {percent_change_1h}%</Text>
          <Text>% Change(24h): {percent_change_24h}%</Text>
          <Text>% Change(7d): {percent_change_7d}%</Text>
        </View>
      </Card>
    );
  }

  render() {
    console.log('CryptoDetailScreen render', this.props);
    const { cryptoInfo } = this.props;
    if (cryptoInfo && cryptoInfo.selectedCrypto) {
      return (
        <ScrollView style={styles.scrollView}>
          {this.renderCryptoDetailView(cryptoInfo.selectedCrypto)}
        </ScrollView>
      )
    }

    return (
      <ActivityIndicator size='large' style={styles.loadingView}/>
    );
  }
}

const styles = {
  detailWrapper: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'column',
    justifyContent: 'space-around'
  },
  loadingView: {
    flex: 1,
    backgroundColor: '#031622',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleTextView: {
    color: '#cdd3d7',
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'HelveticaNeue-Light',
    fontSize: 20,
  },
  scrollView: {
    backgroundColor: '#031622',
    marginTop: 64,
  },
  listItemContainerView: {
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#031622',
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#787c7f',
  },
  avatarContainerView: {
    borderWidth: 0.2,
    borderColor: '#909499',
  },
  titleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 5,
    paddingRight: 5,
    flexWrap: 'wrap',
  },
  rankText: {
    paddingLeft: 5,
    paddingRight: 5,
    color: '#cdd3d7',
    fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : 'HelveticaNeue-Light',
    fontSize: 16,
  },
  nameText: {
    paddingLeft: 5,
    color: '#cdd3d7',
    fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : 'HelveticaNeue-Light',
    fontSize: 16,
  },
  priceText: {
    paddingLeft: 5,
    color: '#52a0ff',
    fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : 'HelveticaNeue-Light',
    fontSize: 16,
  }
}

function mapStateToProps({ cryptoInfo }) {
  return { cryptoInfo: cryptoInfo };
}

export default connect(mapStateToProps, actions)(CryptoDetailScreen);
