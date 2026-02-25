export const Status = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export const ActivityType = {
  STORY: 'story',
  QUIZ: 'quiz',
  SANDBOX: 'sandbox',
  MIXED: 'mixed',
} as const;

export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];

export const AgeRange = {
  YOUNG: { min: 3, max: 5, label: '3-5' },
  MIDDLE: { min: 6, max: 8, label: '6-8' },
  OLDER: { min: 9, max: 12, label: '9-12' },
} as const;

export const ProgressStatus = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

export type ProgressStatus = (typeof ProgressStatus)[keyof typeof ProgressStatus];
