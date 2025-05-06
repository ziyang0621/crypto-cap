import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
  useColorScheme,
} from 'react-native';
import { Avatar, SearchBar, Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import * as actions from '../actions';
import {
  VictoryLine,
  VictoryArea,
  VictoryChart,
  VictoryAxis,
} from 'victory-native';
import { Dimensions } from 'react-native';
import moment from 'moment';
import Util from '../tools/Util';
import BottomNavBar from '../components/BottomNavBar';
import Theme from '../tools/Theme';

const HomeScreen = ({
  navigation,
  cryptoList,
  fetchCryptoList,
  selectCrypto,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('gainers');
  const [marketData, setMarketData] = useState({
    marketCap: '1.24T',
    marketCapChange: '+2.4%',
    volume: '58.6B',
    volumeChange: '+5.1%',
  });
  const [themeColors, setThemeColors] = useState(Theme.colors);
  const colorScheme = useColorScheme();

  useEffect(() => {
    // 加载加密货币数据
    fetchCryptoList('USD', 100, (list) => {
      console.log('Crypto list loaded', list?.length);
    });

    // 设置导航选项
    updateNavigationOptions();

    // 监听主题变化
    const unsubscribe = Theme.addThemeListener((newColors) => {
      setThemeColors(newColors);
      updateNavigationOptions();
    });

    // 清理函数
    return () => unsubscribe();
  }, [colorScheme]);

  // 更新导航栏样式
  const updateNavigationOptions = () => {
    const colors = Theme.getColors();
    navigation.setOptions({
      headerTitle: 'Market',
      headerStyle: {
        backgroundColor:
          colorScheme === 'dark'
            ? colors.darkBackground
            : colors.lightBackground,
        elevation: 0, // for Android
        shadowOpacity: 0, // for iOS
      },
      headerTintColor:
        colorScheme === 'dark' ? colors.darkText : colors.lightText,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  };

  // 切换标签
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    // 更新导航栏标题和样式
    const colors = Theme.getColors();
    navigation.setOptions({
      headerTitle: tabName === 'gainers' ? 'Top Gainers' : 'Top Losers',
      headerStyle: {
        backgroundColor:
          colorScheme === 'dark'
            ? colors.darkBackground
            : colors.lightBackground,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor:
        colorScheme === 'dark' ? colors.darkText : colors.lightText,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  };

  // 获取热门币种（前5名）
  const getTrendingCoins = () => {
    return cryptoList ? cryptoList.slice(0, 5) : [];
  };

  // 获取涨幅最大的币种
  const getTopGainers = () => {
    if (!cryptoList || cryptoList.length === 0) return [];

    return [...cryptoList]
      .sort(
        (a, b) =>
          parseFloat(b.percent_change_24h) - parseFloat(a.percent_change_24h)
      )
      .slice(0, 3);
  };

  // 获取跌幅最大的币种
  const getTopLosers = () => {
    if (!cryptoList || cryptoList.length === 0) return [];

    return [...cryptoList]
      .sort(
        (a, b) =>
          parseFloat(a.percent_change_24h) - parseFloat(b.percent_change_24h)
      )
      .slice(0, 3);
  };

  // 渲染加密货币项
  const renderCryptoItem = (crypto) => {
    const isPositive = parseFloat(crypto.percent_change_24h) >= 0;

    return (
      <TouchableOpacity
        key={crypto.id}
        style={styles(themeColors).currencyRow}
        onPress={() => {
          // 确保选中加密货币并更新Redux状态
          selectCrypto(crypto);

          // 延迟导航以确保Redux状态更新
          setTimeout(() => {
            console.log(
              `导航到加密货币详情页: ${crypto.name} (ID: ${crypto.id})`
            );
            navigation.navigate('CryptoDetail', {
              name: crypto.name,
              id: crypto.id,
              crypto: crypto, // 传递完整的加密货币对象
            });
          }, 100);
        }}
      >
        <View style={styles(themeColors).currencyInfo}>
          <Avatar
            source={{ uri: crypto.image_url }}
            rounded
            size="medium"
            containerStyle={styles(themeColors).currencyLogo}
          />
          <View style={styles(themeColors).currencyNameWrapper}>
            <Text style={styles(themeColors).currencyName}>{crypto.name}</Text>
            <Text style={styles(themeColors).currencySymbol}>
              {crypto.symbol}
            </Text>
          </View>
        </View>
        <View style={styles(themeColors).currencyPriceWrapper}>
          <Text style={styles(themeColors).currencyPrice}>
            $
            {parseFloat(crypto.price_usd).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <View style={styles(themeColors).priceChangeContainer}>
            <Text
              style={[
                styles(themeColors).priceChangePercent,
                isPositive
                  ? styles(themeColors).priceUp
                  : styles(themeColors).priceDown,
              ]}
            >
              {isPositive ? '+' : ''}
              {crypto.percent_change_24h}%
            </Text>
            <Icon
              name={isPositive ? 'arrow-up' : 'arrow-down'}
              type="font-awesome"
              size={12}
              color={isPositive ? themeColors.success : themeColors.danger}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const chartData = [
    { x: 1, y: 1.18 },
    { x: 2, y: 1.19 },
    { x: 3, y: 1.21 },
    { x: 4, y: 1.2 },
    { x: 5, y: 1.22 },
    { x: 6, y: 1.21 },
    { x: 7, y: 1.23 },
    { x: 8, y: 1.22 },
    { x: 9, y: 1.24 },
    { x: 10, y: 1.23 },
    { x: 11, y: 1.24 },
    { x: 12, y: 1.24 },
  ];

  return (
    <View style={styles(themeColors).container}>
      <StatusBar
        backgroundColor={themeColors.headerBackground}
        barStyle={themeColors.statusBarStyle}
      />
      <View style={styles(themeColors).contentContainer}>
        <ScrollView
          style={styles(themeColors).scrollView}
          contentContainerStyle={styles(themeColors).scrollViewContent}
        >
          {/* Header with welcome message and profile */}
          <View style={styles(themeColors).headerContainer}>
            <View>
              <Text style={styles(themeColors).pageHeader}>Market</Text>
              <Text style={styles(themeColors).welcomeText}>
                Welcome back, Alex!
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Avatar
                source={{
                  uri: 'https://randomuser.me/api/portraits/men/32.jpg',
                }}
                rounded
                size="medium"
              />
            </TouchableOpacity>
          </View>

          {/* Market Overview Card */}
          <View style={styles(themeColors).card}>
            <View style={styles(themeColors).cardHeader}>
              <Text style={styles(themeColors).subHeader}>Market Overview</Text>
              <Text style={styles(themeColors).timeframeText}>24h</Text>
            </View>

            {/* Chart */}
            <View style={styles(themeColors).chartContainer}>
              <VictoryChart
                height={200}
                padding={{ top: 10, bottom: 30, left: 40, right: 40 }}
              >
                <VictoryArea
                  data={chartData}
                  style={{
                    data: {
                      fill: themeColors.chartFill,
                      stroke: themeColors.chartStroke,
                      strokeWidth: 2,
                    },
                  }}
                  interpolation="natural"
                />
                <VictoryAxis
                  style={{
                    axis: { stroke: 'transparent' },
                    ticks: { stroke: 'transparent' },
                    tickLabels: { fill: 'transparent' },
                    grid: { stroke: 'transparent' },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  style={{
                    axis: { stroke: 'transparent' },
                    ticks: { stroke: 'transparent' },
                    tickLabels: { fill: 'transparent' },
                    grid: { stroke: 'transparent' },
                  }}
                />
              </VictoryChart>
            </View>

            {/* Market stats */}
            <View style={styles(themeColors).gridCols2}>
              <View style={styles(themeColors).statCard}>
                <Text style={styles(themeColors).statLabel}>Market Cap</Text>
                <Text style={styles(themeColors).statValue}>
                  ${marketData.marketCap}
                </Text>
                <Text style={styles(themeColors).priceUp}>
                  {marketData.marketCapChange}{' '}
                  <Icon
                    name="arrow-up"
                    type="font-awesome"
                    size={12}
                    color={themeColors.success}
                  />
                </Text>
              </View>
              <View style={styles(themeColors).statCard}>
                <Text style={styles(themeColors).statLabel}>24h Volume</Text>
                <Text style={styles(themeColors).statValue}>
                  ${marketData.volume}
                </Text>
                <Text style={styles(themeColors).priceUp}>
                  {marketData.volumeChange}{' '}
                  <Icon
                    name="arrow-up"
                    type="font-awesome"
                    size={12}
                    color={themeColors.success}
                  />
                </Text>
              </View>
            </View>
          </View>

          {/* Trending Coins Section */}
          <View style={styles(themeColors).sectionHeader}>
            <Text style={styles(themeColors).subHeader}>Trending Coins</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('CryptoList', { source: 'trending' })
              }
            >
              <Text style={styles(themeColors).seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {/* Trending Coins List */}
          <View style={styles(themeColors).card}>
            {getTrendingCoins().map((crypto) => renderCryptoItem(crypto))}
          </View>

          {/* Gainers & Losers Section */}
          <View style={styles(themeColors).sectionContainer}>
            <View style={styles(themeColors).sectionHeader}>
              <Text style={styles(themeColors).subHeader}>
                Top Gainers & Losers
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('CryptoList', {
                    source: activeTab === 'gainers' ? 'gainers' : 'losers',
                  })
                }
              >
                <Text style={styles(themeColors).seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles(themeColors).tabContainer}>
              <TouchableOpacity
                style={[
                  styles(themeColors).tab,
                  activeTab === 'gainers' && styles(themeColors).activeTab,
                ]}
                onPress={() => handleTabChange('gainers')}
              >
                <Text
                  style={[
                    styles(themeColors).tabText,
                    activeTab === 'gainers' &&
                      styles(themeColors).activeTabText,
                  ]}
                >
                  Gainers
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles(themeColors).tab,
                  activeTab === 'losers' && styles(themeColors).activeTab,
                ]}
                onPress={() => handleTabChange('losers')}
              >
                <Text
                  style={[
                    styles(themeColors).tabText,
                    activeTab === 'losers' && styles(themeColors).activeTabText,
                  ]}
                >
                  Losers
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <View style={styles(themeColors).tabContent}>
              {activeTab === 'gainers' ? (
                <View style={styles(themeColors).card}>
                  {getTopGainers().map((crypto) => renderCryptoItem(crypto))}
                </View>
              ) : (
                <View style={styles(themeColors).card}>
                  {getTopLosers().map((crypto) => renderCryptoItem(crypto))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles(themeColors).bottomNavContainer}>
        <BottomNavBar
          navigation={navigation}
          activeScreen="Home"
          themeColors={themeColors}
        />
      </View>
    </View>
  );
};

const styles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    contentContainer: {
      flex: 1,
      marginBottom: 60, // Add margin to account for bottom navigation bar
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 16,
    },
    scrollViewContent: {
      paddingBottom: 20, // Reduced padding since we have marginBottom in contentContainer
    },
    bottomNavContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60, // Fixed height for bottom navigation
      backgroundColor: colors.backgroundColor,
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
      zIndex: 1000, // Ensure it stays on top
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 20,
    },
    pageHeader: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 5,
    },
    welcomeText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    subHeader: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    timeframeText: {
      color: colors.textLight,
    },
    chartContainer: {
      height: 200,
      marginBottom: 20,
    },
    gridCols2: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statCard: {
      backgroundColor: colors.inputBackground,
      borderRadius: 16,
      padding: 16,
      width: '48%',
    },
    statLabel: {
      color: colors.textLight,
      fontSize: 14,
    },
    statValue: {
      fontWeight: '700',
      fontSize: 18,
      color: colors.textPrimary,
    },
    priceUp: {
      color: colors.success,
      fontSize: 14,
      flexDirection: 'row',
      alignItems: 'center',
    },
    priceDown: {
      color: colors.danger,
      fontSize: 14,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 15,
    },
    seeAllText: {
      color: colors.primaryLight,
      fontWeight: '600',
      fontSize: 14,
    },
    sectionContainer: {
      marginVertical: 15,
    },
    tabContainer: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
      marginVertical: 15,
    },
    tab: {
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    tabText: {
      fontWeight: '600',
      color: colors.textLight,
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    },
    activeTabText: {
      color: colors.primary,
    },
    tabContent: {
      marginBottom: 16,
    },
    currencyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    currencyInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    currencyLogo: {
      marginRight: 12,
    },
    currencyNameWrapper: {
      flexDirection: 'column',
    },
    currencyName: {
      fontWeight: '600',
      color: colors.textPrimary,
      fontSize: 16,
    },
    currencySymbol: {
      color: colors.textLight,
      fontSize: 14,
    },
    currencyPriceWrapper: {
      flexDirection: 'column',
      alignItems: 'flex-end',
    },
    currencyPrice: {
      fontWeight: '700',
      fontSize: 16,
      color: colors.textPrimary,
    },
    priceChangeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    priceChangePercent: {
      fontSize: 14,
      fontWeight: '500',
      marginRight: 4,
    },
  });

function mapStateToProps({ cryptoInfo }) {
  return {
    cryptoList: cryptoInfo?.list,
  };
}

export default connect(mapStateToProps, actions)(HomeScreen);
