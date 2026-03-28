import { PixelBox } from "./PixelBox";
import { PixelText } from "./PixelText";
import { styles } from "../styles";

type SummaryCardProps = {
  label: string;
  value: string | number;
};

export function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <PixelBox style={styles.summaryCard} contentStyle={styles.summaryCardContent}>
      <PixelText variant="label" style={styles.summaryLabel}>
        {label}
      </PixelText>
      <PixelText variant="screenTitle" style={styles.summaryValue}>
        {value}
      </PixelText>
    </PixelBox>
  );
}
