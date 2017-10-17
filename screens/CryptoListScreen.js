import React, { Component } from 'react';
import _ from 'lodash';
import { Constants } from 'expo';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  ListView,
  Platform,
  AppState
} from 'react-native';
import {
  Header,
  Avatar,
  Button,
  List,
  ListItem,
  Icon,
  SearchBar
} from 'react-native-elements';
import { connect } from 'react-redux';
import * as actions from '../actions';

const infoList = ['price_usd', 'price_btc', 'price_eth'];

class CryptoListScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: ({ navigate }) => {
      const { state, setParams } = navigation;
      let headerTitleText = 'Price (USD)';
      if (state.params) {
        const { infoListIndex } = state.params;
        if (infoList[infoListIndex] === 'price_usd') {
          headerTitleText = 'Price (USD)';
        } else if (infoList[infoListIndex] === 'price_btc') {
          headerTitleText = 'Price (BTC)';
        } else if (infoList[infoListIndex] === 'price_eth') {
          headerTitleText = 'Price (ETH)';
        }
      }
      return (
        <Header
          centerComponent={
            <Text style={styles.headerTitleTextView}>{headerTitleText}</Text>
          }
          rightComponent={
            <Icon
              name="exchange"
              type="font-awesome"
              color="#cdd3d7"
              size={25}
              onPress={() => {
                if (state.params) {
                  const { infoListIndex } = state.params;
                  if (infoListIndex === infoList.length - 1) {
                    setParams({ infoListIndex: 0 });
                  } else {
                    setParams({ infoListIndex: infoListIndex + 1 });
                  }
                }
              }}
            />
          }
          backgroundColor="#031622"
        />
      );
    }
  });

  state = {
    appState: AppState.currentState,
    searchText: '',
    refreshing: false
  };

  componentDidMount() {
    this.props.navigation.setParams({ infoListIndex: 0 });
    AppState.addEventListener('change', this._handleAppStateChange);
    this.props.fetchCryptoList('USD', 100, list => {
      console.log('the list', list);
    });
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      this.props.fetchCryptoList('USD', 100, list => {
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
      fontSize: 16
    };

    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <Text style={styles.priceText}>{priceText}</Text>
        <Text style={percentChangeStyle}>{percentText}</Text>
      </View>
    );
  };

  renderRow = (rowData, sectionId) => {
    const { infoListIndex } = this.props.navigation.state.params;

    const infoView = this.renderRowInfo(rowData, infoList[infoListIndex]);

    return (
      <ListItem
        onPress={() => {
          this.props.selectCrypto(rowData);
          this.props.navigation.navigate('CryptoDetail', {
            name: rowData.name
          });
        }}
        containerStyle={styles.listItemContainerView}
        hideChevron={true}
        key={sectionId}
        avatar={
          <Avatar
            containerStyle={styles.avatarContainerView}
            small
            rounded
            source={{ uri: rowData.image_url }}
          />
        }
        title={
          <View style={styles.titleView}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-around' }}
            >
              <Text style={styles.rankText}>{rowData.rank}</Text>
              <Text style={styles.nameText}>{rowData.name}</Text>
            </View>
            {infoView}
          </View>
        }
      />
    );
  };

  renderList(cryptoInfoList) {
    const { refreshing } = this.state;
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });
    const dataSource = ds.cloneWithRows(cryptoInfoList);
    return (
      <List style={styles.listView}>
        <ListView
          enableEmptySections={true}
          renderRow={this.renderRow}
          dataSource={dataSource}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={this.onRefresh}
            />
          }
        />
      </List>
    );
  }

  onRefresh = () => {
    this.setState({ refreshing: true });
    this.props.fetchCryptoList('USD', 100, list => {
      console.log('finished fetching list');
      this.setState({ refreshing: false });
    });
  };

  searchTextChange = searchText => {
    this.setState({
      searchText: searchText
    });
  };

  render() {
    const { cryptoInfo } = this.props;
    const { searchText } = this.state;
    console.log('render', this.props);

    if (cryptoInfo && cryptoInfo.list) {
      let inputList = cryptoInfo.list;
      if (searchText) {
        inputList = _.filter(inputList, item => {
          return (
            item.symbol.toLowerCase().indexOf(searchText.toLowerCase()) !==
              -1 ||
            item.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1
          );
        });
      }
      const cryptoList = this.renderList(inputList);
      return (
        <View style={{ flex: 1, paddingTop: 70, backgroundColor: '#031622' }}>
          <SearchBar
            containerStyle={{ backgroundColor: '#031622' }}
            clearIcon={{ color: '#86939e', name: 'clear' }}
            autoCorrect={false}
            onChangeText={this.searchTextChange}
            returnKeyType="done"
            placeholder="Search"
          />
          {cryptoList}
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
    justifyContent: 'center'
  },
  headerTitleTextView: {
    color: '#cdd3d7',
    fontFamily:
      Platform.OS === 'android' ? 'sans-serif' : 'HelveticaNeue-Light',
    fontSize: 20
  },
  listView: {
    backgroundColor: '#031622',
    paddingBottom: 70
  },
  listItemContainerView: {
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#031622',
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#787c7f'
  },
  avatarContainerView: {
    borderWidth: 0.2,
    borderColor: '#909499'
  },
  titleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 5,
    paddingRight: 5,
    flexWrap: 'wrap'
  },
  rankText: {
    paddingLeft: 5,
    paddingRight: 5,
    color: '#cdd3d7',
    fontFamily:
      Platform.OS === 'android' ? 'sans-serif-light' : 'HelveticaNeue-Light',
    fontSize: 16
  },
  nameText: {
    paddingLeft: 5,
    color: '#cdd3d7',
    fontFamily:
      Platform.OS === 'android' ? 'sans-serif-light' : 'HelveticaNeue-Light',
    fontSize: 16
  },
  priceText: {
    paddingLeft: 5,
    color: '#52a0ff',
    fontFamily:
      Platform.OS === 'android' ? 'sans-serif-light' : 'HelveticaNeue-Light',
    fontSize: 16
  }
};

function mapStateToProps({ cryptoInfo }) {
  return { cryptoInfo: cryptoInfo };
}

export default connect(mapStateToProps, actions)(CryptoListScreen);
