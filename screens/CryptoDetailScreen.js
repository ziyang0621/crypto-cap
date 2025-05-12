import React, { Component } from 'react';
import moment from 'moment';
import _ from 'lodash';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Avatar, Button, Card, Divider } from 'react-native-elements';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { connect } from 'react-redux';
import * as actions from '../actions';
import Util from '../tools/Util';
import LineChart from '../components/LineChart';
import EnhancedLineChart from '../components/EnhancedLineChart';
import Theme from '../tools/Theme';

class CryptoDetailScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDataPoint: {},
      lineChartTouched: false,
      timeRange: '24h', // 默认时间范围：24h, 7d, 30d, 1y
      themeColors: Theme.colors,
      isFavorite: false,
      scrollY: new Animated.Value(0),
    };
  }

  componentDidMount() {
    const { cryptoInfo, route, navigation } = this.props;
    console.log('CryptoDetailScreen - componentDidMount');
    console.log('Route params:', route?.params);
    console.log('Selected crypto in Redux:', cryptoInfo?.selectedCrypto?.id);

    // 监听主题变化
    this.themeUnsubscribe = Theme.addThemeListener((newColors) => {
      this.setState({ themeColors: newColors }, () => {
        this.updateNavigationOptions();
      });
    });

    // 设置导航选项
    this.updateNavigationOptions();

    // 获取从导航参数传递的数据（备份机制）
    const cryptoIdFromParams = route?.params?.id;
    const cryptoNameFromParams = route?.params?.name;
    const cryptoFromParams = route?.params?.crypto; // 完整的加密货币对象

    // 情况1: 使用Redux中的选中加密货币
    if (
      cryptoInfo &&
      cryptoInfo.selectedCrypto &&
      cryptoInfo.selectedCrypto.id
    ) {
      console.log('使用Redux中的选中加密货币:', cryptoInfo.selectedCrypto.id);

      // 延迟一下加载图表数据，确保组件完全挂载
      setTimeout(() => {
        this.loadChartData();
      }, 300);

      // 检查是否为收藏项
      this.checkIfFavorite(cryptoInfo.selectedCrypto.id);
    }
    // 情况2: 使用导航参数中的完整加密货币对象
    else if (cryptoFromParams && cryptoFromParams.id) {
      console.log('使用通过参数传递的完整加密货币对象:', cryptoFromParams.id);

      // 更新Redux状态
      this.props.selectCrypto(cryptoFromParams);

      setTimeout(() => {
        this.loadChartData();
      }, 300);

      this.checkIfFavorite(cryptoFromParams.id);
    }
    // 情况3: 使用导航参数中的ID从列表中查找
    else if (cryptoIdFromParams && cryptoInfo?.cryptoInfoList) {
      console.log('尝试通过参数ID查找加密货币:', cryptoIdFromParams);

      // 从列表中查找匹配ID的加密货币
      const selectedCrypto = cryptoInfo.cryptoInfoList.find(
        (crypto) => crypto.id === cryptoIdFromParams
      );

      if (selectedCrypto) {
        console.log('通过ID在列表中找到加密货币:', selectedCrypto.name);
        // 更新Redux状态
        this.props.selectCrypto(selectedCrypto);

        // 加载图表数据
        setTimeout(() => {
          this.loadChartData();
        }, 300);

        // 检查是否为收藏项
        this.checkIfFavorite(selectedCrypto.id);
      } else {
        console.error('找不到ID匹配的加密货币:', cryptoIdFromParams);

        // 尝试根据名称查找
        if (cryptoNameFromParams && cryptoInfo?.cryptoInfoList?.length > 0) {
          console.log('尝试通过名称查找加密货币:', cryptoNameFromParams);

          // 由于可能存在大小写或精确匹配问题，我们使用不区分大小写的比较
          const cryptoByName = cryptoInfo.cryptoInfoList.find(
            (crypto) =>
              crypto.name.toLowerCase() === cryptoNameFromParams.toLowerCase()
          );

          // 如果精确匹配失败，尝试模糊匹配（包含关系）
          if (!cryptoByName) {
            console.log('精确名称匹配失败，尝试模糊匹配');
            const fuzzyMatch = cryptoInfo.cryptoInfoList.find(
              (crypto) =>
                crypto.name
                  .toLowerCase()
                  .includes(cryptoNameFromParams.toLowerCase()) ||
                cryptoNameFromParams
                  .toLowerCase()
                  .includes(crypto.name.toLowerCase())
            );

            if (fuzzyMatch) {
              console.log('通过模糊名称匹配找到加密货币:', fuzzyMatch.id);
              this.props.selectCrypto(fuzzyMatch);
              setTimeout(() => {
                this.loadChartData();
              }, 300);
              this.checkIfFavorite(fuzzyMatch.id);
              return; // 成功找到并处理
            }

            // 尝试查找符号匹配
            console.log('尝试通过符号匹配');
            const symbolMatch = cryptoInfo.cryptoInfoList.find(
              (crypto) =>
                crypto.symbol.toLowerCase() ===
                cryptoNameFromParams.toLowerCase()
            );

            if (symbolMatch) {
              console.log('通过符号匹配找到加密货币:', symbolMatch.id);
              this.props.selectCrypto(symbolMatch);
              setTimeout(() => {
                this.loadChartData();
              }, 300);
              this.checkIfFavorite(symbolMatch.id);
              return; // 成功找到并处理
            }
          } else {
            console.log('通过名称精确匹配找到加密货币:', cryptoByName.id);
            this.props.selectCrypto(cryptoByName);
            setTimeout(() => {
              this.loadChartData();
            }, 300);
            this.checkIfFavorite(cryptoByName.id);
            return; // 成功找到并处理
          }

          console.error('无法通过名称找到加密货币:', cryptoNameFromParams);
        }
      }
    } else {
      // 情况4: 如果所有方法都失败，尝试后备方案
      console.error('无法获取加密货币数据 - Redux状态或导航参数不可用');
      console.error('Redux状态:', cryptoInfo);
      console.error('导航参数:', route?.params);

      // 尝试直接使用列表中的第一个币作为后备方案
      if (cryptoInfo?.cryptoInfoList && cryptoInfo.cryptoInfoList.length > 0) {
        console.log('使用列表中的第一个币作为后备方案');

        // 优先使用Bitcoin作为后备方案（如果有的话）
        const bitcoin = cryptoInfo.cryptoInfoList.find(
          (crypto) => crypto.name === 'Bitcoin' || crypto.symbol === 'BTC'
        );

        if (bitcoin) {
          console.log('使用Bitcoin作为后备方案');
          this.props.selectCrypto(bitcoin);
          setTimeout(() => {
            this.loadChartData();
          }, 300);
        } else {
          // 否则使用列表中的第一个币
          const fallbackCrypto = cryptoInfo.cryptoInfoList[0];
          console.log('使用列表中的第一个币作为后备方案:', fallbackCrypto.name);
          this.props.selectCrypto(fallbackCrypto);
          setTimeout(() => {
            this.loadChartData();
          }, 300);
        }
      } else {
        // 最后的后备方案：显示错误并返回
        console.error('所有加载方法均失败，无法显示详情页');
        alert('无法加载加密货币数据，请返回重试');
        navigation.goBack();
      }
    }
  }

  componentWillUnmount() {
    // 清理主题监听器
    if (this.themeUnsubscribe) {
      this.themeUnsubscribe();
    }
  }

  // 更新导航选项
  updateNavigationOptions = () => {
    const { cryptoInfo, navigation } = this.props;
    const { isFavorite, themeColors } = this.state;
    const crypto = cryptoInfo?.selectedCrypto;

    if (!crypto) {
      console.log('未找到加密货币数据，无法更新导航选项');
      return;
    }

    // 创建一个带有收藏按钮的头部右侧按钮
    const headerRight = () => (
      <TouchableOpacity
        onPress={this.toggleFavorite}
        style={{ marginRight: 15, padding: 5 }}
      >
        <FontAwesome
          name={isFavorite ? 'star' : 'star-o'}
          size={24}
          color={isFavorite ? themeColors.primary : themeColors.textPrimary}
        />
      </TouchableOpacity>
    );

    navigation.setOptions({
      title: crypto.name,
      headerRight,
      headerStyle: {
        backgroundColor: themeColors.headerBackground,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTintColor: themeColors.headerTintColor,
      headerTitleStyle: {
        color: themeColors.textPrimary,
      },
    });
  };

  // 检查加密货币是否为收藏
  checkIfFavorite = (cryptoId) => {
    // 从Redux watchlist中检查币种是否存在
    const { watchlist } = this.props;
    const isFavorite = watchlist.some((coin) => coin.id === cryptoId);
    this.setState({ isFavorite });
  };

  // 切换收藏状态
  toggleFavorite = () => {
    const { cryptoInfo } = this.props;
    const selectedCrypto = cryptoInfo?.selectedCrypto;

    if (!selectedCrypto) {
      console.error('无法添加到收藏夹：未选择加密货币');
      return;
    }

    // 切换收藏状态
    if (this.state.isFavorite) {
      // 如果已经收藏，则移除
      this.props.removeFromWatchlist(selectedCrypto.id);
    } else {
      // 如果未收藏，则添加
      this.props.addToWatchlist(selectedCrypto);
    }

    // 更新状态
    this.setState({ isFavorite: !this.state.isFavorite }, () => {
      this.updateNavigationOptions();
    });
  };

  // 加载图表数据
  loadChartData = () => {
    const { cryptoInfo, route } = this.props;

    // 首先从Redux状态获取选中的加密货币
    let selectedCrypto = cryptoInfo?.selectedCrypto;

    // 如果Redux状态中没有，尝试从路由参数获取
    if (!selectedCrypto || !selectedCrypto.id) {
      console.log('Redux中没有选中的加密货币，尝试从路由参数获取');

      // 尝试从路由参数获取完整的加密货币对象
      const cryptoFromParams = route?.params?.crypto;
      if (cryptoFromParams && cryptoFromParams.id) {
        console.log('使用路由参数中的加密货币对象:', cryptoFromParams.id);
        selectedCrypto = cryptoFromParams;

        // 更新Redux状态
        this.props.selectCrypto(selectedCrypto);
      }
      // 尝试通过ID查找
      else {
        const cryptoIdFromParams = route?.params?.id;
        if (cryptoIdFromParams && cryptoInfo?.cryptoInfoList) {
          const cryptoById = cryptoInfo.cryptoInfoList.find(
            (crypto) => crypto.id === cryptoIdFromParams
          );

          if (cryptoById) {
            console.log('通过ID在列表中找到加密货币:', cryptoById.id);
            selectedCrypto = cryptoById;

            // 更新Redux状态
            this.props.selectCrypto(selectedCrypto);
          }
        }
      }
    }

    // 最终检查是否有加密货币可用
    if (!selectedCrypto || !selectedCrypto.id) {
      console.error('无法获取加密货币信息，无法加载图表数据');
      return;
    }

    // 确保我们有正确的coinId
    const coinId = selectedCrypto.id;
    console.log(
      `加载加密货币[${coinId}]的图表数据，时间范围: ${this.state.timeRange}`
    );

    // 清除上一次的图表数据
    this.props.clearChartData();

    let startTime, endTime;

    // 根据选定的时间范围设置开始和结束时间
    switch (this.state.timeRange) {
      case '7d':
        startTime = moment().subtract(7, 'days').valueOf();
        break;
      case '30d':
        startTime = moment().subtract(30, 'days').valueOf();
        break;
      case '1y':
        startTime = moment().subtract(1, 'year').valueOf();
        break;
      case '24h':
      default:
        startTime = moment().subtract(1, 'days').valueOf();
        break;
    }

    endTime = moment().valueOf();

    // 改为使用days参数而不是时间戳
    const days = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));

    try {
      // 加载图表数据
      this.props.fetchChartData(
        coinId,
        startTime,
        endTime,
        (chartData, error) => {
          if (error) {
            console.error('加载图表数据错误:', error.message);
            // 可以选择显示一个提示或者使用模拟数据
          } else {
            console.log('图表数据加载成功');
          }
        }
      );
    } catch (err) {
      console.error('调用fetchChartData时发生错误:', err);
      // 在这里可以显示友好的错误提示
    }
  };

  // 改变时间范围
  changeTimeRange = (range) => {
    this.setState({ timeRange: range }, this.loadChartData);
  };

  renderChartLoadingView = () => {
    const { themeColors } = this.state;

    return (
      <View
        style={[
          styles.chartLoadingView,
          { backgroundColor: themeColors.cardBackground },
        ]}
      >
        <ActivityIndicator size="large" color={themeColors.primaryLight} />
        <Text
          style={[styles.loadingChartText, { color: themeColors.textLight }]}
        >
          Loading Chart...
        </Text>
      </View>
    );
  };

  renderTimeRangeSelector = () => {
    const { timeRange, themeColors } = this.state;
    const ranges = ['24h', '7d', '30d', '1y'];

    return (
      <View style={styles.timeRangeContainer}>
        {ranges.map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              {
                backgroundColor:
                  timeRange === range
                    ? themeColors.primary
                    : themeColors.inputBackground,
                borderColor:
                  timeRange === range
                    ? themeColors.primary
                    : themeColors.borderColor,
              },
            ]}
            onPress={() => this.changeTimeRange(range)}
          >
            <Text
              style={[
                styles.timeRangeText,
                {
                  color:
                    timeRange === range ? '#fff' : themeColors.textSecondary,
                },
              ]}
            >
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  renderCryptoDetailView = (crypto) => {
    const { themeColors } = this.state;

    // 处理未定义的值，提供默认值
    const {
      id = '',
      name = '',
      symbol = '',
      image_url = '',
      price_usd = '0',
      price_btc = '0',
      price_eth = '0',
      available_supply = '0',
      total_supply = '0',
      market_cap_usd = '0',
      percent_change_1h = '0',
      percent_change_24h = '0',
      percent_change_7d = '0',
      '24h_volume_usd': volume_24h = '0',
    } = crypto || {};

    // 计算价格变化百分比的颜色
    const getPercentColor = (percent) => {
      const value = parseFloat(percent);
      return value >= 0 ? themeColors.success : themeColors.danger;
    };

    const oneHourPercentColor = getPercentColor(percent_change_1h);
    const twentyFourHourPercentColor = getPercentColor(percent_change_24h);
    const sevenDayPercentColor = getPercentColor(percent_change_7d);

    // 渲染图表或加载视图
    let chartView = this.renderChartLoadingView();
    const { selectedChartData } = this.props.cryptoInfo;

    // 详细检查图表数据
    if (
      selectedChartData &&
      selectedChartData.price_usd &&
      selectedChartData.price_usd.length > 0
    ) {
      console.log(
        `Rendering chart with ${selectedChartData.price_usd.length} data points`
      );

      try {
        // 处理图表数据
        const priceData = selectedChartData.price_usd.map((price) => {
          const time = moment(price.x).format('MMM D, hh:mm a');
          return { ...price, time };
        });

        const { selectedDataPoint } = this.state;

        // 选中的数据点视图
        let dataInfoView = <View />;
        if (!_.isEmpty(selectedDataPoint)) {
          dataInfoView = (
            <View style={styles.selectedDataPointContainer}>
              <Text
                style={[
                  styles.selectedPriceText,
                  { color: themeColors.textPrimary },
                ]}
              >
                ${parseFloat(selectedDataPoint.y).toFixed(2)}
              </Text>
              <Text
                style={[
                  styles.selectedTimeText,
                  { color: themeColors.textLight },
                ]}
              >
                {selectedDataPoint.time}
              </Text>
            </View>
          );
        } else {
          dataInfoView = (
            <View style={styles.selectedDataPointContainer}>
              <Text
                style={[
                  styles.selectedPriceText,
                  { color: themeColors.textPrimary },
                ]}
              >
                ${parseFloat(price_usd).toFixed(2)}
              </Text>
              <Text
                style={[
                  styles.selectedTimeText,
                  { color: themeColors.textLight },
                ]}
              >
                Current Price
              </Text>
            </View>
          );
        }

        // 完整的图表视图
        chartView = (
          <View
            style={[
              styles.chartView,
              { backgroundColor: themeColors.cardBackground },
            ]}
          >
            {dataInfoView}
            {this.renderTimeRangeSelector()}
            <View style={styles.lineChartContainer}>
              <EnhancedLineChart
                chartData={priceData}
                onDataPointTouchStart={(dataPoint) => {
                  this.setState({
                    selectedDataPoint: dataPoint,
                  });
                }}
                onTouchStart={() => {
                  this.setState({
                    lineChartTouched: true,
                  });
                }}
                onTouchEnd={() => {
                  this.setState({
                    lineChartTouched: false,
                    selectedDataPoint: {},
                  });
                }}
                height={230}
                showGradient={true}
                animate={true}
              />
            </View>
          </View>
        );
      } catch (error) {
        console.error('Error rendering chart:', error);
        chartView = (
          <View
            style={[
              styles.chartLoadingView,
              { backgroundColor: themeColors.cardBackground },
            ]}
          >
            <Text
              style={[
                styles.loadingChartText,
                { color: themeColors.textLight },
              ]}
            >
              Chart data error. Please try again.
            </Text>
            <Button
              title="Reload"
              onPress={this.loadChartData}
              buttonStyle={{
                backgroundColor: themeColors.primary,
                marginTop: 15,
                borderRadius: 5,
                paddingHorizontal: 20,
              }}
            />
          </View>
        );
      }
    } else {
      console.log('No chart data available, showing loading view');
      if (selectedChartData) {
        console.log('Chart data object exists but may be incomplete');
      }
    }

    // 市场数据卡片
    return (
      <View style={styles.detailsContainer}>
        {/* 标题和信息栏 */}
        <View
          style={[
            styles.headerContainer,
            { backgroundColor: themeColors.cardBackground },
          ]}
        >
          <View style={styles.coinInfoContainer}>
            <Avatar
              source={{ uri: image_url }}
              rounded
              size="medium"
              containerStyle={styles.avatar}
            />
            <View style={styles.coinTextInfo}>
              <Text
                style={[
                  styles.coinNameText,
                  { color: themeColors.textPrimary },
                ]}
              >
                {name}
              </Text>
              <Text
                style={[
                  styles.coinSymbolText,
                  { color: themeColors.textLight },
                ]}
              >
                {symbol}
              </Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text
              style={[styles.priceText, { color: themeColors.textPrimary }]}
            >
              $
              {parseFloat(price_usd).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <View style={styles.percentChangeContainer}>
              <FontAwesome
                name={
                  parseFloat(percent_change_24h) >= 0
                    ? 'arrow-up'
                    : 'arrow-down'
                }
                size={12}
                color={twentyFourHourPercentColor}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.percentChangeText,
                  { color: twentyFourHourPercentColor },
                ]}
              >
                {parseFloat(percent_change_24h) >= 0 ? '+' : ''}
                {percent_change_24h}%
              </Text>
            </View>
          </View>
        </View>

        {/* 图表部分 */}
        {chartView}

        {/* 价格变化百分比卡片 */}
        <View
          style={[
            styles.percentChangeCard,
            { backgroundColor: themeColors.cardBackground },
          ]}
        >
          <View style={styles.percentChangeRow}>
            <Text
              style={[
                styles.percentChangeLabel,
                { color: themeColors.textLight },
              ]}
            >
              1h Change
            </Text>
            <View style={styles.percentChangeValueContainer}>
              <FontAwesome
                name={
                  parseFloat(percent_change_1h) >= 0 ? 'arrow-up' : 'arrow-down'
                }
                size={10}
                color={oneHourPercentColor}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.percentChangeValue,
                  { color: oneHourPercentColor },
                ]}
              >
                {parseFloat(percent_change_1h) >= 0 ? '+' : ''}
                {percent_change_1h}%
              </Text>
            </View>
          </View>

          <View style={styles.percentChangeRow}>
            <Text
              style={[
                styles.percentChangeLabel,
                { color: themeColors.textLight },
              ]}
            >
              24h Change
            </Text>
            <View style={styles.percentChangeValueContainer}>
              <FontAwesome
                name={
                  parseFloat(percent_change_24h) >= 0
                    ? 'arrow-up'
                    : 'arrow-down'
                }
                size={10}
                color={twentyFourHourPercentColor}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.percentChangeValue,
                  { color: twentyFourHourPercentColor },
                ]}
              >
                {parseFloat(percent_change_24h) >= 0 ? '+' : ''}
                {percent_change_24h}%
              </Text>
            </View>
          </View>

          <View style={styles.percentChangeRow}>
            <Text
              style={[
                styles.percentChangeLabel,
                { color: themeColors.textLight },
              ]}
            >
              7d Change
            </Text>
            <View style={styles.percentChangeValueContainer}>
              <FontAwesome
                name={
                  parseFloat(percent_change_7d) >= 0 ? 'arrow-up' : 'arrow-down'
                }
                size={10}
                color={sevenDayPercentColor}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.percentChangeValue,
                  { color: sevenDayPercentColor },
                ]}
              >
                {parseFloat(percent_change_7d) >= 0 ? '+' : ''}
                {percent_change_7d}%
              </Text>
            </View>
          </View>
        </View>

        {/* 市场数据卡片 */}
        <View
          style={[
            styles.marketInfoCard,
            { backgroundColor: themeColors.cardBackground },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: themeColors.textPrimary }]}
          >
            Market Data
          </Text>

          <View style={styles.marketInfoRow}>
            <Text
              style={[styles.marketInfoLabel, { color: themeColors.textLight }]}
            >
              Market Cap
            </Text>
            <Text
              style={[
                styles.marketInfoValue,
                { color: themeColors.textPrimary },
              ]}
            >
              ${Util.numberWithCommas(market_cap_usd)}
            </Text>
          </View>

          <View style={styles.marketInfoRow}>
            <Text
              style={[styles.marketInfoLabel, { color: themeColors.textLight }]}
            >
              24h Volume
            </Text>
            <Text
              style={[
                styles.marketInfoValue,
                { color: themeColors.textPrimary },
              ]}
            >
              ${Util.numberWithCommas(volume_24h)}
            </Text>
          </View>

          <View style={styles.marketInfoRow}>
            <Text
              style={[styles.marketInfoLabel, { color: themeColors.textLight }]}
            >
              Available Supply
            </Text>
            <Text
              style={[
                styles.marketInfoValue,
                { color: themeColors.textPrimary },
              ]}
            >
              {Util.numberWithCommas(available_supply)} {symbol}
            </Text>
          </View>

          <View style={styles.marketInfoRow}>
            <Text
              style={[styles.marketInfoLabel, { color: themeColors.textLight }]}
            >
              Total Supply
            </Text>
            <Text
              style={[
                styles.marketInfoValue,
                { color: themeColors.textPrimary },
              ]}
            >
              {Util.numberWithCommas(total_supply)} {symbol}
            </Text>
          </View>
        </View>

        {/* 价格转换卡片 */}
        <View
          style={[
            styles.priceConversionCard,
            { backgroundColor: themeColors.cardBackground },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: themeColors.textPrimary }]}
          >
            Price Conversion
          </Text>

          <View style={styles.priceConversionRow}>
            <Text
              style={[
                styles.priceConversionLabel,
                { color: themeColors.textLight },
              ]}
            >
              USD
            </Text>
            <Text
              style={[
                styles.priceConversionValue,
                { color: themeColors.textPrimary },
              ]}
            >
              ${price_usd}
            </Text>
          </View>

          <View style={styles.priceConversionRow}>
            <Text
              style={[
                styles.priceConversionLabel,
                { color: themeColors.textLight },
              ]}
            >
              BTC
            </Text>
            <Text
              style={[
                styles.priceConversionValue,
                { color: themeColors.textPrimary },
              ]}
            >
              {price_btc} BTC
            </Text>
          </View>

          <View style={styles.priceConversionRow}>
            <Text
              style={[
                styles.priceConversionLabel,
                { color: themeColors.textLight },
              ]}
            >
              ETH
            </Text>
            <Text
              style={[
                styles.priceConversionValue,
                { color: themeColors.textPrimary },
              ]}
            >
              {price_eth} ETH
            </Text>
          </View>
        </View>

        {/* 交易按钮 */}
        <TouchableOpacity
          style={[styles.tradeButton, { backgroundColor: themeColors.primary }]}
          onPress={() => {
            // 这里应该跳转到交易页面
            console.log('Navigate to trading screen');
          }}
        >
          <Text style={styles.tradeButtonText}>Trade {symbol}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    const { cryptoInfo, route } = this.props;
    const { themeColors } = this.state;
    const { selectedCrypto } = cryptoInfo || {};
    const cryptoIdFromParams = route?.params?.id;
    const cryptoNameFromParams = route?.params?.name;
    const cryptoFromParams = route?.params?.crypto;

    // 动态计算标题透明度
    const headerOpacity = this.state.scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    // 检查是否正在加载或初始化
    const isLoading = !selectedCrypto && !cryptoFromParams;

    // 显示加载状态
    if (isLoading) {
      return (
        <SafeAreaView
          style={[
            styles.container,
            { backgroundColor: themeColors.backgroundColor },
          ]}
          edges={['bottom']}
        >
          <StatusBar
            barStyle={
              Theme.getColorScheme() === 'dark'
                ? 'light-content'
                : 'dark-content'
            }
            backgroundColor={themeColors.backgroundColor}
          />
          <View
            style={[
              styles.loadingContainer,
              { backgroundColor: themeColors.backgroundColor },
            ]}
          >
            <ActivityIndicator size="large" color={themeColors.primaryLight} />
            <Text
              style={[styles.loadingText, { color: themeColors.textLight }]}
            >
              正在加载加密货币数据...
            </Text>
            <Text
              style={[
                styles.loadingText,
                { color: themeColors.textLight, fontSize: 14, marginTop: 10 },
              ]}
            >
              {cryptoNameFromParams
                ? `加载 ${cryptoNameFromParams} 的详细信息`
                : '正在准备数据'}
            </Text>
          </View>
        </SafeAreaView>
      );
    }

    // 准备要显示的加密货币数据
    const cryptoToDisplay = selectedCrypto || cryptoFromParams;

    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: themeColors.backgroundColor },
        ]}
        edges={['bottom']}
      >
        <StatusBar
          barStyle={
            Theme.getColorScheme() === 'dark' ? 'light-content' : 'dark-content'
          }
          backgroundColor={themeColors.backgroundColor}
        />

        {cryptoToDisplay ? (
          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          >
            {this.renderCryptoDetailView(cryptoToDisplay)}
          </Animated.ScrollView>
        ) : (
          <View
            style={[
              styles.loadingContainer,
              { backgroundColor: themeColors.backgroundColor },
            ]}
          >
            <FontAwesome
              name="exclamation-circle"
              size={50}
              color={themeColors.warning}
              style={{ marginBottom: 20 }}
            />
            <Text
              style={[
                styles.loadingText,
                {
                  color: themeColors.textPrimary,
                  fontSize: 18,
                  marginBottom: 10,
                },
              ]}
            >
              无法加载加密货币数据
            </Text>
            <Button
              title="返回"
              onPress={() => this.props.navigation.goBack()}
              buttonStyle={{
                backgroundColor: themeColors.primaryLight,
                marginTop: 15,
                paddingHorizontal: 20,
              }}
            />
          </View>
        )}
      </SafeAreaView>
    );
  }
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  detailsContainer: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  coinInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
  },
  coinTextInfo: {
    justifyContent: 'center',
  },
  coinNameText: {
    fontSize: 20,
    fontWeight: '600',
  },
  coinSymbolText: {
    fontSize: 16,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
  },
  percentChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  percentChangeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartView: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartLoadingView: {
    height: 250,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingChartText: {
    marginTop: 10,
    fontSize: 16,
  },
  selectedDataPointContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedPriceText: {
    fontSize: 24,
    fontWeight: '700',
  },
  selectedTimeText: {
    fontSize: 14,
    marginTop: 4,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  timeRangeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lineChartContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  percentChangeCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  percentChangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  percentChangeLabel: {
    fontSize: 16,
  },
  percentChangeValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentChangeValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  marketInfoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  marketInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  marketInfoLabel: {
    fontSize: 16,
  },
  marketInfoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  priceConversionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  priceConversionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  priceConversionLabel: {
    fontSize: 16,
  },
  priceConversionValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  tradeButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  tradeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

function mapStateToProps({ cryptoInfo, watchlist }) {
  return {
    chartData: cryptoInfo.chartData,
    cryptoInfo,
    watchlist: watchlist.list || [],
  };
}

export default connect(mapStateToProps, actions)(CryptoDetailScreen);
