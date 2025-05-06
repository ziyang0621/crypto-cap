import React, { useState, useEffect } from 'react';
import {
  View,
  Dimensions,
  Animated,
  StyleSheet,
  Text,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import Theme from '../tools/Theme';

// 根据平台导入不同的图表库
let VictoryChart,
  VictoryArea,
  VictoryLine,
  VictoryScatter,
  VictoryVoronoiContainer,
  VictoryAxis,
  VictoryTooltip,
  VictoryTheme,
  createContainer;

if (Platform.OS === 'web') {
  const Victory = require('victory');
  VictoryChart = Victory.VictoryChart;
  VictoryArea = Victory.VictoryArea;
  VictoryLine = Victory.VictoryLine;
  VictoryScatter = Victory.VictoryScatter;
  VictoryVoronoiContainer = Victory.VictoryVoronoiContainer;
  VictoryAxis = Victory.VictoryAxis;
  VictoryTooltip = Victory.VictoryTooltip;
  VictoryTheme = Victory.VictoryTheme;
  createContainer = Victory.createContainer;
} else {
  const VictoryNative = require('victory-native');
  VictoryChart = VictoryNative.VictoryChart;
  VictoryArea = VictoryNative.VictoryArea;
  VictoryLine = VictoryNative.VictoryLine;
  VictoryScatter = VictoryNative.VictoryScatter;
  VictoryVoronoiContainer = VictoryNative.VictoryVoronoiContainer;
  VictoryAxis = VictoryNative.VictoryAxis;
  VictoryTooltip = VictoryNative.VictoryTooltip;
  VictoryTheme = VictoryNative.VictoryTheme;
  createContainer = VictoryNative.createContainer;
}

// 创建一个组合容器，同时支持缩放和数据点选择
const VictoryZoomVoronoiContainer = createContainer('zoom', 'voronoi');

const EnhancedLineChart = ({
  chartData = [],
  onDataPointTouchStart,
  onTouchStart,
  onTouchEnd,
  timeFormat = 'MMM D, h:mm a',
  showGradient = true,
  animate = true,
  height = 250,
  showActivePoint = true,
}) => {
  const [activePoint, setActivePoint] = useState(null);
  const [themeColors, setThemeColors] = useState(Theme.colors);
  const [chartWidth, setChartWidth] = useState(
    Dimensions.get('window').width > 500
      ? 500
      : Dimensions.get('window').width - 40
  );
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    const unsubscribe = Theme.addThemeListener((newColors) => {
      setThemeColors(newColors);
    });

    return () => unsubscribe();
  }, []);

  // 确保数据按时间排序
  const sortedData = [...chartData].sort((a, b) => a.x - b.x);

  // 如果没有数据，显示空视图
  if (!sortedData || sortedData.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: themeColors.cardBackground },
        ]}
      >
        <Text style={[styles.noDataText, { color: themeColors.textLight }]}>
          No chart data available
        </Text>
      </View>
    );
  }

  // 处理数据点选择
  const handleActivated = (points) => {
    if (points && points.length > 0) {
      const point = points[0];
      const dataPoint = sortedData.find((d) => d.x === point.x);

      if (dataPoint) {
        // 更新本地状态
        setActivePoint(dataPoint);

        // 调用父组件的回调
        if (onDataPointTouchStart) {
          onDataPointTouchStart(dataPoint);
        }

        // 显示点的动画
        if (showActivePoint) {
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      }
    }
  };

  // 处理触摸结束
  const handleTouchEnd = () => {
    setActivePoint(null);
    if (onTouchEnd) {
      onTouchEnd();
    }

    // 隐藏点的动画
    if (showActivePoint) {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  // 计算图表区域的样式和颜色
  const primaryColor = themeColors.primary;
  const gradientColors = [
    `${primaryColor}80`, // 50% 透明度
    `${primaryColor}40`, // 25% 透明度
    `${primaryColor}10`, // 6% 透明度
    'transparent',
  ];

  // 为图表准备的动画配置
  const animationConfig = animate
    ? {
        duration: 1000,
        onLoad: { duration: 1000 },
      }
    : undefined;

  // 格式化X轴时间标签
  const formatXAxis = (timestamp) => {
    return moment(timestamp).format('D MMM');
  };

  // 格式化Y轴价格标签
  const formatYAxis = (price) => {
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}k`;
    }
    return `$${price.toFixed(1)}`;
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themeColors.cardBackground },
      ]}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setChartWidth(width > 0 ? width : 300);
      }}
    >
      {/* 图表容器 */}
      <View style={styles.chartContainer}>
        {showGradient && Platform.OS !== 'web' && (
          <LinearGradient
            colors={gradientColors}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        )}

        <VictoryChart
          theme={VictoryTheme.material}
          width={chartWidth}
          height={height}
          padding={{ top: 20, right: 20, bottom: 40, left: 50 }}
          containerComponent={
            <VictoryZoomVoronoiContainer
              voronoiDimension="x"
              labels={() => ''}
              onActivated={handleActivated}
              onTouchEnd={handleTouchEnd}
              onTouchStart={onTouchStart}
              responsive={false}
              zoomDimension="x"
              zoomDomain={{
                x: [sortedData[0].x, sortedData[sortedData.length - 1].x],
              }}
            />
          }
          style={{
            parent: {
              background: 'transparent',
            },
          }}
          animate={animationConfig}
        >
          {/* 填充区域 */}
          <VictoryArea
            style={{
              data: {
                fill:
                  showGradient && Platform.OS === 'web'
                    ? `url(#${primaryColor.substring(1)}-gradient)`
                    : 'transparent',
                stroke: primaryColor,
                strokeWidth: 2,
              },
            }}
            data={sortedData}
            interpolation="natural"
          />

          {/* 线条 */}
          <VictoryLine
            style={{
              data: {
                stroke: primaryColor,
                strokeWidth: 2.5,
              },
            }}
            data={sortedData}
            interpolation="natural"
          />

          {/* 数据点 */}
          {showActivePoint && (
            <VictoryScatter
              style={{
                data: {
                  fill: themeColors.primaryLight,
                  stroke: 'white',
                  strokeWidth: 2,
                },
              }}
              size={6}
              data={activePoint ? [activePoint] : []}
            />
          )}

          {/* X轴 */}
          <VictoryAxis
            tickFormat={formatXAxis}
            style={{
              axis: { stroke: themeColors.borderColor, strokeWidth: 1 },
              tickLabels: {
                fill: themeColors.textLight,
                fontSize: 10,
                padding: 5,
              },
              grid: {
                stroke: themeColors.borderColor,
                strokeWidth: 0.5,
                strokeDasharray: '5,5',
              },
            }}
            tickCount={5}
          />

          {/* Y轴 */}
          <VictoryAxis
            dependentAxis
            tickFormat={formatYAxis}
            style={{
              axis: { stroke: themeColors.borderColor, strokeWidth: 1 },
              tickLabels: {
                fill: themeColors.textLight,
                fontSize: 10,
                padding: 5,
              },
              grid: {
                stroke: themeColors.borderColor,
                strokeWidth: 0.5,
                strokeDasharray: '5,5',
              },
            }}
            tickCount={5}
          />

          {/* Web平台的渐变定义 */}
          {showGradient && Platform.OS === 'web' && (
            <defs>
              <linearGradient
                id={`${primaryColor.substring(1)}-gradient`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor={primaryColor} stopOpacity="0.8" />
                <stop offset="50%" stopColor={primaryColor} stopOpacity="0.3" />
                <stop
                  offset="100%"
                  stopColor={primaryColor}
                  stopOpacity="0.1"
                />
              </linearGradient>
            </defs>
          )}
        </VictoryChart>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 10,
  },
  chartContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 5,
    padding: 10,
    zIndex: 10,
  },
  tooltipText: {
    color: 'white',
    fontSize: 12,
  },
  noDataText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 14,
  },
});

export default EnhancedLineChart;
