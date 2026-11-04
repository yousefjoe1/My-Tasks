export const AZKAR_NAMES = [
  'لا إله إلا الله',
  'الله أكبر',
  'الحمد لله',
  'سبحان الله',
  'اللهم صل علي نبينا محمد',
] as const;

export type AzkarName = (typeof AZKAR_NAMES)[number];
