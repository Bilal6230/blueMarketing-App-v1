export type CrmCallStatusId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type CrmStatusMetadata = {
  id: CrmCallStatusId;
  label: string;
};

export const crmStatusMetadata: CrmStatusMetadata[] = [
  { id: 1, label: 'Invalid number' },
  { id: 2, label: 'Interested' },
  { id: 3, label: 'Schedule later' },
  { id: 4, label: 'Not interested' },
  { id: 5, label: 'Sale done' },
  { id: 6, label: 'New lead' },
  { id: 7, label: 'Town visit' },
  { id: 8, label: 'Outside meeting' },
];

export const updateFollowUpStatusOptions = crmStatusMetadata.filter((status) =>
  [1, 2, 3, 4, 5, 7].includes(status.id),
);

export function getCrmStatusLabel(statusId: number | null | undefined) {
  if (statusId === null || statusId === undefined) {
    return null;
  }

  return crmStatusMetadata.find((status) => status.id === statusId)?.label ?? null;
}
