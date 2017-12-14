import React, { Component } from 'react';
import Svg from 'react-native-svg';
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

class CrossLine extends React.Component {
  render() {
    // const { height, width, padding } = this.props.theme.chart;
    console.log('the crossLine props', this.props);
    return (
      // <Line
      //   x1={this.props.x}
      //   x2={this.props.x}
      //   y1={padding}
      //   y2={height - padding}
      //   style={{
      //     stroke: 'red'
      //   }}
      // />
      <View />
    );
  }
}

class LineChart extends Component {
  render() {
    const { chartData } = this.props;
    if (chartData.length === 0) {
      return <View />;
    }

    console.log('the line chart data', chartData);

    return (
      <View>
        <VictoryChart
          // theme={VictoryTheme.material}
          containerComponent={
            <VictoryVoronoiContainer
              voronoiDimension="x"
              labels={d => `x: ${d.x} y: ${d.y}`}
            />
          }
        >
          {/* <VictoryAxis
            dependentAxis
            // style={{
            //   axis: { stroke: 'white' },
            //   grid: { opacity: 0 },
            //   ticks: { opacity: 0 }
            // }}
          /> */}
          <VictoryLine
            // interpolation="natural"
            data={chartData}
            // style={{
            //   data: { stroke: 'white' }
            // }}
          />
          {/* <VictoryAxis
          // style={{
          //   axis: { stroke: 'white' },
          //   grid: { opacity: 0 },
          //   ticks: { opacity: 0 }
          // }}
          /> */}
        </VictoryChart>
      </View>
    );
  }
}

export default LineChart;
