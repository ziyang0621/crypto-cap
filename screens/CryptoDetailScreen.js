import React, { Component } from 'react';
import moment from 'moment';
import _ from 'lodash';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Avatar, Icon, Button, Card, Divider } from 'react-native-elements';
import { connect } from 'react-redux';
import * as actions from '../actions';
import Util from '../tools/Util';
import LineChart from '../components/LineChart';

class CryptoDetailScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDataPoint: {},
      lineChartTouched: false,
    };
  }

  componentDidMount() {
    const { cryptoInfo } = this.props;

    // Set up navigation options
    this.props.navigation.setOptions({
      headerTitle: 'Details',
      headerLeft: () => (
        <Icon
          name="arrow-back"
          color="#cdd3d7"
          size={30}
          onPress={() => {
            this.props.navigation.goBack();
          }}
          containerStyle={{ marginLeft: 15 }}
        />
      ),
    });

    if (cryptoInfo && cryptoInfo.selectedCrypto) {
      this.props.clearChartData();
      const yesterday = moment().add(-1, 'days').valueOf();
      const today = moment().valueOf();
      this.props.fetchChartData(
        cryptoInfo.selectedCrypto.id,
        yesterday,
        today,
        (chartData, error) => {
          console.log('the chart data', chartData, error);
        }
      );
    }
  }

  renderChartLoadingView = () => {
    return (
      <View style={styles.chartLoadingView}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            paddingBottom: 20,
          }}
        >
          <Text style={styles.loadingChartText}>Loading Chart...</Text>
        </View>
        <ActivityIndicator size="large" style={styles.loadingView} />
      </View>
    );
  };

  renderCryptoDetailView = (crypto) => {
    // Handle undefined values with defaults
    const {
      id = '',
      name = '',
      symbol = '',
      image_url = '',
      price_usd = '0',
      price_btc = '0',
      price_eth = '0',
      available_supply = '0',
      total_supply = '0',
      market_cap_usd = '0',
      percent_change_1h = '0',
      percent_change_24h = '0',
      percent_change_7d = '0',
      '24h_volume_usd': volume_24h = '0',
    } = crypto || {};

    const oneHourPercentColor =
      parseFloat(percent_change_1h) >= 0 ? '#65cc00' : '#e6323d';
    const twentyFourHourPercentColor =
      parseFloat(percent_change_24h) >= 0 ? '#65cc00' : '#e6323d';
    const sevenDayPercentColor =
      parseFloat(percent_change_7d) >= 0 ? '#65cc00' : '#e6323d';

    let chartView = this.renderChartLoadingView();
    const { selectedChartData } = this.props.cryptoInfo;
    if (selectedChartData && selectedChartData.price_usd) {
      // Map chart data points
      const priceData = selectedChartData.price_usd.map((price) => {
        const time = moment(price.x).format('hh:mm a');
        return { ...price, time };
      });

      const { selectedDataPoint } = this.state;
      let dataInfoView = <View />;
      if (!_.isEmpty(selectedDataPoint)) {
        dataInfoView = (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: 20,
              marginBottom: -40,
            }}
          >
            <Text style={styles.selectedPriceText}>
              ${selectedDataPoint.y}{' '}
            </Text>
            <Text style={styles.selectedTimeText}>
              {selectedDataPoint.time}
            </Text>
          </View>
        );
      } else {
        dataInfoView = (
          <Text
            style={{
              ...styles.selectedPriceText,
              textAlign: 'center',
              paddingTop: 20,
              marginBottom: -40,
            }}
          >
            ${price_usd}
          </Text>
        );
      }

      chartView = (
        <View style={styles.chartView}>
          {dataInfoView}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <LineChart
              chartData={priceData}
              onDataPointTouchStart={(dataPoint) => {
                this.setState({
                  selectedDataPoint: dataPoint,
                });
              }}
              onTouchStart={() => {
                this.setState({
                  lineChartTouched: true,
                });
              }}
              onTouchEnd={() => {
                this.setState({
                  lineChartTouched: false,
                  selectedDataPoint: {},
                });
              }}
            />
          </View>
          <Text
            style={{
              ...styles.cardText,
              marginTop: -40,
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            24 Hours Price
          </Text>
        </View>
      );
    }

    return (
      <Card
        title={name}
        key={id}
        titleStyle={styles.cardTitle}
        containerStyle={styles.cardContainer}
      >
        <View style={styles.detailWrapper}>
          <View style={styles.imageContainer}>
            <Avatar
              containerStyle={styles.avatar}
              size="medium"
              rounded
              source={{ uri: image_url }}
            />
          </View>
          {chartView}
          <View style={styles.cardTextView}>
            <Text style={styles.cardText}>Market Cap:</Text>
            <Text style={styles.cardAmountText}>
              ${Util.numberWithCommas(market_cap_usd)}
            </Text>
          </View>
          <View style={styles.cardTextView}>
            <Text style={styles.cardText}>24 Hour Volume:</Text>
            <Text style={styles.cardAmountText}>
              ${Util.numberWithCommas(volume_24h)}
            </Text>
          </View>
          <View style={styles.cardTextView}>
            <Text style={styles.cardText}>Available Supply:</Text>
            <Text style={styles.cardAmountText}>
              {Util.numberWithCommas(available_supply)} {symbol}
            </Text>
          </View>
          <View style={styles.cardTextView}>
            <Text style={styles.cardText}>Total Supply:</Text>
            <Text style={styles.cardAmountText}>
              {Util.numberWithCommas(total_supply)} {symbol}
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.cardTextView}>
            <Text style={styles.cardText}>Price:</Text>
            <Text style={styles.cardAmountText}>${price_usd}</Text>
          </View>
          <View style={styles.cardTextView}>
            <Text style={styles.cardText}>Price BTC:</Text>
            <Text style={styles.cardAmountText}>{price_btc} BTC</Text>
          </View>
          <View style={styles.cardTextView}>
            <Text style={styles.cardText}>Price ETH:</Text>
            <Text style={styles.cardAmountText}>{price_eth} ETH</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.cardTextView}>
            <Text style={styles.cardText}>% Change 1h:</Text>
            <Text
              style={{
                ...styles.percentChangeText,
                color: oneHourPercentColor,
              }}
            >
              {percent_change_1h}%
            </Text>
          </View>
          <View style={styles.cardTextView}>
            <Text style={styles.cardText}>% Change 24h:</Text>
            <Text
              style={{
                ...styles.percentChangeText,
                color: twentyFourHourPercentColor,
              }}
            >
              {percent_change_24h}%
            </Text>
          </View>
          <View style={styles.cardTextView}>
            <Text style={styles.cardText}>% Change 7d:</Text>
            <Text
              style={{
                ...styles.percentChangeText,
                color: sevenDayPercentColor,
              }}
            >
              {percent_change_7d}%
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  render() {
    const { cryptoInfo } = this.props;
    if (cryptoInfo && cryptoInfo.selectedCrypto) {
      const crypto = cryptoInfo.selectedCrypto;
      const detailView = this.renderCryptoDetailView(crypto);
      return (
        <ScrollView style={styles.container}>
          <View style={styles.mainView}>{detailView}</View>
        </ScrollView>
      );
    }
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" style={styles.loadingView} />
      </View>
    );
  }
}

