import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Debtor = {
  id: string;
  name: string;
  phone: string;
  profileUri: string;
  credibility: "low" | "medium" | "high";
  firstLoanDate: string;
  repaymentInfo: string;
  currentLoan: {
    status: "Unpaid";
    dueDate: string;
    amount: string;
  };
  paymentHistory: string;
  credibilityHistory: { date: string; level: "low" | "medium" | "high" }[];
};

// Sample data updated to match the image
const DEBTORS: Record<string, Debtor> = {
  "1": {
    id: "1",
    name: "Asisipho",
    phone: "067 523 7098",
    profileUri: "https://placeimg.com/100/100/people", // Placeholder image URI
    credibility: "low",
    firstLoanDate: "Apr 24, 2024",
    repaymentInfo: "This borrower has no repayment history yet.",
    currentLoan: {
      status: "Unpaid",
      dueDate: "21 Feb 2026",
      amount: "R500.00",
    },
    paymentHistory: "No payment history yet.",
    credibilityHistory: [], // Empty to match "no history"
  },
  // Other debtors can remain or be updated as needed
};

export default function DebtorProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const debtor = id ? DEBTORS[id] : null;

  if (!debtor) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>Debtor not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="chevron-back-circle" size={32} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{debtor.name}</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBg}>
              <Image
                source={{ uri: debtor.profileUri }}
                style={styles.avatar}
              />
            </View>
            <View style={styles.avatarBadge} />
          </View>
          <Text style={styles.name}>{debtor.name}</Text>
          <View style={styles.phoneContainer}>
            <Text style={styles.phone}>{debtor.phone}</Text>
            <MaterialCommunityIcons
              name="content-copy"
              size={16}
              color="#666"
            />
          </View>
        </View>

        <View style={styles.credibilitySection}>
          <Text style={styles.sectionTitle}>Credibility</Text>
          <View style={styles.credibilityBar}>
            <View style={styles.barItem}>
              <View style={[styles.barDot, styles.low]} />
              <Text style={styles.barLabel}>Low</Text>
            </View>
            <View style={styles.barItem}>
              <View style={[styles.barDot, styles.medium]} />
              <Text style={styles.barLabel}>Medium</Text>
            </View>
            <View style={styles.barItem}>
              <View style={[styles.barDot, styles.high]} />
              <Text style={styles.barLabel}>High</Text>
            </View>
          </View>
          <Text style={styles.firstLoan}>
            First loan added • {debtor.firstLoanDate}
          </Text>
          <Text style={styles.repaymentInfo}>{debtor.repaymentInfo}</Text>
        </View>

        <View style={styles.currentLoanSection}>
          <Text style={styles.sectionTitle}>Current Loan</Text>
          <View style={styles.loanStatus}>
            <Text style={styles.statusText}>{debtor.currentLoan.status}</Text>
          </View>
          <View style={styles.dueDate}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.dueText}>
              Due • {debtor.currentLoan.dueDate}
            </Text>
          </View>
          <Text style={styles.amount}>{debtor.currentLoan.amount}</Text>
        </View>

        <TouchableOpacity style={styles.recordPayment}>
          <MaterialCommunityIcons
            name="pencil-outline"
            size={20}
            color="#666"
          />
          <Text style={styles.recordText}>Record Payment</Text>
        </TouchableOpacity>

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>History</Text>
          <Text style={styles.historyText}>{debtor.paymentHistory}</Text>
          <View style={styles.illustration}>
            <MaterialCommunityIcons
              name="table"
              size={60}
              color="#CCC"
              style={styles.coinIcon}
            />
          </View>
          <View style={styles.credLegend}>
            <View style={[styles.legendDot, styles.low]} />
            <Text style={styles.legendText}>Low credibility</Text>
            <View style={[styles.legendDot, styles.medium]} />
            <Text style={styles.legendText}>Medium credibility</Text>
            <Text style={styles.legendText}>...</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={24} color="#666" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="wallet-outline" size={24} color="#666" />
          <Text style={styles.navText}>Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="bar-chart-outline" size={24} color="#666" />
          <Text style={styles.navText}>Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="settings-outline" size={24} color="#666" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    padding: 16,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 8,
  },
  avatarBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF7F50",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E53935",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  phone: {
    fontSize: 16,
    color: "#666",
    marginRight: 4,
  },
  credibilitySection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  credibilityBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  barItem: {
    alignItems: "center",
  },
  barDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  low: {
    backgroundColor: "#E53935",
  },
  medium: {
    backgroundColor: "#FFC107",
  },
  high: {
    backgroundColor: "#4CAF50",
  },
  barLabel: {
    fontSize: 14,
    color: "#666",
  },
  firstLoan: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  repaymentInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  currentLoanSection: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  loanStatus: {
    backgroundColor: "#E53935",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  statusText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  dueDate: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dueText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  amount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E53935",
  },
  recordPayment: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  recordText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  historySection: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  historyText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    marginBottom: 16,
  },
  illustration: {
    alignItems: "center",
    marginBottom: 12,
  },
  coinIcon: {},
  credLegend: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#DDD",
    paddingVertical: 8,
    backgroundColor: "#FFF",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  notFound: {
    color: "#E53935",
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
  },
});
