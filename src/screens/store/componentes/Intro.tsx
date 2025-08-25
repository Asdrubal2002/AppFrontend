import React, { useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, Image, Pressable, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import tw from 'twrnc';
import { DEFAULT_BANNER_BASE64, DEFAULT_LOGO_BASE64 } from '../../../constants';

interface StoreIntroProps {
  banner?: string;
  logo?: string;
  storeName: string;
  onAnimationComplete?: () => void;
  /** Tiempo para auto–ocultarse. Si es 0 o undefined, no auto–oculta. */
  autoDismissMs?: number;
}

export interface StoreIntroRef {
  /** Llama manualmente la animación de salida */
  startExitAnimation: () => void;
}

const StoreIntro = forwardRef<StoreIntroRef, StoreIntroProps>(({
  banner,
  logo,
  storeName,
  onAnimationComplete,
  autoDismissMs = 2500, // puedes cambiar el default
}, ref) => {
  // Valores animados
  const fadeIn = useSharedValue(0);
  const logoScale = useSharedValue(0.8);

  // Flag JS para evitar dobles ejecuciones
  const isExitingRef = useRef(false);
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleComplete = () => {
    onAnimationComplete?.();
  };

  const startExitAnimation = () => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;

    // Cancelar animaciones en curso por si quedan "pegadas"
    cancelAnimation(fadeIn);
    cancelAnimation(logoScale);

    // Animación de salida
    fadeIn.value = withTiming(0, {
      duration: 600,
      easing: Easing.in(Easing.exp),
    }, (finished) => {
      if (finished) {
        runOnJS(handleComplete)();
      }
    });

    logoScale.value = withTiming(0.95, { duration: 600, easing: Easing.inOut(Easing.quad) });
  };

  useImperativeHandle(ref, () => ({
    startExitAnimation,
  }), []);

  // Animaciones de entrada
  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 1000 });
    logoScale.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.back(1.5)),
    });

    if (autoDismissMs && autoDismissMs > 0) {
      autoTimerRef.current = setTimeout(() => {
        startExitAnimation();
      }, autoDismissMs);
    }

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      cancelAnimation(fadeIn);
      cancelAnimation(logoScale);
    };
  }, [autoDismissMs]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: fadeIn.value,
  }));

  return (
    // Pressable para permitir tap en cualquier parte y salir
    <Pressable style={tw`flex-1`} onPress={startExitAnimation}>
      {/* Banner */}
      <Animated.Image
        source={{ uri: banner ? `${banner}` : DEFAULT_BANNER_BASE64 }}
        style={[
          tw`w-full h-[45%] absolute top-0 opacity-20`,
          fadeStyle,
        ]}
        blurRadius={2}
      />

      {/* Contenido principal */}
      <Animated.View style={[tw`flex-1 justify-center items-center`, fadeStyle]}>
        <Animated.View style={logoStyle}>
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

        {/* Botón "Saltar" para forzar salida */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={startExitAnimation}
          style={tw`absolute bottom-10 right-5  px-4 py-2 `}
        >
          <Text style={tw`text-white text-xs`}>INGRESAR</Text>
        </TouchableOpacity>
      </Animated.View>
    </Pressable>
  );
});

export default StoreIntro;
