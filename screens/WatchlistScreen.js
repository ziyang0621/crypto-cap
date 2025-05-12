import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { ListItem, Avatar, Icon, SearchBar } from 'react-native-elements';
import { connect } from 'react-redux';
import {
  removeFromWatchlist,
  fetchCryptoList,
  selectCrypto,
} from '../actions/crypto_info_actions';
import BottomNavBar from '../components/BottomNavBar';
import Theme from '../tools/Theme';
import { MaterialIcons } from '@expo/vector-icons';
import Util from '../tools/Util';

const WatchlistScreen = ({
  navigation,
  watchlist,
  removeFromWatchlist,
  fetchCryptoList,
  selectCrypto,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [themeColors, setThemeColors] = useState(Theme.colors);

  useEffect(() => {
    // Listen for theme changes
    const unsubscribe = Theme.addThemeListener((newColors) => {
      setThemeColors(newColors);
      updateNavigationOptions();
    });

    // Initial setup of navigation options
    updateNavigationOptions();

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const updateNavigationOptions = () => {
    const colors = Theme.getColors();
    navigation.setOptions({
      headerShown: false,
    });
  };

  // Filter watchlist based on search text
  const getFilteredWatchlist = () => {
    if (!searchText.trim()) return watchlist;

    const lowercasedSearchText = searchText.toLowerCase();
    return watchlist.filter(
      (item) =>
        item.name.toLowerCase().includes(lowercasedSearchText) ||
        item.symbol.toLowerCase().includes(lowercasedSearchText)
    );
  };

  // Handle refreshing the watchlist
  const onRefresh = () => {
    setRefreshing(true);
    fetchCryptoList('USD', 100, () => {
      setRefreshing(false);
    });
  };

  // Confirm before removing from watchlist
  const confirmRemoveFromWatchlist = (coin) => {
    Alert.alert(
      'Remove from Watchlist',
      `Are you sure you want to remove ${coin.name} from your watchlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromWatchlist(coin.id),
        },
      ]
    );
  };

  // Render each crypto item in the watchlist
  const renderItem = ({ item }) => {
    const isPositive = parseFloat(item.percent_change_24h) >= 0;

    return (
      <TouchableOpacity
        onPress={() => {
          selectCrypto(item);
          setTimeout(() => {
            navigation.navigate('CryptoDetail', {
              name: item.name,
              id: item.id,
              symbol: item.symbol,
              crypto: item,
            });
          }, 100);
        }}
      >
        <ListItem
          containerStyle={{
            backgroundColor: themeColors.cardBackground,
            borderBottomWidth: 1,
            borderBottomColor: themeColors.borderColor,
            paddingVertical: 15,
          }}
        >
          <Avatar
            source={{ uri: item.image_url }}
            rounded
            size="medium"
            containerStyle={{ marginRight: 10 }}
          />
          <ListItem.Content>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: themeColors.textPrimary,
                      marginRight: 8,
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: themeColors.textSecondary,
                    }}
                  >
                    {item.symbol}
                  </Text>
                </View>
                <Text
                  style={{
                    color: themeColors.textLight,
                    fontSize: 14,
                    marginTop: 5,
                  }}
                >
                  ${Util.numberWithCommas(item.market_cap_usd)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: themeColors.textPrimary,
                  }}
                >
                  $
                  {parseFloat(item.price_usd).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 5,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: isPositive
                        ? themeColors.success
                        : themeColors.danger,
                      marginRight: 5,
                    }}
                  >
                    {isPositive ? '+' : ''}
                    {item.percent_change_24h}%
                  </Text>
                  <MaterialIcons
                    name={isPositive ? 'arrow-upward' : 'arrow-downward'}
                    size={14}
                    color={
                      isPositive ? themeColors.success : themeColors.danger
                    }
                  />
                </View>
              </View>
            </View>
          </ListItem.Content>
          <TouchableOpacity
            onPress={() => confirmRemoveFromWatchlist(item)}
            style={{ padding: 8 }}
          >
            <MaterialIcons name="star" size={24} color={themeColors.primary} />
          </TouchableOpacity>
        </ListItem>
      </TouchableOpacity>
    );
  };

  // Get filtered watchlist
  const filteredWatchlist = getFilteredWatchlist();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themeColors.backgroundColor },
      ]}
    >
      <StatusBar
        backgroundColor={themeColors.backgroundColor}
        barStyle={themeColors.statusBarStyle}
      />

      {/* Header */}
      <View
        style={[styles.header, { backgroundColor: themeColors.cardBackground }]}
      >
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
          Watchlist
        </Text>
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Search your watchlist..."
            onChangeText={setSearchText}
            value={searchText}
            containerStyle={{
              backgroundColor: 'transparent',
              borderTopWidth: 0,
              borderBottomWidth: 0,
              padding: 0,
              width: '100%',
            }}
            inputContainerStyle={{
              backgroundColor: themeColors.inputBackground,
              borderRadius: 10,
              height: 40,
            }}
            inputStyle={{ color: themeColors.textPrimary }}
            placeholderTextColor={themeColors.textLight}
            searchIcon={
              <MaterialIcons
                name="search"
                size={24}
                color={themeColors.textLight}
              />
            }
            clearIcon={
              <MaterialIcons
                name="clear"
                size={24}
                color={themeColors.textLight}
              />
            }
            round
          />
        </View>
      </View>

      {/* Watchlist Content */}
      {watchlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name="star-outline"
            size={60}
            color={themeColors.textLight}
          />
          <Text style={[styles.emptyText, { color: themeColors.textPrimary }]}>
            Your watchlist is empty
          </Text>
          <Text style={[styles.emptySubText, { color: themeColors.textLight }]}>
            Add cryptocurrencies from the market to track them here
          </Text>
          <TouchableOpacity
            style={[
              styles.browseButton,
              { backgroundColor: themeColors.primary },
            ]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.browseButtonText}>Browse Market</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredWatchlist}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={themeColors.primary}
              colors={[themeColors.primary]}
            />
          }
          ListEmptyComponent={
            searchText ? (
              <View style={styles.emptySearchContainer}>
                <Text
                  style={[
                    styles.emptySearchText,
                    { color: themeColors.textPrimary },
                  ]}
                >
                  No results found for "{searchText}"
                </Text>
              </View>
            ) : null
          }
        />
      )}

      <BottomNavBar
        navigation={navigation}
        activeScreen="Watchlist"
        themeColors={themeColors}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  browseButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  emptySearchContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptySearchText: {
    fontSize: 16,
  },
});

const mapStateToProps = (state) => ({
  watchlist: state.watchlist.list,
});

export default connect(mapStateToProps, {
  removeFromWatchlist,
  fetchCryptoList,
  selectCrypto,
})(WatchlistScreen);
