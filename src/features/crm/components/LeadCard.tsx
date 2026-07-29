import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Avatar } from '@/components/data-display/Avatar';
import { AppText } from '@/components/controls/AppText';
import { AppCard } from '@/components/layout/AppCard';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { LeadListRecord } from '@/features/crm/services/crmService';
import {
  formatLeadFollowUpLabel,
  getFollowUpTiming,
  getLeadFullName,
  getLeadInitials,
  getRecordStateLabel,
} from '@/features/crm/utils/crmSelectors';

type LeadCardProps = {
  lead: LeadListRecord;
  onPress: () => void;
  onPressCallError: () => void;
};

export function LeadCard({
  lead,
  onPress,
  onPressCallError,
}: LeadCardProps) {
  const { theme } = useAppTheme();
  const fullName = getLeadFullName(lead.firstName, lead.lastName);
  const followUpTiming = getFollowUpTiming(lead.followUp);
  const followUpLabel = formatLeadFollowUpLabel(lead.followUp);
  const timingColor =
    followUpTiming === 'overdue'
      ? theme.colors.danger
      : followUpTiming === 'today'
        ? theme.colors.warning
        : followUpTiming === 'upcoming'
          ? theme.colors.primary
          : theme.colors.textSecondary;

  return (
    <Pressable
      accessibilityLabel={`Open lead ${fullName}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
      testID={`lead-card-${lead.id}`}
    >
      <AppCard padding="none" style={styles.card} surface="elevated">
        <View style={styles.topRow}>
          <View style={styles.identityRow}>
            <Avatar initials={getLeadInitials(lead.firstName, lead.lastName)} size={44} />
            <View style={styles.identityCopy}>
              <AppText numberOfLines={1} variant="title">
                {fullName}
              </AppText>
              <View style={styles.badgesRow}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        lead.recordState === 'active'
                          ? theme.colors.successSoft
                          : theme.colors.surfaceMuted,
                    },
                  ]}
                >
                  <AppText
                    color={lead.recordState === 'active' ? 'success' : 'textSecondary'}
                    variant="captionStrong"
                  >
                    {getRecordStateLabel(lead.recordState)}
                  </AppText>
                </View>
              </View>
            </View>
          </View>
          <Ionicons color={theme.colors.textMuted} name="chevron-forward" size={18} />
        </View>

        <View style={styles.infoBlock}>
          <AppText color="textSecondary" numberOfLines={1} variant="caption">
            {lead.project.name ?? 'Project unavailable'}
          </AppText>
          <AppText variant="bodyStrong">{lead.phoneNumber}</AppText>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.followUpBlock}>
            <AppText color="textSecondary" variant="caption">
              Follow-up
            </AppText>
            <AppText
              numberOfLines={1}
              style={{ color: timingColor }}
              variant="labelStrong"
            >
              {followUpLabel}
            </AppText>
          </View>

          <View style={styles.assignmentBlock}>
            <AppText color="textSecondary" numberOfLines={1} variant="caption">
              {lead.assignedUser ? `Assigned to ${lead.assignedUser.name}` : 'Unassigned'}
            </AppText>
          </View>

          <Pressable
            accessibilityLabel={`Call ${fullName}`}
            accessibilityRole="button"
            disabled={!lead.phoneNumber}
            onPress={async (event) => {
              event.stopPropagation?.();
              const url = `tel:${lead.phoneNumber}`;
              const canOpen = await Linking.canOpenURL(url);

              if (!canOpen) {
                onPressCallError();
                return;
              }

              await Linking.openURL(url);
            }}
            style={({ pressed }) => [
              styles.callButton,
              {
                backgroundColor: pressed
                  ? theme.colors.primaryPressed
                  : theme.colors.primary,
              },
            ]}
            testID={`lead-card-call-${lead.id}`}
          >
            <Ionicons color="#FFFFFF" name="call-outline" size={16} />
            <AppText style={styles.callButtonText} variant="labelStrong">
              Call
            </AppText>
          </Pressable>
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  assignmentBlock: {
    flex: 1,
    justifyContent: 'flex-end',
    minWidth: 0,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  bottomRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 10,
  },
  callButton: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  callButtonText: {
    color: '#FFFFFF',
  },
  card: {
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  followUpBlock: {
    flex: 1.2,
    minWidth: 0,
  },
  identityCopy: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  identityRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    minWidth: 0,
  },
  infoBlock: {
    gap: 4,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
});
