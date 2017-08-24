import React, { Component } from 'react';
import { StyleSheet, ScrollView, View, Text, Platform } from 'react-native';
import { Button, List, ListItem } from 'react-native-elements';
import { connect } from 'react-redux';
import * as actions from '../actions';

class CryptoListScreen extends Component {
  static navigationOptions = {
    title: 'Crypto Cap List'
  }

  componentDidMount() {
    this.props.fetchCryptoList('USD', 100, (list) => {
      console.log('the list', list);
    });
  }

  renderList(cryptoInfoList) {
    return (
      <List>
        {
          cryptoInfoList.map((item, i) => (
            <ListItem
              hideChevron={true}
              onPress={() => console.log('Pressed')}
              key={i}
              title={item.name}
              subtitle={
                <View style={styles.subtitleView}>
                  <Text style={styles.subtitleText}>{item.price_usd}</Text>
                </View>
              }
            />
          ))
        }
      </List>
    )
  }

  render() {
    console.log('CryptoListScreen render');
    const { cryptoInfo } = this.props;
    if (cryptoInfo && cryptoInfo.list) {
      const listView = this.renderList(cryptoInfo.list);
      return (
        <ScrollView>
          {listView}
        </ScrollView>
      );
    }
    return (
      <View style={styles.loadingView}>
        <Text>Loading...</Text>
      </View>
    );
  }
}

const styles = {
  loadingView: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitleView: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingTop: 5
  },
  subtitleText: {
    paddingLeft: 10,
    color: 'grey'
  }
}

function mapStateToProps({ cryptoInfo }) {
  return { cryptoInfo: cryptoInfo };
}

export default connect(mapStateToProps, actions)(CryptoListScreen);
