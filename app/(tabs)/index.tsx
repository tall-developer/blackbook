import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Svg, { Circle, Line, Rect } from "react-native-svg";
import { Debtor, useDebtors } from "../../context/DebtorsContext";
import { useTheme } from "../../context/ThemeContext";
import { parseIsoDateSafe, toDayStart } from "../../utils/date";
import BlackbookLogo from "../components/BlackbookLogo";

/* ---------------- HOME ---------------- */

export default function HomeScreen() {
  const NOTIF_ENABLED_KEY = "bb:notif-enabled";
  const NOTIF_DAYS_KEY = "bb:notif-days-before";
  const router = useRouter();
  const { debtors, hydrated } = useDebtors();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const totalBottomPadding = tabBarHeight + insets.bottom;
  const hasDebtors = debtors.length > 0;
  const { theme } = useTheme();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifEnabled, setNotifEnabled] = React.useState(true);
  const [notifDaysBefore, setNotifDaysBefore] = React.useState(3);
  const [showSkeleton, setShowSkeleton] = React.useState(true);

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
    : debtors.filter((d): d is Debtor & { dueDate: string } => {
        if (!d.dueDate || d.status === "Settled") return false;
        const due = parseIsoDateSafe(d.dueDate);
        if (!due) return false;
        const diffMs = due.getTime() - now.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= daysAhead;
      });

  React.useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => setShowSkeleton(false), 500);
    return () => clearTimeout(timer);
  }, [hydrated]);

  const MainDashboard = () => {
    if (showSkeleton) {
      return <HomeSkeleton />;
    }

    return (
      <SafeAreaView
        edges={["top"]}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {!hasDebtors ? (
          <EmptyState
            onAdd={() => router.push("/(modals)/add-debtor")}
            onNotifications={() => setShowNotifications(true)}
            hasAlert={notifEnabled && upcomingDebtors.length > 0}
          />
        ) : (
          <NormalHome
            debtors={debtors}
            onNotifications={() => setShowNotifications(true)}
            hasAlert={notifEnabled && upcomingDebtors.length > 0}
            listBottomPadding={totalBottomPadding}
          />
        )}

        {/* FAB — ONLY after first debtor */}
        {hasDebtors && (
          <TouchableOpacity
            style={[
              styles.fab,
              {
                backgroundColor: theme.primary,
                bottom: tabBarHeight > 0 ? 16 : insets.bottom + 16,
              },
            ]}
            onPress={() => router.push("/(modals)/add-debtor")}
            activeOpacity={0.9}
          >
            <Ionicons name="add" size={30} color={theme.background} />
          </TouchableOpacity>
        )}

        <Modal
          visible={showNotifications}
          transparent
          animationType="fade"
          statusBarTranslucent={true}
          onRequestClose={() => setShowNotifications(false)}
        >
          <Pressable
            style={[
              styles.modalOverlay,
              { backgroundColor: "rgba(0,0,0,0.6)" },
            ]}
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
                        style={[
                          styles.noticeName,
                          { color: theme.textPrimary },
                        ]}
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
                      style={[
                        styles.noticeAmount,
                        { color: theme.textPrimary },
                      ]}
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
  };

  if (!hydrated) return null;
  return <MainDashboard />;
}

function LoadingSpinner() {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
}

