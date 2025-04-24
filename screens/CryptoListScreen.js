import React, { Component } from 'react';
import _ from 'lodash';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  Platform,
  AppState,
  FlatList,
} from 'react-native';
import {
  Avatar,
  Button,
  Icon,
  SearchBar,
  ButtonGroup,
  ListItem,
} from 'react-native-elements';
import Util from '../tools/Util';
import { connect } from 'react-redux';
import * as actions from '../actions';

const infoList = ['price_usd', 'price_btc', 'price_eth'];

class CryptoListScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appState: AppState.currentState,
      searchText: '',
      selectedIndex: 0,
      refreshing: false,
      infoListIndex: 0,
    };
  }

  componentDidMount() {
    this.props.navigation.setOptions({
      headerTitle: this.getHeaderTitle(),
      headerRight: () => (
        <Icon
          name="exchange"
          type="font-awesome"
          color="#cdd3d7"
          size={25}
          onPress={this.toggleInfoType}
          containerStyle={{ marginRight: 15 }}
        />
      ),
      headerStyle: {
        backgroundColor: '#031622',
      },
      headerTintColor: '#fff',
    });

    AppState.addEventListener('change', this._handleAppStateChange);
    this.props.fetchCryptoList('USD', 100, (list) => {
      console.log('the list', list);
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.infoListIndex !== this.state.infoListIndex) {
      this.props.navigation.setOptions({
        headerTitle: this.getHeaderTitle(),
      });
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  getHeaderTitle = () => {
    const { infoListIndex } = this.state;
    let headerTitleText = 'Price (USD)';

    if (infoList[infoListIndex] === 'price_usd') {
      headerTitleText = 'Price (USD)';
    } else if (infoList[infoListIndex] === 'price_btc') {
      headerTitleText = 'Price (BTC)';
    } else if (infoList[infoListIndex] === 'price_eth') {
      headerTitleText = 'Price (ETH)';
    }

    return headerTitleText;
  };

  toggleInfoType = () => {
    const { infoListIndex } = this.state;
    if (infoListIndex === infoList.length - 1) {
      this.setState({ infoListIndex: 0 });
    } else {
      this.setState({ infoListIndex: infoListIndex + 1 });
    }
  };

  _handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      this.props.fetchCryptoList('USD', 100, (list) => {
        console.log('the list', list);
      });
    }
    this.setState({ appState: nextAppState });
  };

  renderRowInfo = (rowData, infoListItem) => {
    let priceText = '';
    let percentText = '';
    let percentColor = '#65cc00';
    if (infoListItem === 'price_usd') {
      percentColor =
        parseFloat(rowData.percent_change_24h) >= 0 ? '#65cc00' : '#e6323d';
      priceText = '$' + rowData.price_usd;
      percentText = rowData.percent_change_24h + '%';
    } else if (infoListItem === 'price_btc') {
      percentColor =
        rowData.percent_change_24h_btc >= 0 ? '#65cc00' : '#e6323d';
      priceText = rowData.price_btc + ' BTC';
      percentText = rowData.percent_change_24h_btc + '%';
    } else if (infoListItem === 'price_eth') {
      percentColor =
        rowData.percent_change_24h_eth >= 0 ? '#65cc00' : '#e6323d';
      priceText = rowData.price_eth + ' ETH';
      percentText = rowData.percent_change_24h_eth + '%';
    }

    const percentChangeStyle = {
      paddingLeft: 10,
      color: percentColor,
      fontFamily:
        Platform.OS === 'android' ? 'sans-serif-light' : 'HelveticaNeue-Light',
      fontSize: 16,
    };

    return (
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.priceText}>{priceText}</Text>
        <Text style={percentChangeStyle}>{percentText}</Text>
      </View>
    );
  };

  renderItem = ({ item, index }) => {
    const { infoListIndex } = this.state;
    const infoView = this.renderRowInfo(item, infoList[infoListIndex]);

    return (
      <ListItem
        onPress={() => {
          this.props.selectCrypto(item);
          this.props.navigation.navigate('CryptoDetail', {
            name: item.name,
          });
        }}
        containerStyle={styles.listItemContainerView}
        key={index}
      >
        <Avatar
          containerStyle={styles.avatarContainerView}
          size="small"
          rounded
          source={{ uri: item.image_url }}
        />
        <ListItem.Content>
          <View style={styles.titleView}>
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'space-around',
              }}
            >
              <View
                style={{ flexDirection: 'row', justifyContent: 'flex-start' }}
              >
                <Text style={styles.rankText}>{item.rank}</Text>
                <Text style={styles.nameText}>{item.name}</Text>
              </View>
              <Text style={styles.marketCapText}>
                ${Util.numberWithCommas(item.market_cap_usd)}
              </Text>
            </View>
            {infoView}
          </View>
        </ListItem.Content>
      </ListItem>
    );
  };

  renderList(cryptoInfoList) {
    const { refreshing } = this.state;

    return (
      <FlatList
        data={cryptoInfoList}
        renderItem={this.renderItem}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={this.onRefresh}
            tintColor="white"
            style={{ backgroundColor: '#031622' }}
          />
        }
      />
    );
  }

  onRefresh = () => {
    this.setState({ refreshing: true });
    this.props.fetchCryptoList('USD', 100, (list) => {
      console.log('finished fetching list');
      this.setState({ refreshing: false });
    });
  };

  searchTextChange = (searchText) => {
    this.setState({
      searchText: searchText,
    });
  };

  updateIndex = (selectedIndex) => {
    const { sortOptions } = this.props.cryptoInfo;
    if (selectedIndex === 0) {
      this.props.updateSortOptions({
        marketCap: sortOptions.marketCap === 'desc' ? 'asc' : 'desc',
        percentChange: '',
      });
    } else if (selectedIndex === 1) {
      this.props.updateSortOptions({
        marketCap: '',
        percentChange: sortOptions.percentChange === 'desc' ? 'asc' : 'desc',
      });
    }

    this.setState({ selectedIndex });
  };

  render() {
    const { cryptoInfo } = this.props;
    const { searchText, selectedIndex } = this.state;
    console.log('render', this.props);

    let sortOptionsView = <View />;

    if (cryptoInfo && cryptoInfo.list) {
      let inputList = cryptoInfo.list;
      if (searchText) {
        inputList = _.filter(inputList, (item) => {
          return (
            item.symbol.toLowerCase().indexOf(searchText.toLowerCase()) !==
              -1 ||
            item.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1
          );
        });
      }
      if (cryptoInfo.sortOptions) {
        let sortButtons = [];

        if (cryptoInfo.sortOptions.marketCap === '') {
          sortButtons.push('Market Cap');
        } else if (cryptoInfo.sortOptions.marketCap === 'desc') {
          inputList = _.sortBy(inputList, (crypto) => {
            return -parseFloat(crypto.market_cap_usd);
          });
          sortButtons.push('Market Cap ↓');
        } else if (cryptoInfo.sortOptions.marketCap === 'asc') {
          inputList = _.sortBy(inputList, (crypto) => {
            return parseFloat(crypto.market_cap_usd);
          });
          sortButtons.push('Market Cap ↑');
        }

        if (cryptoInfo.sortOptions.percentChange === '') {
          sortButtons.push('Percent Change');
        } else if (cryptoInfo.sortOptions.percentChange === 'desc') {
          inputList = _.sortBy(inputList, (crypto) => {
            return -parseFloat(crypto.percent_change_24h);
          });
          sortButtons.push('Percent Change ↓');
        } else if (cryptoInfo.sortOptions.percentChange === 'asc') {
          inputList = _.sortBy(inputList, (crypto) => {
            return parseFloat(crypto.percent_change_24h);
          });
          sortButtons.push('Percent Change ↑');
        }

        sortOptionsView = (
          <ButtonGroup
            onPress={this.updateIndex}
            selectedIndex={selectedIndex}
            buttons={sortButtons}
            containerStyle={{
              height: 30,
              backgroundColor: '#031622',
            }}
            textStyle={{ color: '#52a0ff' }}
            selectedTextStyle={{ color: '#cdd3d7' }}
            selectedBackgroundColor={'#67737a'}
          />
        );
      }
      const cryptoList = this.renderList(inputList);
      return (
        <View
          style={{
            flex: 1,
            paddingBottom: Platform.OS === 'android' ? 100 : 90,
            backgroundColor: '#031622',
            flexDirection: 'column',
          }}
        >
          <SearchBar
            containerStyle={{ backgroundColor: '#031622' }}
            clearIcon={{ color: '#86939e', name: 'clear' }}
            autoCorrect={false}
            onChangeText={this.searchTextChange}
            returnKeyType="done"
            placeholder="Search"
          />
          {cryptoList}
          {sortOptionsView}
        </View>
      );
    }
    return <ActivityIndicator size="large" style={styles.loadingView} />;
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
  listView: {
    backgroundColor: '#031622',
    paddingBottom: 70,
    marginBottom: 100,
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
    alignItems: 'center',
  },
  rankText: {
    paddingLeft: 5,
    paddingRight: 5,
    color: '#cdd3d7',
    fontFamily:
      Platform.OS === 'android' ? 'sans-serif-light' : 'HelveticaNeue-Light',
    fontSize: 16,
  },
  nameText: {
    paddingLeft: 5,
    color: '#cdd3d7',
    fontFamily:
      Platform.OS === 'android' ? 'sans-serif-light' : 'HelveticaNeue-Light',
    fontSize: 16,
  },
  marketCapText: {
    paddingLeft: 5,
    marginTop: 5,
    color: '#66696b',
    fontFamily:
      Platform.OS === 'android' ? 'sans-serif-light' : 'HelveticaNeue-Light',
    fontSize: 14,
  },
  priceText: {
    paddingLeft: 5,
    color: '#52a0ff',
    fontFamily:
      Platform.OS === 'android' ? 'sans-serif-light' : 'HelveticaNeue-Light',
    fontSize: 16,
  },
};

function mapStateToProps({ cryptoInfo }) {
  return { cryptoInfo };
}

export default connect(mapStateToProps, actions)(CryptoListScreen);
