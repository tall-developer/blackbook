import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDebtors } from "../../context/DebtorsContext";
import { useTheme } from "../../context/ThemeContext";

type AppearanceMode = "Automatic" | "Light" | "Dark";

const NOTIF_ENABLED_KEY = "bb:notif-enabled";
const NOTIF_DAYS_KEY = "bb:notif-days-before";

export default function SettingsScreen() {
  const { mode, setMode, theme, colorScheme } = useTheme();
  const { interestRate, setInterestRate } = useDebtors();

  const [sliderWidth, setSliderWidth] = useState(0);
  const [showAppearance, setShowAppearance] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [notifDaysBefore, setNotifDaysBefore] = useState(3);
  const [notifHydrated, setNotifHydrated] = useState(false);

  const appearance = useMemo<AppearanceMode>(() => {
    if (mode === "light") return "Light";
    if (mode === "dark") return "Dark";
    return "Automatic";
  }, [mode]);

  useEffect(() => {
    let mounted = true;
    const loadNotificationSettings = async () => {
      try {
        const [enabledRaw, daysRaw] = await Promise.all([
          AsyncStorage.getItem(NOTIF_ENABLED_KEY),
          AsyncStorage.getItem(NOTIF_DAYS_KEY),
        ]);

        if (!mounted) return;

        if (enabledRaw !== null) {
          setNotifEnabled(enabledRaw === "true");
        }

        if (daysRaw !== null) {
          const parsed = Number(daysRaw);
          if (!Number.isNaN(parsed)) {
            setNotifDaysBefore(parsed);
          }
        }
      } finally {
        if (mounted) setNotifHydrated(true);
      }
    };

    void loadNotificationSettings();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!notifHydrated) return;
    void AsyncStorage.setItem(NOTIF_ENABLED_KEY, String(notifEnabled));
  }, [notifEnabled, notifHydrated]);

  useEffect(() => {
    if (!notifHydrated) return;
    void AsyncStorage.setItem(NOTIF_DAYS_KEY, String(notifDaysBefore));
  }, [notifDaysBefore, notifHydrated]);

  const SUPPORT_LINKS = {
    coffee: "https://www.buymeacoffee.com/tall_dev",
    email:
      "mailto:support@blackbook.app?subject=Bug%20Report&body=Please%20describe%20the%20issue:",
  };

  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert("Error", "Unable to open this link");
      return;
    }
    await Linking.openURL(url);
  };

  const cardBorder =
    colorScheme === "dark" ? "rgba(252,253,249,0.12)" : "rgba(0,0,0,0.06)";

  const sliderMin = 0;
  const sliderMax = 50;
  const sliderStep = 5;
  const bubbleWidth = 46;
  const bubbleLeft =
    sliderWidth > 0
      ? ((interestRate - sliderMin) / (sliderMax - sliderMin)) *
        (sliderWidth - bubbleWidth)
      : 0;

  const AppearanceOption = ({
    label,
    icon,
  }: {
    label: AppearanceMode;
    icon: keyof typeof Ionicons.glyphMap;
  }) => {
    const selected = appearance === label;

    return (
      <TouchableOpacity
        style={styles.optionRow}
        onPress={() => {
          setMode(
            label === "Light" ? "light" : label === "Dark" ? "dark" : "system",
          );
          setShowAppearance(false);
        }}
      >
        <View style={styles.optionLeft}>
          <Ionicons name={icon} size={22} color={theme.textSecondary} />
          <Text style={[styles.optionLabel, { color: theme.textPrimary }]}>
            {label}
          </Text>
        </View>

        {selected && (
          <Ionicons
            name="checkmark-circle"
            size={22}
            color={theme.textPrimary}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[0]}
      >
        <View
          style={[styles.stickyHeader, { backgroundColor: theme.background }]}
        >
          <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: cardBorder },
          ]}
        >
          <TouchableOpacity
            style={styles.row}
            onPress={() => setShowInterestModal(true)}
          >
            <View style={styles.rowLeft}>
              <Ionicons
                name="trending-up-outline"
                size={22}
                color={theme.textSecondary}
              />
              <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Interest rate</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.rateValue, { color: theme.textSecondary }]}>
                {interestRate}%
              </Text>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color={theme.textSecondary}
              />
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: cardBorder }]} />

          <TouchableOpacity
            style={styles.row}
            onPress={() => setShowNotificationsModal(true)}
          >
            <View style={styles.rowLeft}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color={theme.textSecondary}
              />
              <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Notifications</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.rateValue, { color: theme.textSecondary }]}>
                {notifEnabled ? `${notifDaysBefore}d` : "Off"}
              </Text>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color={theme.textSecondary}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: cardBorder },
          ]}
        >
          <TouchableOpacity
            style={styles.row}
            onPress={() => setShowAppearance(true)}
          >
            <View style={styles.rowLeft}>
              <Ionicons
                name="moon-outline"
                size={22}
                color={theme.textSecondary}
              />
              <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Appearance</Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: cardBorder },
          ]}
        >
          <TouchableOpacity
            style={styles.row}
            onPress={() => openLink(SUPPORT_LINKS.coffee)}
          >
            <View style={styles.rowLeft}>
              <Ionicons
                name="help-circle-outline"
                size={22}
                color={theme.textSecondary}
              />
              <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Buy Me a Coffee</Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: cardBorder }]} />

          <TouchableOpacity
            style={styles.row}
            onPress={() => {
              Alert.alert("Rate BlackBook", "Thanks for supporting BlackBook app!", [
                {
                  text: "Rate Now",
                  onPress: () =>
                    Linking.openURL("market://details?id=com.yourcompany.blackbook"),
                },
                { text: "Later", style: "cancel" },
              ]);
            }}
          >
            <View style={styles.rowLeft}>
              <Ionicons
                name="mail-outline"
                size={22}
                color={theme.textSecondary}
              />
              <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Rate App</Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: cardBorder }]} />

          <TouchableOpacity
            style={styles.row}
            onPress={() => openLink(SUPPORT_LINKS.email)}
          >
            <View style={styles.rowLeft}>
              <Ionicons
                name="bug-outline"
                size={22}
                color={theme.textSecondary}
              />
              <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Report a bug</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textPrimary }]}>
            Made with love by Lindani Grootboom
          </Text>
          <Text style={[styles.footerSub, { color: theme.textSecondary }]}>Solo Developer • Addo, South Africa</Text>
          <Text style={[styles.footerSub, { color: theme.textSecondary }]}>v1.0.0</Text>
        </View>
      </ScrollView>

      <Modal
        visible={showAppearance}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowAppearance(false)}
      >
        <Pressable
          style={[
            styles.modalOverlay,
            {
              backgroundColor:
                colorScheme === "dark" ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.45)",
            },
          ]}
          onPress={() => setShowAppearance(false)}
        >
          <Pressable
            style={[styles.modalCard, { backgroundColor: theme.card }]}
            onPress={() => {}}
          >
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Appearance</Text>

            <AppearanceOption label="Automatic" icon="settings-outline" />
            <AppearanceOption label="Light" icon="sunny-outline" />
            <AppearanceOption label="Dark" icon="moon-outline" />

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowAppearance(false)}
            >
              <Text
                style={[styles.closeButtonText, { color: theme.background }]}
              >
                Close
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showInterestModal}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowInterestModal(false)}
      >
        <Pressable
          style={[
            styles.modalOverlay,
            {
              backgroundColor:
                colorScheme === "dark" ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.45)",
            },
          ]}
          onPress={() => setShowInterestModal(false)}
        >
          <Pressable
            style={[styles.modalCard, { backgroundColor: theme.card }]}
            onPress={() => {}}
          >
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Interest Rate</Text>

            <View style={styles.sliderWrap}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>Set rate</Text>
                <Text style={[styles.sliderValue, { color: theme.textPrimary }]}>{interestRate}%</Text>
              </View>

              <View
                style={styles.sliderTrack}
                onLayout={(event) =>
                  setSliderWidth(event.nativeEvent.layout.width)
                }
              >
                <View
                  style={[
                    styles.bubble,
                    { backgroundColor: theme.textPrimary, left: bubbleLeft },
                  ]}
                >
                  <Text style={[styles.bubbleText, { color: theme.background }]}>{interestRate}%</Text>
                </View>

                <Slider
                  value={interestRate}
                  onValueChange={setInterestRate}
                  minimumValue={sliderMin}
                  maximumValue={sliderMax}
                  step={sliderStep}
                  minimumTrackTintColor={theme.primary}
                  maximumTrackTintColor={cardBorder}
                  thumbTintColor={theme.primary}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowInterestModal(false)}
            >
              <Text
                style={[styles.closeButtonText, { color: theme.background }]}
              >
                Done
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showNotificationsModal}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <Pressable
          style={[
            styles.modalOverlay,
            {
              backgroundColor:
                colorScheme === "dark" ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.45)",
            },
          ]}
          onPress={() => setShowNotificationsModal(false)}
        >
          <Pressable
            style={[styles.modalCard, { backgroundColor: theme.card }]}
            onPress={() => {}}
          >
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Notifications</Text>

            <View style={styles.notifyRow}>
              <Text style={[styles.notifyLabel, { color: theme.textPrimary }]}>
                Upcoming collections alerts
              </Text>
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.background}
              />
            </View>

            <View
              style={[
                styles.divider,
                { backgroundColor: cardBorder, marginHorizontal: 0 },
              ]}
            />

            <Text
              style={[
                styles.sliderLabel,
                { color: theme.textSecondary, marginTop: 14 },
              ]}
            >
              Days-before threshold
            </Text>
            <Text
              style={[
                styles.sliderValue,
                { color: theme.textPrimary, marginTop: 6 },
              ]}
            >
              {notifDaysBefore} day{notifDaysBefore === 1 ? "" : "s"}
            </Text>

            <Slider
              value={notifDaysBefore}
              onValueChange={(v) => setNotifDaysBefore(Math.round(v))}
              minimumValue={1}
              maximumValue={14}
              step={1}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={cardBorder}
              thumbTintColor={theme.primary}
              disabled={!notifEnabled}
            />

            <TouchableOpacity
              style={[styles.openSettingsButton, { borderColor: cardBorder }]}
              onPress={() => {
                void Linking.openSettings();
              }}
            >
              <Text style={[styles.openSettingsText, { color: theme.textPrimary }]}> 
                Open Phone Notification Settings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowNotificationsModal(false)}
            >
              <Text
                style={[styles.closeButtonText, { color: theme.background }]}
              >
                Done
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F7",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#111",
    marginBottom: 20,
  },
  stickyHeader: {
    paddingTop: 0,
    paddingBottom: 0,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  rowLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  rateValue: {
    fontSize: 14,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEE",
    marginHorizontal: 18,
  },
  sliderWrap: {
    paddingHorizontal: 0,
    paddingBottom: 12,
  },
  sliderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 13,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  sliderTrack: {
    paddingTop: 24,
  },
  bubble: {
    position: "absolute",
    top: 0,
    width: 46,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleText: {
    fontSize: 12,
    fontWeight: "600",
  },

  footer: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 24,
  },

  footerText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },

  footerSub: {
    fontSize: 13,
    color: "#888",
    marginTop: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    backgroundColor: "#FFF",
    borderRadius: 22,
    width: "90%",
    padding: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
    textAlign: "center",
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },

  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  closeButton: {
    marginTop: 16,
    backgroundColor: "#111",
    borderRadius: 14,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },

  closeButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  notifyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  notifyLabel: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
  openSettingsButton: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  openSettingsText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
