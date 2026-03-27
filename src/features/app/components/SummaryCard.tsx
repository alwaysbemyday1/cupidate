import { Text, View } from "react-native";

import { styles } from "../styles";

type SummaryCardProps = {
  label: string;
  value: string | number;
};

export function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}
