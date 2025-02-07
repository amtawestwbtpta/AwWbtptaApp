import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  BackHandler,
  Switch,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Video from 'react-native-video';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
const ChatVideoPlayer = ({videoUri}) => {
  const [paused, setPaused] = useState(true);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        padding: responsiveWidth(5),
      }}>
      <TouchableOpacity onPress={() => setPaused(!paused)}>
        {paused ? (
          <Image
            source={require('../assets/images/play-button.png')}
            style={styles.image}
          />
        ) : (
          <Video
            resizeMode="contain"
            useNativeControls
            paused={paused}
            source={{uri: videoUri}}
            style={styles.video}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ChatVideoPlayer;

const styles = StyleSheet.create({
  video: {
    width: responsiveWidth(50),
    height: responsiveHeight(15),
    borderRadius: responsiveWidth(2),
  },
  image: {
    width: responsiveWidth(11),
    height: responsiveHeight(5),
  },
});
