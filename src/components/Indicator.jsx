import React, {Component} from 'react';
import {View} from 'react-native';
import {
  BallIndicator,
  BarIndicator,
  DotIndicator,
  MaterialIndicator,
  PacmanIndicator,
  PulseIndicator,
  SkypeIndicator,
  UIActivityIndicator,
  WaveIndicator,
} from 'react-native-indicators';

export class Indicator extends Component {
  render() {
    return (
      <View style={{width: 100, height: 100, flex: 1}}>
        <DotIndicator size={40} color="white" />
      </View>
    );
  }
}

export default Indicator;
