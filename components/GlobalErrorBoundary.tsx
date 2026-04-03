import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  message?: string;
};

export default class GlobalErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch() {
    // Keep silent in production UI; console already gets stack in dev.
  }

  private onRetry = () => {
    this.setState({ hasError: false, message: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.sub}>
          {this.state.message ?? "An unexpected error occurred."}
        </Text>
        <Pressable style={styles.button} onPress={this.onRetry}>
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#0f1215",
  },
  title: {
    color: "#FCFDF9",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  sub: {
    color: "rgba(252,253,249,0.78)",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FCFDF9",
  },
  buttonText: {
    color: "#111",
    fontWeight: "700",
    fontSize: 14,
  },
});
