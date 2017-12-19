import React, { Component } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { View } from 'react-native';
import {
  VictoryChart,
  VictoryVoronoiContainer,
  VictoryTheme,
  VictoryAxis,
  VictoryLine,
  Line
} from 'victory-native';

class CrossLine extends Component {
  render() {
    if (!this.props || !this.props.theme || !this.props.theme.chart) {
      return <View />;
    }

    const { height, width, padding } = this.props.theme.chart;
    return (
      <Line
        x1={this.props.x}
        x2={this.props.x}
        y1={padding}
        y2={height - padding}
        style={{
          stroke: 'white'
        }}
      />
    );
  }
}

class LineChart extends Component {
  render() {
    const { chartData } = this.props;
    if (chartData.length === 0) {
      return <View />;
    }

    return (
      <View>
        <VictoryChart
          theme={VictoryTheme.material}
          containerComponent={
            <VictoryVoronoiContainer
              voronoiDimension="x"
              labels={d => `x: ${d.x} y: ${d.y}`}
              labelComponent={<CrossLine />}
              onActivated={(points, props) => {
                _.forEach(chartData, (dataPoint, key) => {
                  if (dataPoint.x === points[0].x) {
                    this.props.onDataPointTouchStart(dataPoint);
                  }
                });
              }}
              onTouchStart={() => {
                this.props.onTouchStart();
              }}
              onTouchEnd={() => {
                this.props.onTouchEnd();
              }}
            />
          }
        >
          <VictoryLine
            interpolation="natural"
            data={chartData}
            style={{
              data: { stroke: '#52a0ff' }
            }}
          />
          <VictoryAxis
            style={{
              axis: { stroke: 'grey' },
              grid: { opacity: 0 },
              ticks: { opacity: 0 },
              tickLabels: { opacity: 0 }
            }}
          />
        </VictoryChart>
      </View>
    );
  }
}

export default LineChart;
