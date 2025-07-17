import { Preferences } from '@capacitor/preferences';
import { getLocalIsoDate } from './date';

export async function isLastSeenToday(key: string = 'last_seen_date'): Promise<boolean> {
  const today = getLocalIsoDate();
  const { value: lastSeen } = await Preferences.get({ key });
  return lastSeen === today;
}