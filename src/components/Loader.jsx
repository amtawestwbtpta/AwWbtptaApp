import {
  Dimensions,
  Modal,
  StyleSheet,
  View,
} from 'react-native';
import React from 'react';
import Indicator from './Indicator';
import { THEME_COLOR } from '../utils/Colors';
const {width, height} = Dimensions.get('window');
const Loader = ({visible}) => {
  return (
    <Modal visible={visible} transparent>
      <View style={styles.modalView}>
        <View style={styles.mainView}>
          <Indicator pattern={'UIActivity'} color={THEME_COLOR} />
        </View>
      </View>
    </Modal>
  );
};

export default Loader;

const styles = StyleSheet.create({
  modalView: {
    width: width,
    height: height,
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainView: {
    width: 100,
    height: 100,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});
