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
  TouchableOpacity,
  Dimensions,
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
import Theme from '../tools/Theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
      themeColors: Theme.colors,
      page: 1,
      loadingMore: false,
      totalCoins: 20, // 初始显示的币种数量
    };

    // 绑定主题变化监听器
    this.themeUnsubscribe = null;
  }

  componentDidMount() {
    const { route } = this.props;
    const source = route && route.params ? route.params.source : null;

    // 设置基于导航来源的适当标题
    this.updateNavigationOptions(source);

    // 设置初始排序方式，确保和页面类型匹配
    if (source === 'gainers' || source === 'losers') {
      this.setState({ selectedIndex: 2 }); // 默认选中24h Change排序

      // 设置Redux中的排序选项
      this.props.updateSortOptions({
        marketCap: '',
        price: '',
        percentChange: 'desc', // 默认降序
      });
    }

    // 监听主题变化
    this.themeUnsubscribe = Theme.addThemeListener((newColors) => {
      this.setState({ themeColors: newColors }, () => {
        this.updateNavigationOptions(source);
      });
    });

    // 保存AppState监听器的引用，以便在组件卸载时正确移除
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this._handleAppStateChange
    );

    // 加载初始数据，如果是See All页面请求更多数据
    this.props.fetchCryptoList('USD', source ? 100 : 100, (list) => {
      console.log('the list', list);
    });
  }

  updateNavigationOptions = (source) => {
    const { navigation } = this.props;
    const colorScheme = Theme.getColorScheme();
    const { themeColors } = this.state;

    // 根据来源和主题设置导航栏样式
    const headerStyle = {
      backgroundColor: colorScheme === 'dark' ? '#000000' : themeColors.lightBackground,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 0,
    };

    const headerTintColor = colorScheme === 'dark' ? '#FFFFFF' : themeColors.lightText;

    // 设置标题
    let title = 'Cryptocurrencies';
    if (source === 'gainers') {
      title = 'Top Gainers';
    } else if (source === 'losers') {
      title = 'Top Losers';
    } else if (source === 'trending') {
      title = 'Trending Coins';
    }

    navigation.setOptions({
      title,
      headerStyle,
      headerTintColor,
      headerTitleStyle: {
        color: headerTintColor,
        fontWeight: '600',
      },
    });
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.infoListIndex !== this.state.infoListIndex ||
      prevState.themeColors !== this.state.themeColors
    ) {
      const { route } = this.props;
      const source = route.params?.source;
      this.updateNavigationOptions(source);
    }
  }

  componentWillUnmount() {
    // 使用正确的方法移除AppState监听器
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }

    // 清理主题监听器
    if (this.themeUnsubscribe) {
      this.themeUnsubscribe();
    }
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
    const { themeColors } = this.state;
    let priceText = '';
    let percentText = '';
    let percentColor = themeColors.success;
    if (infoListItem === 'price_usd') {
      percentColor =
        parseFloat(rowData.percent_change_24h) >= 0
          ? themeColors.success
          : themeColors.danger;
      priceText = '$' + rowData.price_usd;
      percentText = rowData.percent_change_24h + '%';
    } else if (infoListItem === 'price_btc') {
      percentColor =
        rowData.percent_change_24h_btc >= 0
          ? themeColors.success
          : themeColors.danger;
      priceText = rowData.price_btc + ' BTC';
      percentText = rowData.percent_change_24h_btc + '%';
    } else if (infoListItem === 'price_eth') {
      percentColor =
        rowData.percent_change_24h_eth >= 0
          ? themeColors.success
          : themeColors.danger;
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
        <Text style={[styles.priceText, { color: themeColors.primaryLight }]}>
          {priceText}
        </Text>
        <Text style={percentChangeStyle}>{percentText}</Text>
      </View>
    );
  };

  renderItem = ({ item, index }) => {
    const { infoListIndex, themeColors } = this.state;
    const { route } = this.props;
    const source = route.params?.source;

    // 使用不同的样式来显示来自See All的项目
    if (source === 'trending' || source === 'gainers' || source === 'losers') {
      const isPositive = parseFloat(item.percent_change_24h) >= 0;

      return (
        <TouchableOpacity
          onPress={() => {
            // 确保选择有效加密货币
            if (!item || !item.id) {
              console.error('无效的加密货币数据', item);
              return;
            }

            // 先选择加密货币，然后使用setTimeout确保Redux状态更新
            this.props.selectCrypto(item);

            // 显示过渡加载状态（可选）

            // 增加延迟以确保Redux状态更新
            setTimeout(() => {
              console.log('导航到详情页面:', item.name, 'ID:', item.id);

              // 确保传递完整的路由参数
              this.props.navigation.navigate('CryptoDetail', {
                name: item.name,
                id: item.id, // 传递ID
                symbol: item.symbol, // 额外传递符号
                crypto: item, // 可选：传递整个加密货币对象作为备份
              });
            }, 100); // 增加延迟时间
          }}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 16,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: themeColors.borderColor,
            backgroundColor: themeColors.cardBackground,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{
                width: 30,
                fontSize: 14,
                fontWeight: '600',
                color: themeColors.textSecondary,
                marginRight: 12,
              }}
            >
              #{item.rank}
            </Text>
            <Avatar
              source={{ uri: item.image_url }}
              rounded
              size="small"
              containerStyle={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: themeColors.textPrimary,
                  marginBottom: 4,
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
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: themeColors.textPrimary,
                marginBottom: 4,
              }}
            >
              $
              {parseFloat(item.price_usd).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: isPositive ? themeColors.success : themeColors.danger,
                  marginRight: 4,
                }}
              >
                {isPositive ? '+' : ''}
                {item.percent_change_24h}%
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
    }

    // 使用原来的样式用于其他显示
    const infoView = this.renderRowInfo(item, infoList[infoListIndex]);

    return (
      <ListItem
        onPress={() => {
          // 确保选择有效加密货币
          if (!item || !item.id) {
            console.error('无效的加密货币数据', item);
            return;
          }

          // 先选择加密货币，然后使用setTimeout确保Redux状态更新
          this.props.selectCrypto(item);

          // 增加延迟以确保Redux状态更新
          setTimeout(() => {
            console.log('导航到详情页面:', item.name, 'ID:', item.id);

            // 确保传递完整的路由参数
            this.props.navigation.navigate('CryptoDetail', {
              name: item.name,
              id: item.id, // 传递ID
              symbol: item.symbol, // 额外传递符号
              crypto: item, // 可选：传递整个加密货币对象作为备份
            });
          }, 100); // 增加延迟时间
        }}
        containerStyle={[
          styles.listItemContainerView,
          {
            backgroundColor: themeColors.cardBackground,
            borderBottomColor: themeColors.borderColor,
          },
        ]}
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
                <Text
                  style={[styles.rankText, { color: themeColors.textPrimary }]}
                >
                  {item.rank}
                </Text>
                <Text
                  style={[styles.nameText, { color: themeColors.textPrimary }]}
                >
                  {item.name}
                </Text>
              </View>
              <Text
                style={[styles.marketCapText, { color: themeColors.textLight }]}
              >
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
    const { refreshing, themeColors } = this.state;

    return (
      <FlatList
        data={cryptoInfoList}
        renderItem={this.renderItem}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={this.onRefresh}
            tintColor={themeColors.textPrimary}
            colors={[themeColors.primaryLight]}
            style={{ backgroundColor: themeColors.backgroundColor }}
          />
        }
      />
    );
  }

  onRefresh = () => {
    this.setState({ refreshing: true });

    // 保存当前排序设置
    const { selectedIndex } = this.state;
    const { route } = this.props;
    const source = route?.params?.source;

    this.props.fetchCryptoList('USD', 100, (list) => {
      console.log('finished fetching list');

      // 确保刷新后保持相同的排序设置
      this.setState({
        refreshing: false,
        selectedIndex, // 保持相同的排序选择
      });
    });
  };

  searchTextChange = (searchText) => {
    this.setState({
      searchText: searchText,
    });
  };

  updateIndex = (selectedIndex) => {
    // 添加安全检查，确保cryptoInfo和sortOptions存在
    const cryptoInfo = this.props.cryptoInfo || {};
    const sortOptions = cryptoInfo.sortOptions || {
      marketCap: 'desc',
      price: '',
      percentChange: '',
    };

    // 更新排序逻辑以支持所有三个排序选项
    if (selectedIndex === 0) {
      // Market Cap
      this.props.updateSortOptions({
        marketCap: sortOptions.marketCap === 'desc' ? 'asc' : 'desc',
        price: '',
        percentChange: '',
      });
    } else if (selectedIndex === 1) {
      // Price
      this.props.updateSortOptions({
        marketCap: '',
        price: sortOptions.price === 'desc' ? 'asc' : 'desc',
        percentChange: '',
      });
    } else if (selectedIndex === 2) {
      // 24h Change
      this.props.updateSortOptions({
        marketCap: '',
        price: '',
        percentChange: sortOptions.percentChange === 'desc' ? 'asc' : 'desc',
      });
    }

    this.setState({ selectedIndex });
  };

  // 添加加载更多方法
  loadMoreCoins = () => {
    const { route } = this.props;
    const source = route && route.params ? route.params.source : null;
    const isFromSeeAll =
      source === 'trending' || source === 'gainers' || source === 'losers';

    // 只在See All页面启用加载更多功能
    if (!isFromSeeAll || this.state.loadingMore) return;

    this.setState(
      {
        loadingMore: true,
        totalCoins: this.state.totalCoins + 10, // 每次加载10个更多的币种
      },
      () => {
        // 模拟加载完成
        setTimeout(() => {
          this.setState({ loadingMore: false });
        }, 1000);
      }
    );
  };

  // 添加列表末尾的加载指示器
  renderFooter = () => {
    const { loadingMore, themeColors } = this.state;
    const { route } = this.props;
    const source = route && route.params ? route.params.source : null;
    const isFromSeeAll =
      source === 'trending' || source === 'gainers' || source === 'losers';

    if (!isFromSeeAll || !loadingMore) return null;

    return (
      <View
        style={{
          paddingVertical: 20,
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="small" color={themeColors.primaryLight} />
        <Text
          style={{
            color: themeColors.textLight,
            marginTop: 10,
            fontSize: 14,
          }}
        >
          Loading more coins...
        </Text>
      </View>
    );
  };

  // 防止不必要的重新渲染
  shouldComponentUpdate(nextProps, nextState) {
    const { route } = this.props;
    const source = route?.params?.source;
    const isFromSeeAll =
      source === 'trending' || source === 'gainers' || source === 'losers';

    // 如果是See All页面，且排序索引和搜索文本相同，且列表长度没变，阻止一些不必要的更新
    if (
      isFromSeeAll &&
      this.state.selectedIndex === nextState.selectedIndex &&
      this.state.searchText === nextState.searchText &&
      this.props.cryptoInfoList?.length === nextProps.cryptoInfoList?.length &&
      !this.state.refreshing &&
      !nextState.refreshing &&
      !this.state.loadingMore &&
      !nextState.loadingMore
    ) {
      // 检查内容是否真的改变了
      const currentList = this.getFilteredList();
      const nextList = this.getFilteredList(
        nextProps.cryptoInfoList,
        nextState
      );

      if (
        currentList.length === nextList.length &&
        currentList.length > 0 &&
        currentList[0].id === nextList[0].id
      ) {
        return false;
      }
    }

    return true;
  }

  // 提取过滤和排序逻辑到独立方法
  getFilteredList = (providedList, providedState) => {
    // 使用提供的列表或当前props中的列表
    const cryptoInfoList = providedList || this.props.cryptoInfoList || [];

    // 使用提供的状态或当前状态
    const state = providedState || this.state;
    const { searchText, selectedIndex, totalCoins } = state;

    const { route } = this.props;
    const source = route && route.params ? route.params.source : null;

    // 安全地访问sortOptions
    const cryptoInfo = this.props.cryptoInfo || {};
    const sortOptions = cryptoInfo.sortOptions || {
      marketCap: 'desc',
      price: '',
      percentChange: '',
    };

    let filteredList = [...cryptoInfoList];

    // 第1步：基于页面类型应用初始过滤
    if (source === 'trending') {
      // 热门币种，按市值降序
      filteredList = filteredList.sort(
        (a, b) => parseFloat(b.market_cap_usd) - parseFloat(a.market_cap_usd)
      );
    } else if (source === 'gainers') {
      // 涨幅最大币种
      filteredList = filteredList
        .filter((item) => {
          const percentChange = parseFloat(item.percent_change_24h);
          return !isNaN(percentChange) && percentChange > 0;
        })
        .sort(
          (a, b) =>
            parseFloat(b.percent_change_24h) - parseFloat(a.percent_change_24h)
        );
    } else if (source === 'losers') {
      // 跌幅最大币种
      filteredList = filteredList
        .filter((item) => {
          const percentChange = parseFloat(item.percent_change_24h);
          return !isNaN(percentChange) && percentChange < 0;
        })
        .sort(
          (a, b) =>
            parseFloat(a.percent_change_24h) - parseFloat(b.percent_change_24h)
        );
    }

    // 第2步：应用搜索过滤
    if (searchText) {
      const lowercasedSearchText = searchText.toLowerCase();
      filteredList = filteredList.filter(
        (item) =>
          item.name.toLowerCase().includes(lowercasedSearchText) ||
          item.symbol.toLowerCase().includes(lowercasedSearchText)
      );
    }

    // 第3步：应用用户选择的排序
    const isFromSeeAll =
      source === 'trending' || source === 'gainers' || source === 'losers';

    if (isFromSeeAll) {
      // 保持用户选择的排序
      switch (selectedIndex) {
        case 0: // 市值
          filteredList.sort((a, b) => {
            const valueA = parseFloat(a.market_cap_usd);
            const valueB = parseFloat(b.market_cap_usd);
            return sortOptions.marketCap === 'asc'
              ? valueA - valueB
              : valueB - valueA;
          });
          break;
        case 1: // 价格
          filteredList.sort((a, b) => {
            const valueA = parseFloat(a.price_usd);
            const valueB = parseFloat(b.price_usd);
            return sortOptions.price === 'asc'
              ? valueA - valueB
              : valueB - valueA;
          });
          break;
        case 2: // 24小时变化
          if (source === 'gainers') {
            // 上涨币种，确保大涨在前
            filteredList.sort((a, b) => {
              const valueA = parseFloat(a.percent_change_24h);
              const valueB = parseFloat(b.percent_change_24h);
              return valueB - valueA; // 始终保持大涨在前
            });
          } else if (source === 'losers') {
            // 下跌币种，确保大跌在前
            filteredList.sort((a, b) => {
              const valueA = parseFloat(a.percent_change_24h);
              const valueB = parseFloat(b.percent_change_24h);
              return valueA - valueB; // 始终保持大跌在前
            });
          } else {
            // 常规逻辑
            filteredList.sort((a, b) => {
              const valueA = parseFloat(a.percent_change_24h);
              const valueB = parseFloat(b.percent_change_24h);
              return sortOptions.percentChange === 'asc'
                ? valueA - valueB
                : valueB - valueA;
            });
          }
          break;
      }
    }

    // 第4步：应用数量限制
    if (filteredList.length > totalCoins) {
      filteredList = filteredList.slice(0, totalCoins);
    }

    return filteredList;
  };

  render() {
    const { cryptoInfoList } = this.props;
    const { searchText, selectedIndex, refreshing, themeColors, totalCoins } =
      this.state;
    const { route } = this.props;
    const colorScheme = Theme.getColorScheme();

    // 安全地访问route参数
    const source = route && route.params ? route.params.source : null;
    const isFromSeeAll =
      source === 'trending' || source === 'gainers' || source === 'losers';

    // 使用独立方法获取过滤和排序后的列表
    const filteredList = this.getFilteredList();

    return (
      <View
        style={[
          styles.containerView,
          {
            backgroundColor: themeColors.backgroundColor,
          },
        ]}
      >
        {isFromSeeAll ? (
          <>
            {/* Header Section */}
            <View
              style={{
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 8,
                backgroundColor: themeColors.backgroundColor,
              }}
            >
              {/* Filter Buttons */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 8 }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor:
                      selectedIndex === 0 ? themeColors.primary : 'transparent',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 10,
                    borderWidth: 1,
                    borderColor:
                      selectedIndex === 0
                        ? themeColors.primary
                        : themeColors.borderColor,
                  }}
                  onPress={() => this.updateIndex(0)}
                >
                  <Text
                    style={{
                      color:
                        selectedIndex === 0
                          ? '#fff'
                          : themeColors.textSecondary,
                      fontWeight: '600',
                      fontSize: 14,
                    }}
                  >
                    Market Cap
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor:
                      selectedIndex === 1 ? themeColors.primary : 'transparent',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 10,
                    borderWidth: 1,
                    borderColor:
                      selectedIndex === 1
                        ? themeColors.primary
                        : themeColors.borderColor,
                  }}
                  onPress={() => this.updateIndex(1)}
                >
                  <Text
                    style={{
                      color:
                        selectedIndex === 1
                          ? '#fff'
                          : themeColors.textSecondary,
                      fontWeight: '600',
                      fontSize: 14,
                    }}
                  >
                    Price
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor:
                      selectedIndex === 2 ? themeColors.primary : 'transparent',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor:
                      selectedIndex === 2
                        ? themeColors.primary
                        : themeColors.borderColor,
                  }}
                  onPress={() => this.updateIndex(2)}
                >
                  <Text
                    style={{
                      color:
                        selectedIndex === 2
                          ? '#fff'
                          : themeColors.textSecondary,
                      fontWeight: '600',
                      fontSize: 14,
                    }}
                  >
                    24h Change
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* List Section */}
            {filteredList?.length > 0 ? (
              <FlatList
                data={filteredList}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    onPress={() => {
                      if (!item || !item.id) {
                        console.error('Invalid crypto data', item);
                        return;
                      }
                      this.props.selectCrypto(item);
                      setTimeout(() => {
                        this.props.navigation.navigate('CryptoDetail', {
                          name: item.name,
                          id: item.id,
                          symbol: item.symbol,
                          crypto: item,
                        });
                      }, 100);
                    }}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      borderBottomWidth: 1,
                      borderBottomColor:
                        colorScheme === 'dark'
                          ? themeColors.darkBorderColor
                          : themeColors.lightBorderColor,
                      backgroundColor:
                        colorScheme === 'dark'
                          ? themeColors.darkBackground
                          : themeColors.lightBackground,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        flex: 1,
                      }}
                    >
                      <Text
                        style={{
                          width: 30,
                          fontSize: 14,
                          fontWeight: '600',
                          color: themeColors.textSecondary,
                          marginRight: 12,
                        }}
                      >
                        #{item.rank}
                      </Text>
                      <Avatar
                        source={{ uri: item.image_url }}
                        rounded
                        size="small"
                        containerStyle={{ marginRight: 12 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: themeColors.textPrimary,
                            marginBottom: 4,
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
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '700',
                          color: themeColors.textPrimary,
                          marginBottom: 4,
                        }}
                      >
                        $
                        {parseFloat(item.price_usd).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Text>
                      <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '500',
                            color:
                              parseFloat(item.percent_change_24h) >= 0
                                ? themeColors.success
                                : themeColors.danger,
                            marginRight: 4,
                          }}
                        >
                          {parseFloat(item.percent_change_24h) >= 0 ? '+' : ''}
                          {item.percent_change_24h}%
                        </Text>
                        <Icon
                          name={
                            parseFloat(item.percent_change_24h) >= 0
                              ? 'arrow-up'
                              : 'arrow-down'
                          }
                          type="font-awesome"
                          size={12}
                          color={
                            parseFloat(item.percent_change_24h) >= 0
                              ? themeColors.success
                              : themeColors.danger
                          }
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={this.onRefresh}
                    tintColor={
                      colorScheme === 'dark'
                        ? themeColors.darkText
                        : themeColors.lightText
                    }
                    colors={[themeColors.primary]}
                  />
                }
                ListFooterComponent={this.renderFooter}
                onEndReached={this.loadMoreCoins}
                onEndReachedThreshold={0.5}
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 20,
                }}
              >
                <ActivityIndicator size="large" color={themeColors.primary} />
              </View>
            )}
          </>
        ) : (
          <View>
            <SearchBar
              placeholder="Search Cryptocurrencies..."
              onChangeText={this.searchTextChange}
              value={searchText}
              containerStyle={[
                styles.searchBarContainerStyle,
                { backgroundColor: themeColors.backgroundColor },
              ]}
              inputContainerStyle={[
                styles.searchBarInputContainerStyle,
                { backgroundColor: themeColors.inputBackground },
              ]}
              inputStyle={{ color: themeColors.textPrimary }}
              placeholderTextColor={themeColors.textLight}
              round
              lightTheme={colorScheme === 'light'}
            />

            <ButtonGroup
              onPress={this.updateIndex}
              selectedIndex={selectedIndex}
              buttons={['Market Cap', 'Price', '24h Change']}
              containerStyle={[
                styles.buttonGroupContainer,
                { backgroundColor: themeColors.backgroundColor },
              ]}
              textStyle={[
                styles.buttonGroupText,
                { color: themeColors.textLight },
              ]}
              selectedTextStyle={[
                styles.buttonGroupSelectedText,
                { color: themeColors.primaryLight },
              ]}
              selectedButtonStyle={[
                styles.buttonGroupSelectedButton,
                { backgroundColor: themeColors.backgroundColor },
              ]}
            />

            {filteredList?.length > 0 ? (
              this.renderList(filteredList)
            ) : (
              <View
                style={[
                  styles.loaderView,
                  { backgroundColor: themeColors.backgroundColor },
                ]}
              >
                <ActivityIndicator
                  size="large"
                  color={themeColors.primaryLight}
                />
              </View>
            )}
          </View>
        )}
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
  containerView: {
    flex: 1,
    backgroundColor: '#031622',
  },
  searchBarContainerStyle: {
    backgroundColor: '#031622',
  },
  searchBarInputContainerStyle: {
    backgroundColor: '#031622',
  },
  buttonGroupContainer: {
    backgroundColor: '#031622',
  },
  buttonGroupText: {
    color: '#cdd3d7',
  },
  buttonGroupSelectedText: {
    color: '#52a0ff',
  },
  buttonGroupSelectedButton: {
    backgroundColor: '#031622',
  },
  loaderView: {
    flex: 1,
    backgroundColor: '#031622',
    alignItems: 'center',
    justifyContent: 'center',
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
  searchPlaceholder: {
    marginLeft: 8,
    fontSize: 16,
  },
};

function mapStateToProps({ cryptoInfo }) {
  return {
    cryptoInfoList: cryptoInfo?.list || [],
    cryptoInfo, // 添加完整的cryptoInfo对象到props
  };
}

export default connect(mapStateToProps, actions)(CryptoListScreen);