function HomeSkeleton() {
  const { theme, colorScheme } = useTheme();
  const pulse = React.useRef(new Animated.Value(0.55)).current;
  const skeletonBase =
    colorScheme === "dark" ? "rgba(252,253,249,0.12)" : "rgba(0,0,0,0.08)";

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.55,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.emptyHeader}>
        <Animated.View
          style={[
            styles.skeletonLogo,
            { backgroundColor: skeletonBase, opacity: pulse },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonBell,
            { backgroundColor: skeletonBase, opacity: pulse },
          ]}
        />
      </View>

      <Animated.View
        style={[
          styles.skeletonTotalCard,
          { backgroundColor: skeletonBase, opacity: pulse },
        ]}
      />

      <View style={[styles.metricsRow, { marginTop: 8 }]}>
        <Animated.View
          style={[
            styles.skeletonMetricCard,
            { backgroundColor: skeletonBase, opacity: pulse },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonMetricCard,
            { backgroundColor: skeletonBase, opacity: pulse },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonMetricCard,
            { backgroundColor: skeletonBase, opacity: pulse },
          ]}
        />
      </View>

      <Animated.View
        style={[
          styles.skeletonListCard,
          { backgroundColor: skeletonBase, opacity: pulse },
        ]}
      />
      <Animated.View
        style={[
          styles.skeletonListCard,
          { backgroundColor: skeletonBase, opacity: pulse },
        ]}
      />
      <Animated.View
        style={[
          styles.skeletonListCard,
          { backgroundColor: skeletonBase, opacity: pulse },
        ]}
      />
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
  listBottomPadding,
}: {
  debtors: Debtor[];
  onNotifications: () => void;
  hasAlert: boolean;
  listBottomPadding: number;
}) {
  const router = useRouter();
  const { removeDebtor } = useDebtors();
  const { theme, colorScheme } = useTheme();
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const logoTranslateY = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, -70],
    extrapolate: "clamp",
  });
  const logoOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const avatarBg =
    colorScheme === "dark" ? "rgba(252,253,249,0.10)" : "rgba(0,0,0,0.05)";
  const avatarBorder =
    colorScheme === "dark" ? "rgba(252,253,249,0.24)" : "rgba(0,0,0,0.10)";
  const [filter, setFilter] = React.useState<"all" | "active" | "overdue">(
    "all",
  );

  const total = debtors.reduce(
    (sum, d) => sum + Math.max(d.amount - (d.paidAmount || 0), 0),
    0,
  );
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const isDebtorOverdue = React.useCallback(
    (d: Debtor) => {
      if (!d.dueDate || d.status === "Settled") return false;
      const due = parseIsoDateSafe(d.dueDate);
      return !!due && toDayStart(due).getTime() < todayStart.getTime();
    },
    [todayStart],
  );
  const overdueCount = debtors.filter(isDebtorOverdue).length;
  const activeCount = debtors.filter((d) => d.status !== "Settled").length;
  const sortedDebtors = React.useMemo(() => {
    const localTodayStart = new Date();
    localTodayStart.setHours(0, 0, 0, 0);
    return [...debtors].sort((a, b) => {
      const aOverdue =
        !!a.dueDate &&
        (() => {
          const due = parseIsoDateSafe(a.dueDate);
          if (!due) return false;
          const dueStart = toDayStart(due);
          return dueStart.getTime() < localTodayStart.getTime();
        })() &&
        a.status !== "Settled";
      const bOverdue =
        !!b.dueDate &&
        (() => {
          const due = parseIsoDateSafe(b.dueDate);
          if (!due) return false;
          const dueStart = toDayStart(due);
          return dueStart.getTime() < localTodayStart.getTime();
        })() &&
        b.status !== "Settled";
      if (aOverdue === bOverdue) return 0;
      return aOverdue ? -1 : 1;
    });
  }, [debtors]);
  const filteredDebtors = React.useMemo(() => {
    if (filter === "active") {
      return sortedDebtors.filter((d) => d.status !== "Settled");
    }
    if (filter === "overdue") {
      return sortedDebtors.filter(isDebtorOverdue);
    }
    return sortedDebtors;
  }, [filter, sortedDebtors, isDebtorOverdue]);

  return (
    <View style={[styles.normalWrapper, { backgroundColor: theme.background }]}>
      <Animated.View
        style={[
          styles.stickyHeaderContainer,
          {
            backgroundColor: theme.background,
            transform: [{ translateY: logoTranslateY }],
          },
        ]}
      >
        <Animated.View style={[styles.emptyHeader, { opacity: logoOpacity }]}>
          <BlackbookLogo size={30} />
          <NotificationBell
            onPress={onNotifications}
            hasAlert={hasAlert}
            color={theme.textSecondary}
          />
        </Animated.View>

        <View
          style={[
            styles.totalCard,
            { backgroundColor: theme.card, marginBottom: 10 },
          ]}
        >
          <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
            Outstanding Balance
          </Text>
          <Text style={[styles.totalAmount, { color: theme.textPrimary }]}>
            R{total.toFixed(2)}
          </Text>
        </View>
      </Animated.View>

      <Animated.FlatList
        data={filteredDebtors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: 210,
          paddingBottom: listBottomPadding,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        ListHeaderComponent={() => (
          <View style={styles.metricsRow}>
            <HomeFilterCard
              icon="people"
              label="All"
              value={debtors.length.toString()}
              isActive={filter === "all"}
              onPress={() => setFilter("all")}
              theme={theme}
            />
            <HomeFilterCard
              icon="timer-outline"
              label="Active"
              value={activeCount.toString()}
              isActive={filter === "active"}
              onPress={() => setFilter("active")}
              theme={theme}
            />
            <HomeFilterCard
              icon="alert-circle"
              label="Overdue"
              value={overdueCount.toString()}
              isActive={filter === "overdue"}
              onPress={() => setFilter("overdue")}
              theme={theme}
              isAlert={overdueCount > 0}
            />
          </View>
        )}
        renderItem={({ item }) => (
          <Swipeable
            overshootRight={false}
            friction={2}
            rightThreshold={72}
            dragOffsetFromRightEdge={28}
            renderRightActions={() => (
              <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => {
                  Alert.alert("Delete debtor", `Remove ${item.name}?`, [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => removeDebtor(item.id),
                    },
                  ]);
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#FFF" />
                <Text style={styles.deleteActionText}>Delete</Text>
              </TouchableOpacity>
            )}
          >
            <TouchableOpacity
              style={[
                styles.debtorCard,
                { backgroundColor: theme.card },
                item.status === "Settled" && styles.debtorCardSettled,
              ]}
              onPress={() => router.push(`/debtor/${item.id}`)}
            >
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: avatarBg, borderColor: avatarBorder },
                ]}
              >
                <Text style={[styles.avatarText, { color: theme.textPrimary }]}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.debtorName, { color: theme.textPrimary }]}>
                  {item.name}
                </Text>
                <Text
                  style={[styles.debtorMeta, { color: theme.textSecondary }]}
                >
                  {item.dueDate
                    ? `Due Date \u2022 ${new Date(item.dueDate).toLocaleDateString()}`
                    : "No due date"}
                </Text>
              </View>

              <View style={styles.amountWrap}>
                <Text style={[styles.amount, { color: theme.textPrimary }]}>
                  R{item.amount.toFixed(2)}
                </Text>

                <Text
                  style={[
                    styles.statusText,
                    item.status === "Settled"
                      ? styles.statusSettled
                      : item.status === "Partial"
                        ? styles.statusPartial
                        : styles.statusUnpaid,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </TouchableOpacity>
          </Swipeable>
        )}
      />
    </View>
  );
}

