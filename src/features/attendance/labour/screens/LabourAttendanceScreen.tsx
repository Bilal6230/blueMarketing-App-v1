import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import {
  AppCard,
  AppInput,
  AppTabScaffold,
  AppText,
  EmptyState,
  InlineMessage,
  SegmentedControl,
  SkeletonCard,
} from '@/components';
import { resolvePrimaryRole } from '@/features/auth/utils/authSession';
import { LabourAttendanceCard } from '@/features/attendance/labour/components/LabourAttendanceCard';
import { LabourAttendanceDetailsSheet } from '@/features/attendance/labour/components/LabourAttendanceDetailsSheet';
import { useLabourAttendanceStore } from '@/features/attendance/labour/store/labourAttendanceStore';
import {
  type LabourAttendanceDraft,
  type LabourAttendanceStatus,
  type LabourRecord,
} from '@/features/attendance/labour/services/labourAttendanceService';
import { formatLabourAttendanceDate } from '@/features/attendance/labour/utils/labourAttendanceDate';
import {
  canMarkLabourAttendance,
  canReadLabourAttendance,
  canUpdateSavedLabourAttendance,
} from '@/features/attendance/labour/utils/labourAttendancePermissions';
import { getBottomNavigationItems } from '@/features/navigation/appNavigation';
import { useAuthStore } from '@/store/authStore';

const SAVE_BAR_HEIGHT = 88;

export const labourAttendanceScaffoldContentStyle = {
  paddingBottom: 0,
};

export const labourAttendanceListContentStyle = {
  gap: 12,
  paddingBottom: SAVE_BAR_HEIGHT + 16,
};

