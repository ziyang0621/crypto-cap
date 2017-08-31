import React, { Component } from 'react';
import { Constants } from 'expo';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  ListView,
  Platform } from 'react-native';
import { Header, Avatar, Icon, Button, List, ListItem } from 'react-native-elements';
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

  state = { refreshing: false };

  componentDidMount() {
    this.props.fetchCryptoList('USD', 100, (list) => {
      console.log('the list', list);
    });
  }

  renderRow = (rowData, sectionId) => {
    const percentColor = parseInt(rowData.percent_change_24h) >= 0 ? '#65cc00' : '#e6323d';
    const percentChangeStyle = {
      paddingLeft: 10,
      color: percentColor,
      fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : 'HelveticaNeue-Light',
      fontSize: 16,
    }

    return (
      <ListItem
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
    console.log('refreshing....');
    this.setState({ refreshing: true });
    this.props.fetchCryptoList('USD', 100, (list) => {
      console.log('finished fetching list');
      this.setState({ refreshing: false });
    });
  }

  render() {
    console.log('CryptoListScreen render');
    const { cryptoInfo } = this.props;

    if (cryptoInfo && cryptoInfo.list) {
      return (
        this.renderList(cryptoInfo.list)
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
    marginTop: 64,
  },
  listItemContainerView: {
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