const styles = {
  loadingView: {
    flex: 1,
    backgroundColor: '#031622',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleTextView: {
    color: '#cdd3d7',
    fontFamily:
      Platform.OS === 'android' ? 'sans-serif' : 'HelveticaNeue-Light',
    fontSize: 20,
  },
  scrollView: {
    backgroundColor: '#031622',
  },
  cardContainer: {
    backgroundColor: '#031622',
    borderWidth: 0.5,
    borderColor: '#ebe9f2',
  },
  detailWrapper: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'column',
  },
  chartLoadingView: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  loadingChartText: {
    color: '#cdd3d7',
    fontFamily:
      Platform.OS === 'android' ? 'sans-serif-light' : 'HelveticaNeue-Light',
    fontSize: 15,
  },
  selectedPriceText: {
    color: '#cdd3d7',
    fontFamily:
      Platform.OS === 'android' ? 'sans-serif-light' : 'HelveticaNeue-Light',
    fontSize: 20,
  },
  selectedTimeText: {
    color: '#cdd3d7',
    fontFamily:
      Platform.OS === 'android' ? 'sans-serif-light' : 'HelveticaNeue-Light',
    fontSize: 16,
  },
  chartView: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  cardTextView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  cardTitle: {
    color: '#cdd3d7',
    fontFamily:
      Platform.OS === 'android' ? 'sans-serif-light' : 'HelveticaNeue-Light',
    fontSize: 22,
  },
  cardText: {
    color: '#cdd3d7',
    fontFamily:
      Platform.OS === 'android' ? 'sans-serif-light' : 'HelveticaNeue-Light',
    fontSize: 18,
  },
  cardAmountText: {
    color: '#52a0ff',
    fontFamily:
      Platform.OS === 'android' ? 'sans-serif-light' : 'HelveticaNeue-Light',
    fontSize: 18,
  },
  percentChangeText: {
    fontFamily:
      Platform.OS === 'android' ? 'sans-serif-light' : 'HelveticaNeue-Light',
    fontSize: 18,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  avatar: {
    borderWidth: 2,
    borderColor: '#909499',
  },
  divider: {
    backgroundColor: '#cdd3d7',
    marginTop: 20,
    marginBottom: 20,
  },
};

function mapStateToProps({ cryptoInfo }) {
  return { cryptoInfo };
}

export default connect(mapStateToProps, actions)(CryptoDetailScreen);
