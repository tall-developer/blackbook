import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "expo-asset";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Onboarding from "react-native-onboarding-swiper";
import { useTheme } from "../context/ThemeContext";

const ONBOARDING_KEY = "bb:onboarding-complete";

export default function AppOnboarding() {
  const { theme, colorScheme } = useTheme();
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const { width } = useWindowDimensions();
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const fade = useRef(new Animated.Value(reduceMotionEnabled ? 1 : 0)).current;
  const slideColors =
    colorScheme === "dark"
      ? ["#0f1215", "#10171a", "#0e1418"]
      : ["#F4F5F7", "#F2F6F2", "#F2F6FA"];
  const barColor = slideColors[0];

  const complete = () => {
    void AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/(tabs)");
  };

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotionEnabled(enabled);
    });
    const sub = AccessibilityInfo.addEventListener?.(
      "reduceMotionChanged",
      (enabled) => {
        if (mounted) setReduceMotionEnabled(enabled);
      },
    );
    return () => {
      mounted = false;
      if (sub && typeof sub.remove === "function") sub.remove();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function preload() {
      try {
        await Asset.loadAsync([
          require("../assets/lottie/onboarding-1.json"),
          require("../assets/lottie/onboarding-2.json"),
          require("../assets/lottie/onboarding-3.json"),
        ]);
        if (mounted) setAssetsLoaded(true);
      } catch (e) {
        if (mounted) setAssetsLoaded(true);
      }
    }
    void preload();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // animate fade when assets are loaded and reduce-motion not enabled
    if (reduceMotionEnabled) {
      fade.setValue(1);
      return;
    }
    if (assetsLoaded) {
      Animated.timing(fade, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [assetsLoaded, reduceMotionEnabled, fade]);

  return (
    <View style={[styles.container, { backgroundColor: barColor }]}>
      <Onboarding
        onSkip={complete}
        onDone={complete}
        showSkip={true}
        bottomBarColor={barColor}
        SkipButtonComponent={(props) => (
          <Pressable {...props} style={styles.button}>
            <Text style={[styles.buttonText, { color: theme.textSecondary }]}>
              Skip
            </Text>
          </Pressable>
        )}
        NextButtonComponent={(props) => (
          <Pressable {...props} style={styles.button}>
            <Text style={[styles.buttonText, { color: theme.textPrimary }]}>
              Next
            </Text>
          </Pressable>
        )}
        DoneButtonComponent={(props) => (
          <Pressable {...props} style={styles.button}>
            <Text style={[styles.buttonText, { color: theme.textPrimary }]}>
              Get Started
            </Text>
          </Pressable>
        )}
        titleStyles={[styles.title, { color: theme.textPrimary }]}
        subTitleStyles={[styles.subtitle, { color: theme.textSecondary }]}
        pages={[
          {
            backgroundColor: slideColors[0],
            image: (
              <View style={styles.lottieWrapper}>
                <Animated.View
                  style={[
                    styles.bgCircle,
                    {
                      backgroundColor: theme.primary,
                      opacity: 0.08,
                      width: getLottieAndCircleSizes(width).circleSize,
                      height: getLottieAndCircleSizes(width).circleSize,
                      top: getLottieAndCircleSizes(width).circleTop - 6,
                      transform: [{ translateY: -6 }],
                      alignSelf: "center",
                    },
                  ]}
                />
                <Animated.View style={{ opacity: fade }}>
                  <LottieView
                    autoPlay={!reduceMotionEnabled && assetsLoaded}
                    loop={!reduceMotionEnabled}
                    style={[
                      styles.lottie,
                      {
                        width: getLottieAndCircleSizes(width).lottieSize,
                        height: getLottieAndCircleSizes(width).lottieSize,
                      },
                    ]}
                    source={require("../assets/lottie/onboarding-1.json")}
                  />
                </Animated.View>
              </View>
            ),
            title: "Track Debtors",
            subtitle: "Keep tabs on who owes you and when payments are due.",
          },
          {
            backgroundColor: slideColors[1],
            image: (
              <View style={styles.lottieWrapper}>
                <Animated.View
                  style={[
                    styles.bgCircle,
                    {
                      backgroundColor: theme.primary,
                      opacity: 0.06,
                      width: getLottieAndCircleSizes(width).circleSize,
                      height: getLottieAndCircleSizes(width).circleSize,
                      top: getLottieAndCircleSizes(width).circleTop - 8,
                      transform: [{ translateY: -8 }],
                      alignSelf: "center",
                    },
                  ]}
                />
                <Animated.View style={{ opacity: fade }}>
                  <LottieView
                    autoPlay={!reduceMotionEnabled && assetsLoaded}
                    loop={!reduceMotionEnabled}
                    style={[
                      styles.lottie,
                      {
                        width: getLottieAndCircleSizes(width).lottieSize,
                        height: getLottieAndCircleSizes(width).lottieSize,
                      },
                    ]}
                    source={require("../assets/lottie/onboarding-2.json")}
                  />
                </Animated.View>
              </View>
            ),
            title: "Simple Interest",
            subtitle:
              "Apply your interest rate across every debtor in one place.",
          },
          {
            backgroundColor: slideColors[2],
            image: (
              <View style={styles.lottieWrapper}>
                <Animated.View
                  style={[
                    styles.bgCircle,
                    {
                      backgroundColor: theme.primary,
                      opacity: 0.07,
                      width: getLottieAndCircleSizes(width).circleSize,
                      height: getLottieAndCircleSizes(width).circleSize,
                      top: getLottieAndCircleSizes(width).circleTop - 7,
                      transform: [{ translateY: -7 }],
                      alignSelf: "center",
                    },
                  ]}
                />
                <Animated.View style={{ opacity: fade }}>
                  <LottieView
                    autoPlay={!reduceMotionEnabled && assetsLoaded}
                    loop={!reduceMotionEnabled}
                    style={[
                      styles.lottie,
                      {
                        width: getLottieAndCircleSizes(width).lottieSize,
                        height: getLottieAndCircleSizes(width).lottieSize,
                      },
                    ]}
                    source={require("../assets/lottie/onboarding-3.json")}
                  />
                </Animated.View>
              </View>
            ),
            title: "Get Notified",
            subtitle: "Never miss a collection date with upcoming alerts.",
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lottie: {
    width: 260,
    height: 260,
  },
  lottieWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bgCircle: {
    position: "absolute",
    borderRadius: 500,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

function getLottieAndCircleSizes(screenWidth: number) {
  const lottieSize = Math.round(Math.min(260, screenWidth * 0.72));
  const circleSize = Math.round(lottieSize * 1.35);
  const circleTop = Math.round(-lottieSize * 0.12);
  return { lottieSize, circleSize, circleTop };
}