function HomeFilterCard({
  icon,
  label,
  value,
  theme,
  isAlert,
  isActive,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  theme: ReturnType<typeof useTheme>["theme"];
  isAlert?: boolean;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.filterCard,
        {
          backgroundColor: isActive ? theme.textPrimary : theme.card,
          borderColor: theme.border,
          elevation: isActive ? 3 : 0,
          shadowOpacity: isActive ? 0.12 : 0,
        },
      ]}
    >
      <View style={styles.filterRow}>
        <Ionicons
          name={icon}
          size={18}
          color={
            isActive
              ? theme.background
              : isAlert
                ? "#FF5252"
                : theme.textSecondary
          }
        />
        <Text
          style={[
            styles.filterValue,
            { color: isActive ? theme.background : theme.textPrimary },
          ]}
        >
          {value}
        </Text>
      </View>
      <Text
        style={[
          styles.filterLabel,
          { color: isActive ? theme.background : theme.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
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
  stickyHeaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 8,
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
  skeletonLogo: {
    width: 132,
    height: 30,
    borderRadius: 8,
  },
  skeletonBell: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  skeletonTotalCard: {
    borderRadius: 20,
    height: 128,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  skeletonMetricCard: {
    borderRadius: 18,
    height: 108,
    width: "31%",
  },
  skeletonListCard: {
    borderRadius: 16,
    height: 82,
    marginHorizontal: 16,
    marginBottom: 12,
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
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
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
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  filterCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  filterValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  debtorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  debtorCardSettled: {
    opacity: 0.78,
  },
  deleteAction: {
    width: 96,
    marginRight: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  deleteActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
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
  amountWrap: {
    alignItems: "flex-end",
  },
  statusText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
  },
  statusSettled: {
    color: "#10B981",
  },
  statusPartial: {
    color: "#F59E0B",
  },
  statusUnpaid: {
    color: "#9CA3AF",
  },
  settledBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "rgba(16,185,129,0.18)",
  },
  settledBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#10B981",
  },
  overdueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E53935",
    position: "absolute",
    top: 10,
    right: 10,
  },
});
