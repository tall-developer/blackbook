import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React from "react";
import {
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Line, Rect } from "react-native-svg";
import { Debtor, useDebtors } from "../../context/DebtorsContext";
import { useTheme } from "../../context/ThemeContext";
import BlackbookLogo from "../components/BlackbookLogo";

/* ---------------- HOME ---------------- */

export default function HomeScreen() {
  const NOTIF_ENABLED_KEY = "bb:notif-enabled";
  const NOTIF_DAYS_KEY = "bb:notif-days-before";
  const router = useRouter();
  const { debtors, addDebtor } = useDebtors();
  const hasDebtors = debtors.length > 0;
  const { theme, colorScheme } = useTheme();
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [name, setName] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [dueDate, setDueDate] = React.useState<number | undefined>(undefined);
  const [showPicker, setShowPicker] = React.useState(false);
  const [notifEnabled, setNotifEnabled] = React.useState(true);
  const [notifDaysBefore, setNotifDaysBefore] = React.useState(3);
  const translateY = React.useRef(new Animated.Value(0)).current;

  const loadNotificationSettings = React.useCallback(async () => {
    try {
      const [enabledRaw, daysRaw] = await Promise.all([
        AsyncStorage.getItem(NOTIF_ENABLED_KEY),
        AsyncStorage.getItem(NOTIF_DAYS_KEY),
      ]);
      if (enabledRaw !== null) {
        setNotifEnabled(enabledRaw === "true");
      }
      if (daysRaw !== null) {
        const parsed = Number(daysRaw);
        if (!Number.isNaN(parsed)) setNotifDaysBefore(parsed);
      }
    } catch {
      // Keep defaults if settings fail to load.
    }
  }, []);

  const submit = () => {
    if (!name || !amount) return;

    addDebtor(name.trim(), Number(amount), dueDate);
    setName("");
    setAmount("");
    setDueDate(undefined);
    setShowAddModal(false);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    translateY.setValue(0);
  };

  const inputBorder =
    colorScheme === "dark" ? "rgba(252,253,249,0.2)" : "rgba(0,0,0,0.12)";

  React.useEffect(() => {
    void loadNotificationSettings();
  }, [loadNotificationSettings]);

  React.useEffect(() => {
    if (showNotifications) {
      void loadNotificationSettings();
    }
  }, [showNotifications, loadNotificationSettings]);

  const daysAhead = notifDaysBefore;
  const now = new Date();
  const upcomingDebtors = !notifEnabled
    ? []
    : debtors.filter(
    (d): d is Debtor & { dueDate: string } => {
      if (!d.dueDate || d.status === "Settled") return false;
      const due = new Date(d.dueDate);
      const diffMs = due.getTime() - now.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= daysAhead;
    },
  );

  React.useEffect(() => {
    if (showAddModal) {
      translateY.setValue(0);
    }
  }, [showAddModal, translateY]);

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 6,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 120) {
          closeAddModal();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {!hasDebtors ? (
        <EmptyState
          onAdd={() => setShowAddModal(true)}
          onNotifications={() => setShowNotifications(true)}
          hasAlert={notifEnabled && upcomingDebtors.length > 0}
        />
      ) : (
        <NormalHome
          debtors={debtors}
          onNotifications={() => setShowNotifications(true)}
          hasAlert={notifEnabled && upcomingDebtors.length > 0}
        />
      )}

      {/* FAB — ONLY after first debtor */}
      {hasDebtors && (
        <Pressable
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={28} color={theme.background} />
        </Pressable>
      )}

      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={closeAddModal}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={-30}
        >
          <Pressable
            style={[
              styles.modalOverlay,
              { backgroundColor: "rgba(0,0,0,0.6)" },
            ]}
            onPress={closeAddModal}
          >
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <Animated.View
                  style={[
                    styles.modalSheet,
                    {
                      backgroundColor: theme.card,
                      transform: [{ translateY }],
                    },
                  ]}
                  {...panResponder.panHandlers}
                >
                  <View
                    style={[
                      styles.modalHandle,
                      { backgroundColor: theme.border },
                    ]}
                  />

                  <Text
                    style={[styles.modalTitle, { color: theme.textPrimary }]}
                  >
                    Add debtor
                  </Text>

                  <TextInput
                    placeholder="Full name"
                    value={name}
                    onChangeText={setName}
                    style={[
                      styles.modalInput,
                      {
                        backgroundColor: theme.input,
                        color: theme.textPrimary,
                        borderColor: inputBorder,
                      },
                    ]}
                    placeholderTextColor={theme.textSecondary}
                    autoFocus
                  />

                  <TextInput
                    placeholder="Amount owed"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    style={[
                      styles.modalInput,
                      {
                        backgroundColor: theme.input,
                        color: theme.textPrimary,
                        borderColor: inputBorder,
                      },
                    ]}
                    placeholderTextColor={theme.textSecondary}
                  />

                  <Pressable onPress={() => setShowPicker(true)}>
                    <View pointerEvents="none">
                      <TextInput
                        placeholder="Due date"
                        value={
                          dueDate
                            ? new Date(dueDate).toLocaleDateString("en-GB")
                            : ""
                        }
                        style={[
                          styles.modalInput,
                          {
                            backgroundColor: theme.input,
                            color: theme.textPrimary,
                            borderColor: inputBorder,
                          },
                        ]}
                        placeholderTextColor={theme.textSecondary}
                        editable={false}
                      />
                    </View>
                  </Pressable>

                  {showPicker && (
                    <DateTimePicker
                      value={dueDate ? new Date(dueDate) : new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowPicker(false);
                        if (selectedDate) setDueDate(selectedDate.getTime());
                      }}
                    />
                  )}

                  <Pressable
                    style={[
                      styles.modalButton,
                      { backgroundColor: theme.primary },
                    ]}
                    onPress={submit}
                  >
                    <Text
                      style={[
                        styles.modalButtonText,
                        { color: theme.background },
                      ]}
                    >
                      Save debtor
                    </Text>
                  </Pressable>
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showNotifications}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowNotifications(false)}
      >
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.6)" }]}
          onPress={() => setShowNotifications(false)}
        >
          <Pressable
            style={[styles.noticeCard, { backgroundColor: theme.card }]}
            onPress={() => {}}
          >
            <Text style={[styles.noticeTitle, { color: theme.textPrimary }]}>
              Upcoming collections
            </Text>
            <Text style={[styles.noticeSub, { color: theme.textSecondary }]}>
              {notifEnabled
                ? `Next ${daysAhead} day${daysAhead === 1 ? "" : "s"}`
                : "Alerts are currently disabled"}
            </Text>

            {!notifEnabled ? (
              <Text
                style={[styles.noticeEmpty, { color: theme.textSecondary }]}
              >
                Enable alerts in Settings &gt; Notifications to track upcoming
                collections.
              </Text>
            ) : upcomingDebtors.length === 0 ? (
              <Text
                style={[styles.noticeEmpty, { color: theme.textSecondary }]}
              >
                No upcoming collections.
              </Text>
            ) : (
              upcomingDebtors.map((d) => (
                <View
                  key={d.id}
                  style={[styles.noticeRow, { borderColor: theme.border }]}
                >
                  <View style={styles.noticeLeft}>
                    <Text
                      style={[styles.noticeName, { color: theme.textPrimary }]}
                    >
                      {d.name}
                    </Text>
                    <Text
                      style={[
                        styles.noticeDate,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Due {new Date(d.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text
                    style={[styles.noticeAmount, { color: theme.textPrimary }]}
                  >
                    R{d.amount.toFixed(2)}
                  </Text>
                </View>
              ))
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------------- EMPTY STATE ---------------- */

function EmptyState({
  onAdd,
  onNotifications,
  hasAlert,
}: {
  onAdd: () => void;
  onNotifications: () => void;
  hasAlert: boolean;
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.emptyWrapper, { backgroundColor: theme.background }]}>
      {/* App Bar */}
      <View style={styles.emptyHeader}>
        <BlackbookLogo size={30} />

        <NotificationBell
          onPress={onNotifications}
          hasAlert={hasAlert}
          color={theme.textSecondary}
        />
      </View>

      {/* Content */}
      <View style={styles.emptyContent}>
        <Svg width={180} height={180} viewBox="0 0 200 200">
          <Rect
            x="30"
            y="30"
            width="140"
            height="140"
            rx="16"
            stroke={theme.border}
            strokeWidth="3"
            fill="none"
          />
          <Line
            x1="60"
            y1="75"
            x2="140"
            y2="75"
            stroke={theme.border}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Line
            x1="60"
            y1="105"
            x2="120"
            y2="105"
            stroke={theme.border}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Circle cx="70" cy="135" r="6" fill={theme.border} />
        </Svg>

        <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
          No debtors yet
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
          Start tracking who owes you money in one simple place.
        </Text>

        <Pressable
          style={[styles.primaryButton, { backgroundColor: theme.primary }]}
          onPress={onAdd}
        >
          <Ionicons name="add" size={18} color={theme.background} />
          <Text style={[styles.primaryButtonText, { color: theme.background }]}>
            Add your first debtor
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ---------------- NORMAL HOME ---------------- */

function NormalHome({
  debtors,
  onNotifications,
  hasAlert,
}: {
  debtors: Debtor[];
  onNotifications: () => void;
  hasAlert: boolean;
}) {
  const router = useRouter();
  const { theme } = useTheme();

  const total = debtors.reduce((sum, d) => sum + d.amount, 0);
  const overdueCount = debtors.filter(
    (d) =>
      d.dueDate && new Date(d.dueDate) < new Date() && d.status !== "Settled",
  ).length;

  return (
    <View style={[styles.normalWrapper, { backgroundColor: theme.background }]}>
      {/* Header */}
      {/* App Bar */}
      <View style={styles.emptyHeader}>
        <BlackbookLogo size={30} />

        <NotificationBell
          onPress={onNotifications}
          hasAlert={hasAlert}
          color={theme.textSecondary}
        />
      </View>

      {/* Balance Card */}
      <View style={[styles.totalCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
          Outstanding Balance
        </Text>
        <Text style={[styles.totalAmount, { color: theme.textPrimary }]}>
          R{total.toFixed(2)}
        </Text>
      </View>

      {/* Metrics */}
      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { backgroundColor: theme.card }]}>
          <Ionicons name="people-outline" size={20} color={theme.textPrimary} />
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
            {debtors.length}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            Debtors
          </Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: theme.card }]}>
          <Ionicons name="alert-circle-outline" size={20} color="#E53935" />
          <Text style={[styles.metricValue, styles.overdueText]}>
            {overdueCount}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            Overdue
          </Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: theme.card }]}>
          <Ionicons name="checkmark-done-outline" size={20} color="#10B981" />
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
            {debtors.filter((d) => d.status === "Settled").length}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            Settled
          </Text>
        </View>
      </View>

      {/* Debtor List */}
      <FlatList
        data={debtors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.debtorCard, { backgroundColor: theme.card }]}
            onPress={() => router.push(`/debtor/${item.id}`)}
          >
            <View style={[styles.avatar, { backgroundColor: theme.border }]}>
              <Text style={[styles.avatarText, { color: theme.textPrimary }]}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.debtorName, { color: theme.textPrimary }]}>
                {item.name}
              </Text>
              {item.dueDate ? (
                <Text
                  style={[styles.debtorMeta, { color: theme.textSecondary }]}
                >
                  Due Date • {new Date(item.dueDate).toLocaleDateString()}
                </Text>
              ) : (
                <Text
                  style={[styles.debtorMeta, { color: theme.textSecondary }]}
                >
                  No due date
                </Text>
              )}
            </View>

            <Text style={[styles.amount, { color: theme.textPrimary }]}>
              R{item.amount.toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function NotificationBell({
  onPress,
  hasAlert,
  color,
}: {
  onPress: () => void;
  hasAlert: boolean;
  color: string;
}) {
  return (
    <Pressable hitSlop={10} onPress={onPress} style={styles.bellWrap}>
      <Ionicons name="notifications-outline" size={24} color={color} />
      {hasAlert && <View style={styles.bellDot} />}
    </Pressable>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  normalWrapper: {
    flex: 1,
  },

  /* App Bars */
  emptyHeader: {
    paddingHorizontal: 20,
    paddingTop: 8, // lowered from safe area
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    fontSize: 24, // larger brand presence
    fontWeight: "700",
    color: "#000",
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 28,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: "#000000",
    includeFontPadding: false,
  },

  /* Empty State */
  bellWrap: {
    position: "relative",
  },
  bellDot: {
    position: "absolute",
    top: 1,
    right: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E53935",
  },
  emptyWrapper: { flex: 1 },
  emptyContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 24,
    fontSize: 22,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 15,
    color: "#7A7A7A",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: "85%",
  },

  primaryButton: {
    marginTop: 28,
    width: "100%",
    height: 54,
    backgroundColor: "#000",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  /* FAB */
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalSheet: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  modalInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  modalButton: {
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
    alignItems: "center",
  },
  modalButtonText: {
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  noticeCard: {
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 16,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  noticeSub: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  noticeEmpty: {
    fontSize: 14,
  },
  noticeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  noticeLeft: {
    flex: 1,
    paddingRight: 12,
  },
  noticeName: {
    fontSize: 14,
    fontWeight: "600",
  },
  noticeDate: {
    fontSize: 12,
    marginTop: 4,
  },
  noticeAmount: {
    fontSize: 14,
    fontWeight: "700",
  },

  /* Cards & Lists (unchanged) */
  totalCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  totalLabel: { color: "#777", fontSize: 14 },
  totalAmount: {
    fontSize: 34,
    fontWeight: "700",
    marginVertical: 6,
    color: "#111",
  },
  totalSub: { color: "#777", fontSize: 13 },

  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    paddingVertical: 16,
    width: "31%",
    alignItems: "center",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 6,
    color: "#111",
  },
  metricLabel: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
    textAlign: "center",
  },
  overdueText: { color: "#E53935" },

  debtorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
  },
  debtorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  debtorMeta: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
});
