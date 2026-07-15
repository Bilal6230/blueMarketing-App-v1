import { useState } from 'react';
import { View } from 'react-native';

import {
  AppButton,
  AppInput,
  AppSwitch,
  AppText,
  Avatar,
  AvatarGroup,
  BottomNavigation,
  EmptyState,
  ErrorState,
  FilterChip,
  HeroMetricCard,
  IconButton,
  InlineMessage,
  LoadingState,
  MetricCard,
  OfflineBanner,
  PasswordInput,
  ProjectPill,
  Screen,
  SearchInput,
  SectionHeader,
  SegmentedControl,
  SkeletonCard,
  StatusBadge,
  TimelineItem,
  ToastPreview,
} from '@/components';
import { useThemeContext } from '@/providers/ThemeProvider';
import { adminPreviewNavigation } from '@/features/preview/navigationModel';
import { lightImpactFeedback } from '@/services/haptics';

export function DesignSystemScreen() {
  const { setThemePreference, theme, themePreference } = useThemeContext();
  const [password, setPassword] = useState('');

  const allColorKeys = Object.keys(
    theme.colors,
  ) as (keyof typeof theme.colors)[];

  return (
    <Screen>
      <SectionHeader
        subtitle="Premium UI/UX prototype available in development mode."
        title="Design system showcase"
      />
      <SegmentedControl
        accessibilityLabel="Theme preference"
        onChange={setThemePreference}
        options={[
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
          { label: 'System', value: 'system' },
        ]}
        value={themePreference}
      />

      <View style={{ gap: 10 }}>
        <SectionHeader title="Typography" />
        <AppText variant="displayLarge">Display large</AppText>
        <AppText variant="headingLarge">Heading large</AppText>
        <AppText variant="bodyLarge">
          Body large with operational detail.
        </AppText>
        <AppText variant="numericHero">PKR 48.2M</AppText>
      </View>

      <View style={{ gap: 10 }}>
        <SectionHeader title="Colour tokens" />
        {allColorKeys.map((key) => (
          <View
            key={key}
            style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}
          >
            <View
              style={{
                backgroundColor: theme.colors[key],
                borderRadius: theme.radius.medium,
                height: 28,
                width: 28,
              }}
            />
            <AppText variant="captionStrong">{key}</AppText>
          </View>
        ))}
      </View>

      <View style={{ gap: 12 }}>
        <SectionHeader title="Buttons and controls" />
        <AppButton title="Primary action" />
        <AppButton title="Secondary action" variant="secondary" />
        <AppButton title="Outline action" variant="outline" />
        <AppButton title="Ghost action" variant="ghost" />
        <AppButton disabled title="Disabled button" />
        <AppButton loading title="Loading button" />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <IconButton
            accessibilityLabel="Open settings"
            icon="settings-outline"
          />
          <FilterChip label="Overdue" selected />
          <ProjectPill label="Blue Residency" />
        </View>
        <AppSwitch
          label="Prototype toggle"
          onValueChange={() => undefined}
          value
        />
      </View>

      <View style={{ gap: 12 }}>
        <SectionHeader title="Inputs" />
        <AppInput
          helperText="Helper copy for operational entry."
          label="Email"
          leadingIcon="mail-outline"
          placeholder="bilal@bluemarketing.com"
        />
        <PasswordInput
          label="Password"
          onChangeText={setPassword}
          placeholder="Enter password"
          value={password}
        />
        <SearchInput label="Lead search" placeholder="Search CRM" />
      </View>

      <View style={{ gap: 12 }}>
        <SectionHeader title="Status and metrics" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <StatusBadge label="Active" variant="active" />
          <StatusBadge label="Pending" variant="pending" />
          <StatusBadge label="Danger" variant="danger" />
          <StatusBadge label="Info" variant="information" />
        </View>
        <MetricCard
          icon="call-outline"
          label="Follow-ups"
          progress={0.64}
          supportText="Due before 5:00 PM"
          value="7"
        />
        <HeroMetricCard
          caption="Recovery hero"
          progress={0.78}
          subtitle="of PKR 61.4M"
          title="PKR 48.2M"
        />
      </View>

      <View style={{ gap: 12 }}>
        <SectionHeader title="People and activity" />
        <Avatar initials="BI" />
        <AvatarGroup avatars={['BI', 'SA', 'AK']} />
        <TimelineItem
          body="Lead routed to field operations."
          time="Today - 9:10 AM"
          title="CRM update"
        />
      </View>

      <View style={{ gap: 12 }}>
        <SectionHeader title="States and messages" />
        <SkeletonCard />
        <LoadingState />
        <EmptyState
          actionLabel="Create item"
          onPressAction={async () => {
            await lightImpactFeedback();
          }}
          subtitle="No prototype items match this state."
          title="Empty state"
        />
        <ErrorState
          actionLabel="Retry"
          onPressAction={() => undefined}
          subtitle="Static review only."
          title="Error state"
        />
        <OfflineBanner />
        <InlineMessage
          message="Prototype message for UI review."
          title="Inline information"
        />
        <ToastPreview />
      </View>

      <View style={{ gap: 12 }}>
        <SectionHeader title="Navigation preview" />
        <BottomNavigation
          items={adminPreviewNavigation.map((item) => ({
            ...item,
            onPress: () => undefined,
          }))}
          selectedKey="crm"
        />
      </View>
    </Screen>
  );
}
