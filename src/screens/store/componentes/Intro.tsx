import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, Image, } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import tw from 'twrnc';
import { API_BASE_URL, DEFAULT_BANNER_BASE64, DEFAULT_LOGO_BASE64 } from '../../../constants';

interface StoreIntroProps {
  banner?: string;
  logo?: string;
  storeName: string;
  onAnimationComplete?: () => void;
}

export interface StoreIntroRef {
  startExitAnimation: () => void;
}

const StoreIntro = forwardRef<StoreIntroRef, StoreIntroProps>(({
  banner,
  logo,
  storeName,
  onAnimationComplete
}, ref) => {
  // Animaciones premium
  const fadeIn = useSharedValue(0);
  const waveHeight = useSharedValue(0);
  const logoScale = useSharedValue(0.8);

  // Misma función de salida
  const startExitAnimation = () => {
    fadeIn.value = withTiming(0, {
      duration: 600,
      easing: Easing.in(Easing.exp)
    }, () => {
      if (onAnimationComplete) runOnJS(onAnimationComplete)();
    });
    waveHeight.value = withTiming(0, { duration: 800 });
  };

  useImperativeHandle(ref, () => ({
    startExitAnimation
  }));

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 1000 });
    waveHeight.value = withTiming(1, {
      duration: 2000,
      easing: Easing.out(Easing.quad)
    });
    logoScale.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.back(1.5))
    });
  }, []);


  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: fadeIn.value
  }));

  return (
    <View style={tw`flex-1`}>
      {/* Banner con URL exacta */}
      <Animated.Image
        source={{ uri: banner ? `${banner}` : DEFAULT_BANNER_BASE64 }}
        style={[
          tw`w-full h-[45%] absolute top-0 opacity-20`,
          { opacity: fadeIn }
        ]}
        blurRadius={2}
      />

      {/* Contenido principal */}
      <Animated.View style={[tw`flex-1 justify-center items-center`, { opacity: fadeIn }]}>
        <Animated.View style={[tw``, logoStyle]}>
          <Image
            source={{ uri: logo ? `${logo}` : DEFAULT_LOGO_BASE64 }}
            style={tw`w-36 h-36 rounded-full border border-white/20`}
          />
        </Animated.View>

        <Text style={tw`text-white text-4xl font-light mb-3 tracking-tighter`}>
          {storeName}
        </Text>

        <View style={tw`h-px w-24 bg-white/30 my-4`} />

        <Text style={tw`text-white/50 text-xs tracking-[8px]`}>
          INGRESANDO
        </Text>
      </Animated.View>

    </View>
  );
});

export default StoreIntro;