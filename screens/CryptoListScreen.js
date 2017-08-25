import React, { Component } from 'react';
import { Constants } from 'expo';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
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
          rightComponent={
            <Icon
              name='refresh'
              color='#fff'
              underlayColor="#365161"
              onPress={() => console.log('hello')} />
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

  renderList(cryptoInfoList) {
    const { refreshing } = this.state;
    const refreshControl =
      <RefreshControl
        refreshing={refreshing}
        onRefresh={this.onRefresh}
      />;
    return (
      <List>
        {refreshControl}
        {
          cryptoInfoList.map((item, i) => (
            <ListItem
              containerStyle={styles.listItemContainerView}
              hideChevron={true}
              key={i}
              avatar={
                <Avatar
                  containerStyle={styles.avatarContainerView}
                  small
                  rounded
                  source={{ uri: item.image_url }}
                />
              }
              title={
                <View style={styles.titleView}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    <Text style={styles.rankText}>{item.rank}</Text>
                    <Text style={styles.nameText}>{item.name}</Text>
                  </View>
                  <Text style={styles.priceText}>${item.price_usd}</Text>
                </View>
              }
            />
          ))
        }
      </List>
    )
  }

  onRefresh = () => {
    this.setState({ refreshing: true });
    setTimeout(()=>{
      this.setState({ refreshing: false });
    }, 2000)

    // this.props.fetchCryptoList('USD', 100, (list) => {
    //   debugger;
    // });
  }

  render() {
    console.log('CryptoListScreen render');
    const { cryptoInfo } = this.props;

    if (cryptoInfo && cryptoInfo.list) {
      const listView = this.renderList(cryptoInfo.list);
      return (
        <ScrollView style={styles.scrollView}>
          {listView}
        </ScrollView>
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
    fontFamily: 'Helvetica Neue',
    fontSize: 20,
  },
  scrollView: {
    backgroundColor: '#031622',
    marginTop: Platform.OS === 'android' ? 0 : 64,
  },
  listItemContainerView: {
    backgroundColor: '#031622',
    borderTopWidth: 0,
    borderBottomWidth: 0.5,
    borderBottomColor: '#787c7f',
  },
  avatarContainerView: {
    borderWidth: 0.2,
    borderColor: '#909499',
  },
  titleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 20,
    flexWrap: 'wrap',
  },
  rankText: {
    paddingLeft: 10,
    paddingRight: 5,
    color: '#cdd3d7',
    fontFamily: 'HelveticaNeue-Light',
    fontSize: 17,
  },
  nameText: {
    paddingLeft: 10,
    color: '#cdd3d7',
    fontFamily: 'HelveticaNeue-Light',
    fontSize: 17,
  },
  priceText: {
    paddingLeft: 10,
    color: '#52a0ff',
    fontFamily: 'HelveticaNeue-Light',
    fontSize: 17,
  }
}

function mapStateToProps({ cryptoInfo }) {
  return { cryptoInfo: cryptoInfo };
}

export default connect(mapStateToProps, actions)(CryptoListScreen);
