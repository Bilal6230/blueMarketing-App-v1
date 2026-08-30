import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/controls/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

type CrmHeaderProps = {
  canCreateLead: boolean;
  onPressAddLead: () => void;
};

export function CrmHeader({
  canCreateLead,
  onPressAddLead,
}: CrmHeaderProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <AppText variant="headingMedium">CRM Leads</AppText>
        <AppText color="textSecondary" variant="body">
          Manage customer follow-ups
        </AppText>
      </View>

      {canCreateLead ? (
        <Pressable
          accessibilityLabel="Add lead"
          accessibilityRole="button"
          onPress={onPressAddLead}
          style={({ pressed }) => [
            styles.addButton,
            {
              backgroundColor: pressed
                ? theme.colors.primaryPressed
                : theme.colors.primary,
            },
          ]}
          testID="crm-add-lead-button"
        >
          <Ionicons color="#FFFFFF" name="add" size={18} />
          <AppText style={styles.addButtonText} variant="labelStrong">
            Add
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 6,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  addButtonText: {
    color: '#FFFFFF',
  },
  copy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
});
