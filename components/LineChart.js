import React, { Component } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { View, Platform } from 'react-native';

// 根据平台导入不同的Victory组件
let VictoryChart,
  VictoryVoronoiContainer,
  VictoryTheme,
  VictoryAxis,
  VictoryLine,
  Line;

// 在Web环境中使用victory
if (Platform.OS === 'web') {
  const Victory = require('victory');
  VictoryChart = Victory.VictoryChart;
  VictoryVoronoiContainer = Victory.VictoryVoronoiContainer;
  VictoryTheme = Victory.VictoryTheme;
  VictoryAxis = Victory.VictoryAxis;
  VictoryLine = Victory.VictoryLine;
  Line = Victory.Line;
} else {
  // 在移动设备上使用victory-native
  const VictoryNative = require('victory-native');
  VictoryChart = VictoryNative.VictoryChart;
  VictoryVoronoiContainer = VictoryNative.VictoryVoronoiContainer;
  VictoryTheme = VictoryNative.VictoryTheme;
  VictoryAxis = VictoryNative.VictoryAxis;
  VictoryLine = VictoryNative.VictoryLine;
  Line = VictoryNative.Line;
}

class CrossLine extends Component {
  render() {
    const { x, y, datum } = this.props;
    if (!this.props.theme || !this.props.theme.chart) {
      return <View />;
    }

    const { height, width, padding } = this.props.theme.chart;
    return (
      <Line
        x1={x}
        x2={x}
        y1={padding.top || padding}
        y2={height - (padding.bottom || padding)}
        style={{
          stroke: 'white',
          strokeWidth: 1,
        }}
      />
    );
  }
}

class LineChart extends Component {
  handleActivated = (points) => {
    if (points && points.length > 0) {
      const point = points[0];
      const dataPoint = this.props.chartData.find((d) => d.x === point.x);
      if (dataPoint) {
        this.props.onDataPointTouchStart(dataPoint);
      }
    }
  };

  render() {
    const { chartData } = this.props;
    if (!chartData || chartData.length === 0) {
      return <View />;
    }

    return (
      <View>
        <VictoryChart
          theme={VictoryTheme.material}
          containerComponent={
            <VictoryVoronoiContainer
              voronoiDimension="x"
              labels={() => ''}
              labelComponent={<CrossLine />}
              onActivated={this.handleActivated}
              activateData={true}
              onTouchStart={this.props.onTouchStart}
              onTouchEnd={this.props.onTouchEnd}
            />
          }
          width={300}
          height={200}
          style={{
            parent: {
              background: '#031622',
            },
          }}
        >
          <VictoryLine
            interpolation="natural"
            data={chartData}
            x="x"
            y="y"
            style={{
              data: { stroke: '#52a0ff', strokeWidth: 2 },
            }}
          />
          <VictoryAxis
            style={{
              axis: { stroke: 'grey' },
              grid: { opacity: 0 },
              ticks: { opacity: 0 },
              tickLabels: { opacity: 0 },
            }}
          />
        </VictoryChart>
      </View>
    );
  }
}

export default LineChart;
