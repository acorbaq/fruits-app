import { Preferences } from '@capacitor/preferences';

export const POMODORO_STATS_KEY = 'pomodoro_stats';

export interface PomodoroStats {
  totalWorkTime: number; // segundos
  totalPomodoros: number; // ciclos completos (4 work + 3 short + 1 long)
  totalWorkSessions: number; // bloques de trabajo
  pomodoroSessions: Array<{ start: string; end: string; duration: number }>; // para media
  streak: number; // días consecutivos
  lastSessionDate: string | null; // formato: YYYY-MM-DD, obtenido con getLocalIsoDate
  manualPauses: number;
  totalBreakTime: number; // segundos
}

export async function getPomodoroStats(): Promise<PomodoroStats> {
  const { value } = await Preferences.get({ key: POMODORO_STATS_KEY });
  if (!value) {
    return {
      totalWorkSessions: 0,
      totalWorkTime: 0,
      totalBreakTime: 0,
      streak: 0,
      lastSessionDate: null,
      pomodoroSessions: [],
      totalPomodoros: 0,
      manualPauses: 0,
    };
  }
  return JSON.parse(value);
}

export async function savePomodoroStats(stats: PomodoroStats) {
  await Preferences.set({
    key: POMODORO_STATS_KEY,
    value: JSON.stringify(stats),
  });
}