export function LabourAttendanceScreen() {
  const permissions = useAuthStore((state) => state.permissions);
  const roles = useAuthStore((state) => state.roles);
  const projects = useAuthStore((state) => state.projects);
  const selectedProjectId = useAuthStore((state) => state.selectedProjectId);
  const setSelectedProject = useAuthStore((state) => state.setSelectedProject);
  const role = resolvePrimaryRole(roles);
  const canRead = canReadLabourAttendance(permissions);
  const canMark = canMarkLabourAttendance(permissions);
  const canUpdateSaved = canUpdateSavedLabourAttendance(permissions, roles);
  const sites = useLabourAttendanceStore((state) => state.sites);
  const selectedSiteId = useLabourAttendanceStore((state) => state.selectedSiteId);
  const labours = useLabourAttendanceStore((state) => state.labours);
  const drafts = useLabourAttendanceStore((state) => state.drafts);
  const meta = useLabourAttendanceStore((state) => state.meta);
  const isLoadingSites = useLabourAttendanceStore((state) => state.isLoadingSites);
  const isLoadingLabours = useLabourAttendanceStore((state) => state.isLoadingLabours);
  const isLoadingMore = useLabourAttendanceStore((state) => state.isLoadingMore);
  const isSaving = useLabourAttendanceStore((state) => state.isSaving);
  const loadError = useLabourAttendanceStore((state) => state.loadError);
  const saveError = useLabourAttendanceStore((state) => state.saveError);
  const successMessage = useLabourAttendanceStore((state) => state.successMessage);
  const search = useLabourAttendanceStore((state) => state.search);
  const recordStateFilter = useLabourAttendanceStore(
    (state) => state.recordStateFilter,
  );
  const currentProjectId = useLabourAttendanceStore((state) => state.currentProjectId);
  const loadSites = useLabourAttendanceStore((state) => state.loadSites);
  const loadLabours = useLabourAttendanceStore((state) => state.loadLabours);
  const loadMoreLabours = useLabourAttendanceStore((state) => state.loadMoreLabours);
  const markPresent = useLabourAttendanceStore((state) => state.markPresent);
  const markAbsent = useLabourAttendanceStore((state) => state.markAbsent);
  const updateDraft = useLabourAttendanceStore((state) => state.updateDraft);
  const markAllVisiblePresent = useLabourAttendanceStore(
    (state) => state.markAllVisiblePresent,
  );
  const clearDraft = useLabourAttendanceStore((state) => state.clearDraft);
  const saveAttendance = useLabourAttendanceStore((state) => state.saveAttendance);
  const resetLabourAttendanceState = useLabourAttendanceStore(
    (state) => state.resetLabourAttendanceState,
  );
  const selectSite = useLabourAttendanceStore((state) => state.selectSite);
  const setSearch = useLabourAttendanceStore((state) => state.setSearch);
  const setRecordStateFilter = useLabourAttendanceStore(
    (state) => state.setRecordStateFilter,
  );
  const [searchInput, setSearchInput] = useState(search);
  const [siteModalVisible, setSiteModalVisible] = useState(false);
  const [pendingSiteId, setPendingSiteId] = useState<number | null>(null);
  const [showMarkAllConfirm, setShowMarkAllConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [detailsTarget, setDetailsTarget] = useState<{
    draft: LabourAttendanceDraft | undefined;
    labour: LabourRecord;
    status: LabourAttendanceStatus;
  } | null>(null);
  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ?? null;
  const selectedSite =
    sites.find((site) => site.id === selectedSiteId) ?? null;
  const currentDateLabel = formatLabourAttendanceDate(meta?.date ?? '2026-07-29');
  const dirtyDrafts = Object.values(drafts).filter(
    (draft) => draft.isDirty && draft.status !== null,
  );
  const visibleCounts = useMemo(() => {
    let present = 0;
    let absent = 0;
    let unmarked = 0;

    for (const labour of labours) {
      const status = drafts[labour.id]?.status ?? labour.todayAttendance?.status ?? null;

      if (status === 'present') {
        present += 1;
      } else if (status === 'absent') {
        absent += 1;
      } else {
        unmarked += 1;
      }
    }

    return {
      absent,
      present,
      total: labours.length,
      unmarked,
    };
  }, [drafts, labours]);
  const needsProjectChangeConfirmation =
    selectedProjectId !== null &&
    currentProjectId !== null &&
    selectedProjectId !== currentProjectId &&
    dirtyDrafts.length > 0;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchInput, setSearch]);

  useEffect(() => {
    if (!canRead || selectedProjectId === null) {
      return;
    }

    if (currentProjectId === null) {
      void loadSites(selectedProjectId);
      void loadLabours({
        page: 1,
        perPage: 12,
        projectId: selectedProjectId,
        recordState: recordStateFilter,
        search,
        siteId: selectedSiteId ?? undefined,
      });
      return;
    }

    if (selectedProjectId !== currentProjectId) {
      if (dirtyDrafts.length > 0) {
        return;
      }

      resetLabourAttendanceState();
      void loadSites(selectedProjectId);
      void loadLabours({
        page: 1,
        perPage: 12,
        projectId: selectedProjectId,
        recordState: recordStateFilter,
        search,
      });
    }
  }, [
    canRead,
    currentProjectId,
    dirtyDrafts.length,
    loadLabours,
    loadSites,
    recordStateFilter,
    resetLabourAttendanceState,
    search,
    selectedProjectId,
    selectedSiteId,
  ]);

  useEffect(() => {
    if (!canRead || !selectedProjectId || currentProjectId !== selectedProjectId) {
      return;
    }

    void loadLabours({
      page: 1,
      perPage: 12,
      projectId: selectedProjectId,
      recordState: recordStateFilter,
      search,
      siteId: selectedSiteId ?? undefined,
    });
  }, [
    canRead,
    currentProjectId,
    loadLabours,
    recordStateFilter,
    search,
    selectedProjectId,
    selectedSiteId,
  ]);

  if (!canRead) {
    return (
      <AppTabScaffold
        contentContainerStyle={labourAttendanceScaffoldContentStyle}
        items={getBottomNavigationItems(role)}
        scrollable={false}
        selectedKey="attendance"
        testID="labour-attendance-screen"
      >
        <EmptyState
          subtitle="Attendance is not available for this account."
          title="Attendance unavailable"
        />
      </AppTabScaffold>
    );
  }

  return (
    <AppTabScaffold
      contentContainerStyle={labourAttendanceScaffoldContentStyle}
      items={getBottomNavigationItems(role)}
      scrollable={false}
      selectedKey="attendance"
      testID="labour-attendance-screen"
    >
      <View style={styles.container}>
        {loadError ? (
          <InlineMessage
            message={loadError}
            title="Attendance"
            tone="danger"
          />
        ) : null}
        {saveError ? (
          <InlineMessage
            message={saveError}
            title="Attendance"
            tone="danger"
          />
        ) : null}
        {successMessage ? (
          <InlineMessage
            message={successMessage}
            title="Attendance"
            tone="success"
          />
        ) : null}

        <FlatList
          contentContainerStyle={labourAttendanceListContentStyle}
          data={labours}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            isLoadingLabours ? null : (
              <EmptyState
                subtitle={
                  recordStateFilter === 'active'
                    ? 'No active labourers are available for this project.'
                    : 'Try a different name, role or phone number.'
                }
                title={
                  search
                    ? 'No labourers found'
                    : recordStateFilter === 'active'
                      ? 'No active labourers are available for this project.'
                      : 'No labourers found'
                }
              />
            )
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadingMore}>
                <AppText color="textSecondary" variant="caption">
                  Loading more labourers...
                </AppText>
              </View>
            ) : null
          }
          ListHeaderComponent={
            <View style={styles.headerStack}>
              <View style={styles.header}>
                <AppText variant="headingMedium">Labour Attendance</AppText>
                <AppText color="textSecondary" variant="body">
                  {selectedProject?.name ?? 'Project unavailable'}
                </AppText>
                <AppText color="textSecondary" variant="body">
                  {currentDateLabel}
                </AppText>
              </View>

              <AppCard surface="elevated">
                <AppText variant="labelStrong">Select site</AppText>
                {isLoadingSites ? (
                  <SkeletonCard />
                ) : (
                  <Pressable
                    accessibilityLabel="Select site"
                    accessibilityRole="button"
                    onPress={() => setSiteModalVisible(true)}
                    style={({ pressed }) => [
                      styles.siteSelector,
                      { opacity: pressed ? 0.76 : 1 },
                    ]}
                  >
                    <AppText variant="bodyStrong">
                      {selectedSite?.name ?? 'Select site'}
                    </AppText>
                    <AppText color="textSecondary" variant="labelStrong">
                      Open
                    </AppText>
                  </Pressable>
                )}
                {!selectedSite ? (
                  <AppText color="textSecondary" variant="caption">
                    Select a site to mark attendance.
                  </AppText>
                ) : null}
              </AppCard>

              <AppInput
                accessibilityLabel="Search labourers"
                label="Search"
                onChangeText={setSearchInput}
                placeholder="Search by name, role or phone"
                testID="labour-search-input"
                value={searchInput}
              />

              <SegmentedControl
                accessibilityLabel="Labour state filter"
                onChange={(value) =>
                  setRecordStateFilter(value as 'active' | 'inactive')
                }
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                ]}
                value={recordStateFilter}
              />

              <AppCard style={styles.summaryCard} surface="elevated">
                <SummaryItem
                  color="primary"
                  label="Total"
                  value={visibleCounts.total}
                />
                <SummaryItem
                  color="success"
                  label="Present"
                  value={visibleCounts.present}
                />
                <SummaryItem
                  color="danger"
                  label="Absent"
                  value={visibleCounts.absent}
                />
                <SummaryItem
                  color="warning"
                  label="Unmarked"
                  value={visibleCounts.unmarked}
                />
              </AppCard>

              <Pressable
                accessibilityLabel="Mark all visible labourers present"
                accessibilityRole="button"
                disabled={!selectedSite || !canMark}
                onPress={() => setShowMarkAllConfirm(true)}
                style={({ pressed }) => [
                  styles.markAllButton,
                  {
                    opacity:
                      !selectedSite || !canMark ? 0.45 : pressed ? 0.76 : 1,
                  },
                ]}
              >
                <AppText color="primary" variant="labelStrong">
                  Mark all present
                </AppText>
              </Pressable>
            </View>
          }
          onEndReached={() => void loadMoreLabours()}
          onEndReachedThreshold={0.25}
          renderItem={({ item }) => {
            const draft = drafts[item.id];
            const isReadOnlySaved =
              Boolean(item.todayAttendance) &&
              !draft &&
              (!canMark || !canUpdateSaved);
            const isMarkingDisabled =
              !selectedSite || !canMark || (isReadOnlySaved && !draft);

            return (
              <LabourAttendanceCard
                draft={draft}
                isMarkingDisabled={isMarkingDisabled}
                isReadOnlySaved={isReadOnlySaved}
                labour={item}
                onEditDetails={() => {
                  const status =
                    draft?.status ?? item.todayAttendance?.status ?? null;

                  if (!status || isMarkingDisabled) {
                    return;
                  }

                  setDetailsTarget({
                    draft,
                    labour: item,
                    status,
                  });
                }}
                onMarkAbsent={() => {
                  if (isMarkingDisabled) {
                    return;
                  }

                  markAbsent(item.id);
                }}
                onMarkPresent={() => {
                  if (isMarkingDisabled) {
                    return;
                  }

                  markPresent(item.id);
                }}
              />
            );
          }}
          style={styles.list}
        />

        <View
          style={[
            styles.saveBar,
            { backgroundColor: '#FFFFFF', borderColor: '#D7E0EB' },
          ]}
        >
          <AppText variant="bodyStrong">
            {`${dirtyDrafts.length} marked \u00B7 ${visibleCounts.unmarked} unmarked`}
          </AppText>
          <Pressable
            accessibilityLabel="Save attendance"
            accessibilityRole="button"
            accessibilityState={{
              busy: isSaving,
              disabled:
                !selectedSite || dirtyDrafts.length === 0 || isSaving || !canMark,
            }}
            disabled={
              !selectedSite || dirtyDrafts.length === 0 || isSaving || !canMark
            }
            onPress={() => setShowSaveConfirm(true)}
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor:
                  !selectedSite || dirtyDrafts.length === 0 || isSaving || !canMark
                    ? '#AEBBCB'
                    : pressed
                      ? '#1F63D5'
                      : '#2878F0',
              },
            ]}
            testID="labour-save-button"
          >
            <AppText style={{ color: '#FFFFFF' }} variant="labelStrong">
              Save Attendance
            </AppText>
          </Pressable>
        </View>
      </View>

      <SelectionModal
        items={sites.map((site) => ({
          label: site.name,
          value: site.id,
        }))}
        onClose={() => setSiteModalVisible(false)}
        onSelect={(value) => {
          setSiteModalVisible(false);

          if (dirtyDrafts.length > 0) {
            setPendingSiteId(value);
            return;
          }

          selectSite(value);
        }}
        title="Select site"
        visible={siteModalVisible}
      />

      <SimpleConfirmModal
        body="Each unmarked labourer will receive: Full day \u00B7 8 hours \u00B7 No overtime"
        confirmLabel="Mark present"
        onCancel={() => setShowMarkAllConfirm(false)}
        onConfirm={() => {
          markAllVisiblePresent();
          setShowMarkAllConfirm(false);
        }}
        title="Mark visible labourers present?"
        visible={showMarkAllConfirm}
      />

      <SimpleConfirmModal
        body={`${dirtyDrafts.length} records will be saved.\n${visibleCounts.unmarked} labourers remain unmarked.`}
        confirmLabel="Save attendance"
        onCancel={() => setShowSaveConfirm(false)}
        onConfirm={() => {
          if (!selectedProjectId) {
            return;
          }

          void saveAttendance(selectedProjectId, selectedSiteId);
          setShowSaveConfirm(false);
        }}
        subtitle={`Site: ${selectedSite?.name ?? 'Select site'}`}
        title="Save labour attendance?"
        visible={showSaveConfirm}
      />

      <SimpleConfirmModal
        body="Unsaved labour attendance will be discarded for the current project."
        confirmLabel="Discard changes"
        onCancel={() => {
          if (currentProjectId !== null) {
            void setSelectedProject(currentProjectId);
          }
        }}
        onConfirm={() => {
          if (!selectedProjectId) {
            return;
          }

          resetLabourAttendanceState();
          void loadSites(selectedProjectId);
          void loadLabours({
            page: 1,
            perPage: 12,
            projectId: selectedProjectId,
            recordState: recordStateFilter,
            search,
          });
        }}
        subtitle="The selected project changed."
        title="Discard unsaved attendance?"
        visible={needsProjectChangeConfirmation}
      />

      <SimpleConfirmModal
        body="Unsaved attendance for the current site will be discarded."
        confirmLabel="Switch site"
        onCancel={() => setPendingSiteId(null)}
        onConfirm={() => {
          selectSite(pendingSiteId);
          setPendingSiteId(null);
          Object.keys(drafts).forEach((key) => clearDraft(Number(key)));
        }}
        title="Discard current site drafts?"
        visible={pendingSiteId !== null}
      />

      {detailsTarget ? (
        <LabourAttendanceDetailsSheet
          key={`${detailsTarget.labour.id}-${detailsTarget.status}-${detailsTarget.draft?.hours ?? 0}`}
          initialDraft={{
            hours:
              detailsTarget.draft?.hours ??
              (detailsTarget.labour.todayAttendance?.status === 'present'
                ? Number(detailsTarget.labour.todayAttendance.hours)
                : detailsTarget.status === 'present'
                  ? 8
                  : 0),
            overtimeHours:
              detailsTarget.draft?.overtimeHours ??
              (detailsTarget.labour.todayAttendance?.status === 'present'
                ? Number(detailsTarget.labour.todayAttendance.overtimeHours)
                : 0),
            rate:
              detailsTarget.draft?.rate ??
              Number(detailsTarget.labour.dailyWage),
            rating: detailsTarget.draft?.rating ?? null,
            remarks: detailsTarget.draft?.remarks ?? '',
          }}
          labour={detailsTarget.labour}
          onApply={(changes) => updateDraft(detailsTarget.labour.id, changes)}
          onClose={() => setDetailsTarget(null)}
          onReset={() => clearDraft(detailsTarget.labour.id)}
          status={detailsTarget.status}
          visible
        />
      ) : null}
    </AppTabScaffold>
  );
}

