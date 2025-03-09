import React, {useState, useEffect} from 'react';
import {Image, View, StyleSheet} from 'react-native';

const AutoHeightImage = ({uri, width,style }) => {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    Image.getSize(uri, (originalWidth, originalHeight) => {
      const aspectRatio = originalWidth / originalHeight;
      const calculatedHeight = width / aspectRatio;
      setHeight(calculatedHeight);
    });
  }, [uri, width]);

  return (
    <View>
      <Image
        source={{uri}}
        style={[styles.image, {width, height},style ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    // Additional styles if needed
  },
});

export default AutoHeightImage;
