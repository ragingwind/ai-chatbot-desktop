export type DataPart = { type: 'append-message'; message: string };

export const APPROVAL = {
  YES: 'Yes, confirmed.',
  NO: 'No, denied.',
} as const;
