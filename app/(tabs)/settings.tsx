import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DarkThemeFilledIcon from "../../components/icons/DarkThemeFilledIcon";
import { useDebtors } from "../../context/DebtorsContext";
import { useTheme } from "../../context/ThemeContext";

type AppearanceMode = "Automatic" | "Light" | "Dark";

const NOTIF_ENABLED_KEY = "bb:notif-enabled";
const NOTIF_DAYS_KEY = "bb:notif-days-before";
const BIOMETRIC_KEY = "blackbook_biometric_enabled";

export default function SettingsScreen() {
  const router = useRouter();
  const { mode, setMode, theme, colorScheme } = useTheme();
  const { interestRate, setInterestRate, exportBackup, importBackup } =
    useDebtors();
  const insets = useSafeAreaInsets();

  const [sliderWidth, setSliderWidth] = useState(0);
  const [showAppearance, setShowAppearance] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreText, setRestoreText] = useState("");

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [notifDaysBefore, setNotifDaysBefore] = useState(3);
  const [notifHydrated, setNotifHydrated] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [biometricHydrated, setBiometricHydrated] = useState(false);

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

  useEffect(() => {
    let mounted = true;
    const loadBiometricPreference = async () => {
      try {
        const value = await AsyncStorage.getItem(BIOMETRIC_KEY);
        if (!mounted) return;
        setIsBiometricEnabled(value === "true");
      } finally {
        if (mounted) setBiometricHydrated(true);
      }
    };

    void loadBiometricPreference();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!biometricHydrated) return;
    void AsyncStorage.setItem(BIOMETRIC_KEY, String(isBiometricEnabled));
  }, [isBiometricEnabled, biometricHydrated]);

  const SUPPORT_LINKS = {
    coffee: "https://www.buymeacoffee.com/tall_dev",
    email:
      "mailto:support@blackbook.app?subject=Bug%20Report&body=Please%20describe%20the%20issue:",
  };

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Error", "Unable to open this link");
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert("Error", "Unable to open this link right now.");
    }
  };

  const onExportBackup = async () => {
    try {
      const payload = exportBackup();
      await Share.share({
        message: payload,
        title: "BlackBook Backup",
      });
    } catch {
      Alert.alert("Export failed", "Could not export backup.");
    }
  };

  const onRestoreBackup = () => {
    Alert.alert(
      "Replace current data?",
      "Restoring a backup will overwrite your current debtors and settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          style: "destructive",
          onPress: () => {
            const result = importBackup(restoreText);
            if (!result.ok) {
              Alert.alert("Restore failed", result.error ?? "Invalid backup.");
              return;
            }
            setShowRestoreModal(false);
            setRestoreText("");
            Alert.alert("Restore complete", "Backup imported successfully.");
          },
        },
      ],
    );
  };

  const cardBorder =
    colorScheme === "dark" ? "rgba(252,253,249,0.20)" : "rgba(0,0,0,0.08)";

  const sliderMin = 0;
  const sliderMax = 100;
  const sliderStep = 10;
  const bubbleWidth = 46;
  const bubbleLeft =
    sliderWidth > 0
      ? ((interestRate - sliderMin) / (sliderMax - sliderMin)) *
        (sliderWidth - bubbleWidth)
      : 0;
  const stickyHeaderTop = insets.top + 8;
  const stickyHeaderHeight = stickyHeaderTop + 44;

  const AppearanceOption = ({
    label,
    icon,
  }: {
    label: AppearanceMode;
    icon: keyof typeof Ionicons.glyphMap | "dark-theme-filled";
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
          {icon === "dark-theme-filled" ? (
            <DarkThemeFilledIcon size={22} color={theme.textSecondary} />
          ) : (
            <Ionicons name={icon} size={22} color={theme.textSecondary} />
          )}
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.stickyHeader,
          {
            backgroundColor: theme.background,
            paddingTop: stickyHeaderTop,
            borderBottomColor: cardBorder,
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Settings
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: stickyHeaderHeight + 16,
          paddingBottom: Math.max(insets.bottom + 60, 80),
        }}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: cardBorder },
          ]}
        >
          <SettingRow
            icon="trending-up-outline"
            label="Interest rate"
            value={`${interestRate}%`}
            onPress={() => setShowInterestModal(true)}
            theme={theme}
          />
          <View style={[styles.divider, { backgroundColor: cardBorder }]} />
          <SettingRow
            icon="notifications-outline"
            label="Notifications"
            value={notifEnabled ? "On" : "Off"}
            onPress={() => setShowNotificationsModal(true)}
            theme={theme}
          />
          <View style={[styles.divider, { backgroundColor: cardBorder }]} />
          <SettingRow
            icon="color-palette-outline"
            label="Appearance"
            value={appearance}
            onPress={() => setShowAppearance(true)}
            theme={theme}
          />
          <View style={[styles.divider, { backgroundColor: cardBorder }]} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color={theme.textSecondary}
              />
              <View style={styles.rowTextWrap}>
                <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>
                  App Lock
                </Text>
                <Text
                  style={[styles.biometricHint, { color: theme.textSecondary }]}
                >
                  Secure with Fingerprint, Face, or Device PIN
                </Text>
              </View>
            </View>
            <Switch
              value={isBiometricEnabled}
              onValueChange={setIsBiometricEnabled}
              trackColor={{ false: "#767577", true: theme.primary }}
              thumbColor={theme.background}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: cardBorder }]} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/setup-pin")}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
            >
              {/* Subtle icon container for a premium feel */}
              <View
                style={{
                  backgroundColor: theme.primary + "15", // ~8% opacity for a soft tint
                  padding: 8,
                  borderRadius: 12,
                }}
              >
                <View style={styles.rowLeft}>
                  <Ionicons
                    name="keypad-outline"
                    size={20}
                    color={theme.primary}
                  />
                </View>
              </View>

              <Text
                style={{
                  color: theme.textPrimary,
                  fontSize: 16,
                  fontWeight: "500",
                }}
              >
                Set/Change App PIN
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/*<View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: cardBorder },
          ]}
        >
          <SettingRow
            icon="server-outline"
            label="Data & Backup"
            onPress={() => setShowDataModal(true)}
            theme={theme}
          />
        </View>
        */}

        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: cardBorder },
          ]}
        >
          <SettingRow
            icon="star-outline"
            label="Rate & Support"
            onPress={() => setShowSupportModal(true)}
            theme={theme}
          />
          <View style={[styles.divider, { backgroundColor: cardBorder }]} />
          <SettingRow
            icon="cafe-outline"
            label="Buy Me a Coffee"
            iconColor="#FFAB00"
            onPress={() => openLink(SUPPORT_LINKS.coffee)}
            theme={theme}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textPrimary }]}>
            {"Made with \u2764\uFE0F by Lindani Grootboom"}
          </Text>
          <Text style={[styles.footerSub, { color: theme.textSecondary }]}>
            v1.0.0
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={showDataModal}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowDataModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDataModal(false)}
        >
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Data & Backup
            </Text>
            <TouchableOpacity style={styles.optionRow} onPress={onExportBackup}>
              <View style={styles.optionLeft}>
                <Ionicons
                  name="share-outline"
                  size={22}
                  color={theme.textSecondary}
                />
                <Text
                  style={[styles.optionLabel, { color: theme.textPrimary }]}
                >
                  Export Backup
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                setShowDataModal(false);
                setShowRestoreModal(true);
              }}
            >
              <View style={styles.optionLeft}>
                <Ionicons
                  name="download-outline"
                  size={22}
                  color={theme.textSecondary}
                />
                <Text
                  style={[styles.optionLabel, { color: theme.textPrimary }]}
                >
                  Restore Backup
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowDataModal(false)}
            >
              <Text
                style={[styles.closeButtonText, { color: theme.background }]}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showSupportModal}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowSupportModal(false)}
      >
        <Pressable
          style={[
            styles.modalOverlay,
            {
              backgroundColor:
                colorScheme === "dark" ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.45)",
            },
          ]}
          onPress={() => setShowSupportModal(false)}
        >
          <Pressable
            style={[styles.modalCard, { backgroundColor: theme.card }]}
            onPress={() => {}}
          >
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Support
            </Text>
            <Text
              style={[styles.supportSubtitle, { color: theme.textSecondary }]}
            >
              How can we help?
            </Text>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                setShowSupportModal(false);
                void openLink(SUPPORT_LINKS.email);
              }}
            >
              <View style={styles.optionLeft}>
                <Ionicons
                  name="bug-outline"
                  size={22}
                  color={theme.textSecondary}
                />
                <Text
                  style={[styles.optionLabel, { color: theme.textPrimary }]}
                >
                  Report a Bug
                </Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                setShowSupportModal(false);
                void openLink("market://details?id=com.apphatch.blackbook");
              }}
            >
              <View style={styles.optionLeft}>
                <Ionicons
                  name="star-outline"
                  size={22}
                  color={theme.textSecondary}
                />
                <Text
                  style={[styles.optionLabel, { color: theme.textPrimary }]}
                >
                  Rate App
                </Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowSupportModal(false)}
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
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Appearance
            </Text>

            <AppearanceOption label="Automatic" icon="dark-theme-filled" />
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
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Interest Rate
            </Text>

            <View style={styles.sliderWrap}>
              <View style={styles.sliderHeader}>
                <Text
                  style={[styles.sliderLabel, { color: theme.textSecondary }]}
                >
                  Set rate
                </Text>
                <Text
                  style={[styles.sliderValue, { color: theme.textPrimary }]}
                >
                  {interestRate}%
                </Text>
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
                  <Text
                    style={[styles.bubbleText, { color: theme.background }]}
                  >
                    {interestRate}%
                  </Text>
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
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Notifications
            </Text>

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
              <Text
                style={[styles.openSettingsText, { color: theme.textPrimary }]}
              >
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

      <Modal
        visible={showRestoreModal}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowRestoreModal(false)}
      >
        <Pressable
          style={[
            styles.modalOverlay,
            {
              backgroundColor:
                colorScheme === "dark" ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.45)",
            },
          ]}
          onPress={() => setShowRestoreModal(false)}
        >
          <Pressable
            style={[styles.modalCard, { backgroundColor: theme.card }]}
            onPress={() => {}}
          >
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Restore Backup
            </Text>
            <TextInput
              multiline
              value={restoreText}
              onChangeText={setRestoreText}
              placeholder="Paste backup JSON here"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.restoreInput,
                {
                  borderColor: cardBorder,
                  color: theme.textPrimary,
                  backgroundColor: theme.input,
                },
              ]}
            />
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.primary }]}
              onPress={onRestoreBackup}
            >
              <Text
                style={[styles.closeButtonText, { color: theme.background }]}
              >
                Restore
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function SettingRow({ icon, label, value, onPress, theme, iconColor }: any) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.rowLeft}>
        <Ionicons
          name={icon}
          size={22}
          color={iconColor || theme.textSecondary}
        />
        <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>
          {label}
        </Text>
      </View>
      <View style={styles.rowRight}>
        {value ? (
          <Text style={[styles.rateValue, { color: theme.textSecondary }]}>
            {value}
          </Text>
        ) : null}
        <Ionicons
          name="chevron-forward-outline"
          size={20}
          color={theme.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    zIndex: 10,
    paddingBottom: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: "600",
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
  settingItem: {
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
    flex: 1,
    minWidth: 0,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowTextWrap: {
    flexShrink: 1,
    minWidth: 0,
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
  biometricHint: {
    fontSize: 12,
    marginTop: 2,
    flexShrink: 1,
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
  supportSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: -4,
    marginBottom: 8,
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
  restoreInput: {
    minHeight: 140,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: "top",
    fontSize: 13,
  },
});
