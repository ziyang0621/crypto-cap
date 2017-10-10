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
import { Header, Avatar, Button, List, ListItem, SearchBar } from 'react-native-elements';
import { connect } from 'react-redux';
import * as actions from '../actions';

class CryptoListScreen extends Component {
  static navigationOptions = {
    header: ({ navigate }) => {
      return (
        <Header
          centerComponent={
            <Text style={styles.headerTitleTextView}>
              Crypto Cap
            </Text>
          }
          backgroundColor="#031622"
        />
      )
    }
  }

  state = {
    appState: AppState.currentState,
    searchText: '',
    refreshing: false,
  };

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    this.props.fetchCryptoList('USD', 100, (list) => {
      console.log('the list', list);
    });
  }

  componentWillUnmount() {
     AppState.removeEventListener('change', this._handleAppStateChange);
   }

   _handleAppStateChange = (nextAppState) => {
     if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
       this.props.fetchCryptoList('USD', 100, (list) => {
         console.log('the list', list);
       });
     }
     this.setState({appState: nextAppState});
  }

  renderRow = (rowData, sectionId) => {
    const percentColor = parseFloat(rowData.percent_change_24h) >= 0 ? '#65cc00' : '#e6323d';
    const percentChangeStyle = {
      paddingLeft: 10,
      color: percentColor,
      fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : 'HelveticaNeue-Light',
      fontSize: 16,
    }

    return (
      <ListItem
        onPress={() => {
            this.props.selectCrypto(rowData);
            this.props.navigation.navigate('CryptoDetail', {name: rowData.name});
          }
        }
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <Text style={styles.rankText}>{rowData.rank}</Text>
              <Text style={styles.nameText}>{rowData.name}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <Text style={styles.priceText}>${rowData.price_usd}</Text>
              <Text style={percentChangeStyle}>{rowData.percent_change_24h}%</Text>
            </View>
          </View>
        }
      />
    );
  }

  renderList(cryptoInfoList) {
    const { refreshing } = this.state;
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
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
    this.props.fetchCryptoList('USD', 100, (list) => {
      console.log('finished fetching list');
      this.setState({ refreshing: false });
    });
  }

  searchTextChange = (searchText) => {
    this.setState({
      searchText: searchText
    });
  }

  render() {
    const { cryptoInfo } = this.props;
    const { searchText } = this.state;

    if (cryptoInfo && cryptoInfo.list) {
      let inputList = cryptoInfo.list;
      if (searchText) {
        inputList = _.filter(inputList, item => {
          return ((item.symbol.toLowerCase().indexOf(searchText.toLowerCase()) !== -1) ||
            item.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1);
        });
      }
      const cryptoList = this.renderList(inputList);
      return (
        <View
          style={{ flex: 1, paddingTop: 70, backgroundColor: '#031622' }}
          >
          <SearchBar
            containerStyle={{ backgroundColor: '#031622' }}
            clearIcon={{ color: '#86939e', name: 'clear' }}
            onChangeText={this.searchTextChange}
            placeholder='Search' />
          {cryptoList}
        </View>
      );
    }
    return (
      <ActivityIndicator size='large' style={styles.loadingView}/>
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
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'HelveticaNeue-Light',
    fontSize: 20,
  },
  listView: {
    backgroundColor: '#031622',
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

export default connect(mapStateToProps, actions)(CryptoListScreen);
