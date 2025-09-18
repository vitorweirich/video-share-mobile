import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      style={[props.style, styles.pressable]}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    >
      <View style={styles.inner}>{props.children}</View>
    </PlatformPressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
  },
  inner: {
    backgroundColor: '#2D2828',
    padding: 12,
    borderRadius: 12,
    minWidth: '80%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: "center",
  },
});
