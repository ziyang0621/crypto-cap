import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Keyboard,
  Platform,
  TextInput,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { SearchBar, Avatar, Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import * as actions from '../actions';
import Theme from '../tools/Theme';
import BottomNavBar from '../components/BottomNavBar';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { formatPrice, formatMarketCap } from '../tools/helpers';

const SearchScreen = ({
  navigation,
  cryptoList,
  selectCrypto,
  fetchCryptoList,
}) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showRecent, setShowRecent] = useState(true);
  const [recentSearches, setRecentSearches] = useState([]);
  const [themeColors, setThemeColors] = useState(Theme.colors);
  const [activeCategory, setActiveCategory] = useState('All');
  const animatedOpacity = useRef(new Animated.Value(1)).current;
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // 加载加密货币数据
  const loadCryptoData = async () => {
    setIsInitialLoading(true);
    setError(null);
    try {
      await fetchCryptoList('USD', 100, (list, error) => {
        if (error) {
          console.error('Error loading crypto list:', error);
          setError('Failed to load cryptocurrency data');
        }
        setIsInitialLoading(false);
      });
    } catch (error) {
      console.error('Error in loadCryptoData:', error);
      setError('Failed to load cryptocurrency data');
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadCryptoData();
    loadRecentSearches();

    // 监听主题变化
    const unsubscribe = Theme.addThemeListener((newColors) => {
      setThemeColors(newColors);
    });

    // 当聚焦搜索框时显示搜索结果
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        if (searchQuery.length > 0) {
          setShowResults(true);
          setShowRecent(false);
          animateTransition(0);
        }
      }
    );

    // 当失焦时如果搜索框为空则显示最近搜索
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        if (searchQuery.length === 0) {
          setShowResults(false);
          setShowRecent(true);
          animateTransition(1);
        }
      }
    );

    // 清理监听器
    return () => {
      unsubscribe();
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // 动画过渡效果
  const animateTransition = (toValue) => {
    Animated.timing(animatedOpacity, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // 从AsyncStorage加载最近搜索记录
  const loadRecentSearches = async () => {
    // 这里应该从AsyncStorage加载，这里先用模拟数据
    const mockRecentSearches = [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        image_url: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
      },
      {
        id: 'ethereum',
        name: 'Ethereum',
        symbol: 'ETH',
        image_url: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      },
      {
        id: 'solana',
        name: 'Solana',
        symbol: 'SOL',
        image_url: 'https://cryptologos.cc/logos/solana-sol-logo.png',
      },
    ];
    setRecentSearches(mockRecentSearches);
  };

  // 保存最近搜索
  const saveRecentSearch = (crypto) => {
    const newRecentSearches = [
      crypto,
      ...recentSearches.filter((item) => item.id !== crypto.id),
    ].slice(0, 5);
    setRecentSearches(newRecentSearches);
  };

  // 处理搜索
  useEffect(() => {
    if (!cryptoList || cryptoList.length === 0) {
      setSearchResults([]);
      return;
    }

    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      setShowRecent(true);
      return;
    }

    setIsLoading(true);
    const query = searchQuery.toLowerCase().trim();

    try {
      const filteredResults = cryptoList.filter((coin) => {
        if (!coin) return false;
        return (
          (coin.name && coin.name.toLowerCase().includes(query)) ||
          (coin.symbol && coin.symbol.toLowerCase().includes(query)) ||
          (coin.id && coin.id.toLowerCase().includes(query))
        );
      });

      setSearchResults(filteredResults);
      setShowResults(true);
      setShowRecent(false);
    } catch (error) {
      console.error('Error filtering search results:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, cryptoList]);

  // 处理点击加密货币
  const handleCryptoPress = (crypto) => {
    if (!crypto || !crypto.id) {
      console.error('Invalid crypto data:', crypto);
      return;
    }

    selectCrypto(crypto);
    saveRecentSearch(crypto);

    navigation.navigate('CryptoDetail', {
      name: crypto.name,
      id: crypto.id,
      crypto: crypto,
    });
  };

  // 处理类别筛选
  const handleCategoryPress = (category) => {
    setActiveCategory(category);
  };

  // 渲染搜索结果项
  const renderResultItem = ({ item }) => {
    if (!item) return null;

    const isPositive = parseFloat(item.percent_change_24h) >= 0;

    return (
      <TouchableOpacity
        style={styles.currencyRow}
        onPress={() => handleCryptoPress(item)}
      >
        <View style={styles.currencyInfo}>
          <Avatar
            source={{ uri: item.image_url }}
            rounded
            size="medium"
            containerStyle={styles.currencyLogo}
          />
          <View style={styles.currencyNameWrapper}>
            <Text
              style={[styles.currencyName, { color: themeColors.textPrimary }]}
            >
              {item.name}
            </Text>
            <Text
              style={[
                styles.currencySymbol,
                { color: themeColors.textSecondary },
              ]}
            >
              {item.symbol}
            </Text>
          </View>
        </View>
        <View style={styles.currencyPriceWrapper}>
          <Text
            style={[styles.currencyPrice, { color: themeColors.textPrimary }]}
          >
            {formatPrice(item.price_usd)}
          </Text>
          <View style={styles.priceChangeContainer}>
            <Text
              style={[
                styles.priceChangePercent,
                {
                  color: isPositive ? themeColors.success : themeColors.danger,
                },
              ]}
            >
              {isPositive ? '+' : ''}
              {parseFloat(item.percent_change_24h).toFixed(2)}%
            </Text>
            <Icon
              name={isPositive ? 'arrow-up' : 'arrow-down'}
              type="font-awesome"
              size={12}
              color={isPositive ? themeColors.success : themeColors.danger}
              containerStyle={{ marginLeft: 4 }}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // 渲染最近搜索项
  const renderRecentSearchItem = ({ item }) => {
    if (!item) return null;

    return (
      <TouchableOpacity
        style={styles.recentSearchItem}
        onPress={() => handleCryptoPress(item)}
      >
        <View
          style={[
            styles.historyIcon,
            { backgroundColor: themeColors.inputBackground },
          ]}
        >
          <Icon
            name="clock"
            type="font-awesome-5"
            size={16}
            color={themeColors.textLight}
          />
        </View>
        <View style={styles.currencyNameWrapper}>
          <Text
            style={[styles.currencyName, { color: themeColors.textPrimary }]}
          >
            {item.name}
          </Text>
          <Text
            style={[
              styles.currencySymbol,
              { color: themeColors.textSecondary },
            ]}
          >
            {item.symbol}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: themeColors.backgroundColor },
      ]}
    >
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
      />

      <View style={styles.contentContainer}>
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <View
            style={[
              styles.searchBar,
              { backgroundColor: themeColors.inputBackground },
            ]}
          >
            <MaterialIcons
              name="search"
              size={24}
              color={themeColors.textSecondary}
            />
            <TextInput
              style={[styles.searchInput, { color: themeColors.textPrimary }]}
              placeholder="Search cryptocurrencies..."
              placeholderTextColor={themeColors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={themeColors.textLight}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Loading State */}
        {isInitialLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={themeColors.primary} />
            <Text
              style={[styles.loadingText, { color: themeColors.textPrimary }]}
            >
              Loading cryptocurrencies...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: themeColors.danger }]}>
              {error}
            </Text>
            <TouchableOpacity
              style={[
                styles.retryButton,
                { backgroundColor: themeColors.primary },
              ]}
              onPress={loadCryptoData}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Search Results */}
            {showResults && (
              <Animated.View
                style={[styles.searchResults, { opacity: animatedOpacity }]}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator
                      size="large"
                      color={themeColors.primary}
                    />
                  </View>
                ) : searchResults.length > 0 ? (
                  <FlatList
                    data={searchResults}
                    renderItem={renderResultItem}
                    keyExtractor={(item) => item.id}
                    style={styles.listContainer}
                  />
                ) : searchQuery.length > 0 ? (
                  <View style={styles.emptyStateContainer}>
                    <Text
                      style={[
                        styles.noResultsText,
                        { color: themeColors.textPrimary },
                      ]}
                    >
                      No results found
                    </Text>
                    <Text
                      style={[
                        styles.noResultsSubtext,
                        { color: themeColors.textSecondary },
                      ]}
                    >
                      Try searching with a different term
                    </Text>
                  </View>
                ) : null}
              </Animated.View>
            )}

            {/* Recent Searches */}
            {showRecent && (
              <Animated.View
                style={[styles.recentSearches, { opacity: animatedOpacity }]}
              >
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: themeColors.textPrimary },
                  ]}
                >
                  Recent Searches
                </Text>
                <FlatList
                  data={recentSearches}
                  renderItem={renderRecentSearchItem}
                  keyExtractor={(item) => item.id}
                  style={styles.recentList}
                />
              </Animated.View>
            )}
          </>
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavContainer}>
        <BottomNavBar
          navigation={navigation}
          activeScreen="Search"
          themeColors={themeColors}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    padding: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchResults: {
    flex: 1,
  },
  recentSearches: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginVertical: 10,
  },
  listContainer: {
    flex: 1,
  },
  recentList: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 200, 200, 0.2)',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyLogo: {
    marginRight: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(200, 200, 200, 0.3)',
  },
  currencyNameWrapper: {
    flexDirection: 'column',
  },
  currencyName: {
    fontWeight: '600',
    fontSize: 16,
  },
  currencySymbol: {
    fontSize: 14,
    marginTop: 2,
  },
  currencyPriceWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  currencyPrice: {
    fontWeight: '700',
    fontSize: 16,
  },
  priceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priceChangePercent: {
    fontSize: 14,
    fontWeight: '500',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 200, 200, 0.2)',
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});

function mapStateToProps({ cryptoInfo }) {
  return {
    cryptoList: cryptoInfo?.list || [],
  };
}

export default connect(mapStateToProps, actions)(SearchScreen);