type SummaryItemProps = {
  color: 'danger' | 'primary' | 'success' | 'warning';
  label: string;
  value: number;
};

function SummaryItem({ color, label, value }: SummaryItemProps) {
  const palette =
    color === 'success'
      ? { foreground: '#14805E' }
      : color === 'danger'
        ? { foreground: '#C43D4B' }
        : color === 'warning'
          ? { foreground: '#9A5B0F' }
          : { foreground: '#2878F0' };

  return (
    <View style={styles.summaryItem}>
      <AppText style={{ color: palette.foreground }} variant="numericMedium">
        {value}
      </AppText>
      <AppText color="textSecondary" variant="caption">
        {label}
      </AppText>
    </View>
  );
}

type SelectionModalProps = {
  items: { label: string; value: number }[];
  onClose: () => void;
  onSelect: (value: number) => void;
  title: string;
  visible: boolean;
};

function SelectionModal({
  items,
  onClose,
  onSelect,
  title,
  visible,
}: SelectionModalProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <Pressable onPress={onClose} style={styles.modalOverlay}>
        <Pressable onPress={() => undefined} style={styles.modalCard}>
          <AppText variant="headingSmall">{title}</AppText>
          {items.map((item) => (
            <Pressable
              accessibilityLabel={item.label}
              accessibilityRole="button"
              key={item.value}
              onPress={() => onSelect(item.value)}
              style={({ pressed }) => [
                styles.modalOption,
                { opacity: pressed ? 0.72 : 1 },
              ]}
            >
              <AppText variant="bodyStrong">{item.label}</AppText>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

type SimpleConfirmModalProps = {
  body: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  subtitle?: string;
  title: string;
  visible: boolean;
};

function SimpleConfirmModal({
  body,
  confirmLabel,
  onCancel,
  onConfirm,
  subtitle,
  title,
  visible,
}: SimpleConfirmModalProps) {
  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <Pressable onPress={onCancel} style={styles.modalOverlay}>
        <Pressable onPress={() => undefined} style={styles.modalCard}>
          <AppText variant="headingSmall">{title}</AppText>
          {subtitle ? (
            <AppText color="textSecondary" variant="bodyStrong">
              {subtitle}
            </AppText>
          ) : null}
          <AppText color="textSecondary" variant="body">
            {body}
          </AppText>
          <View style={styles.modalActions}>
            <Pressable
              accessibilityLabel="Cancel attendance action"
              accessibilityRole="button"
              onPress={onCancel}
              style={styles.modalSecondaryButton}
            >
              <AppText variant="labelStrong">Cancel</AppText>
            </Pressable>
            <Pressable
              accessibilityLabel={confirmLabel}
              accessibilityRole="button"
              onPress={onConfirm}
              style={styles.modalPrimaryButton}
            >
              <AppText style={{ color: '#FFFFFF' }} variant="labelStrong">
                {confirmLabel}
              </AppText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
  },
  header: {
    gap: 4,
  },
  headerStack: {
    gap: 16,
  },
  list: {
    flex: 1,
    minHeight: 0,
  },
  loadingMore: {
    paddingBottom: 8,
  },
  markAllButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    gap: 14,
    padding: 18,
    width: '100%',
  },
  modalOption: {
    minHeight: 44,
    justifyContent: 'center',
  },
  modalOverlay: {
    backgroundColor: 'rgba(7, 20, 38, 0.42)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalPrimaryButton: {
    alignItems: 'center',
    backgroundColor: '#2878F0',
    borderRadius: 16,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  modalSecondaryButton: {
    alignItems: 'center',
    backgroundColor: '#EDF2F8',
    borderRadius: 16,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  saveBar: {
    borderTopWidth: 1,
    gap: 10,
    paddingBottom: 12,
    paddingTop: 12,
  },
  saveButton: {
    alignItems: 'center',
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 48,
  },
  siteSelector: {
    alignItems: 'center',
    backgroundColor: '#F8FBFF',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    gap: 4,
  },
});
