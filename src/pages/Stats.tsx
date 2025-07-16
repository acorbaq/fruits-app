import { IonPage, IonContent, IonButton, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences';
import { getLocalIsoDate } from '../utils/date';

import { getPomodoroStats, PomodoroStats } from '../utils/pomodoroStats';

const STORAGE_KEYS = {
  handledTipIds: 'handled_tip_id',
  unlockedCollections: 'unlocked_collections',
  completedCollections: 'completed_collections',
  lastSeenDate: 'last_seen_date',
};

const Stats: React.FC = () => {
  const history = useHistory();
  const [pomodoroStats, setPomodoroStats] = useState<PomodoroStats | null>(null);
  const [handledTips, setHandledTips] = useState<string[]>([]);
  const [unlockedCollections, setUnlockedCollections] = useState<string[]>([]);
  const [completedCollections, setCompletedCollections] = useState<string[]>([]);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      const stats = await getPomodoroStats();
      setPomodoroStats(stats);
    };
    loadStats();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      const { value: tipsValue } = await Preferences.get({ key: STORAGE_KEYS.handledTipIds });
      setHandledTips(tipsValue ? JSON.parse(tipsValue) : []);
      const { value: unlockedValue } = await Preferences.get({ key: STORAGE_KEYS.unlockedCollections });
      setUnlockedCollections(unlockedValue ? JSON.parse(unlockedValue) : []);
      const { value: completedValue } = await Preferences.get({ key: STORAGE_KEYS.completedCollections });
      setCompletedCollections(completedValue ? JSON.parse(completedValue) : []);
      const { value: lastSeenValue } = await Preferences.get({ key: STORAGE_KEYS.lastSeenDate });
      setLastSeen(lastSeenValue || null);
    };
    loadStats();
  }, []);
  
  const handleResetStats = async () => {
    await Preferences.remove({ key: STORAGE_KEYS.handledTipIds });
    await Preferences.remove({ key: STORAGE_KEYS.unlockedCollections });
    await Preferences.remove({ key: STORAGE_KEYS.completedCollections });
    await Preferences.remove({ key: STORAGE_KEYS.lastSeenDate });
    await Preferences.remove({ key: 'pomodoro_stats' }); // <-- Borra también las estadísticas de Pomodoro
    setHandledTips([]);
    setUnlockedCollections([]);
    setCompletedCollections([]);
    setLastSeen(null);
    // Recarga las stats desde la fuente real
    const stats = await getPomodoroStats();
    setPomodoroStats(stats);
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Estadísticas</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonLabel>
                  <strong>Frases desbloqueadas:</strong> {handledTips.length}
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <strong>Colecciones abiertas:</strong> {unlockedCollections.length}
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <strong>Colecciones completadas:</strong> {completedCollections.length}
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <strong>Último día menú welcome:</strong> {lastSeen || 'Nunca'}
                </IonLabel>
              </IonItem>
              <IonItem>
                  <IonLabel>
                  <strong>Fecha y hora actual:</strong> {getLocalIsoDate()}
                  </IonLabel>
                </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Pomodoro</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {pomodoroStats ? (
              <IonList>
                <IonItem>
                  <IonLabel>
                    <strong>Sesiones de trabajo completadas:</strong> {pomodoroStats.totalWorkSessions}
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <strong>Tiempo trabajado:</strong> {
                      (() => {
                        const min = Math.floor(pomodoroStats.totalWorkTime / 60);
                        const h = Math.floor(min / 60);
                        const m = min % 60;
                        return h > 0 ? `${h} h ${m} m` : `${m} m`;
                      })()
                    }
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <strong>Tiempo de descanso:</strong> {
                      (() => {
                        const min = Math.floor(pomodoroStats.totalBreakTime / 60);
                        const h = Math.floor(min / 60);
                        const m = min % 60;
                        return h > 0 ? `${h} h ${m} m` : `${m} m`;
                      })()
                    }
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <strong>Ciclos Pomodoro completos:</strong> {pomodoroStats.totalPomodoros}
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <strong>Racha de días productivos:</strong> {pomodoroStats.streak}
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <strong>Fecha de la última sesión:</strong> {pomodoroStats.lastSessionDate || 'Nunca'}
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <strong>Pausas manuales:</strong> {pomodoroStats.manualPauses}
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <strong>Promedio de duración de sesión:</strong> {
                      (() => {
                        const promedio = pomodoroStats.pomodoroSessions.length
                          ? Math.round(
                              pomodoroStats.pomodoroSessions.reduce((acc, s) => acc + s.duration, 0) /
                              pomodoroStats.pomodoroSessions.length
                            )
                          : 0;
                        const min = Math.floor(promedio / 60);
                        const h = Math.floor(min / 60);
                        const m = min % 60;
                        return h > 0 ? `${h} h ${m} m` : `${m} m`;
                      })()
                    }
                  </IonLabel>
                </IonItem>
              </IonList>
            ) : (
              <IonText color="medium">No hay estadísticas de Pomodoro registradas.</IonText>
            )}
          </IonCardContent>
        </IonCard>
        <IonButton fill="clear" expand="block" onClick={() => history.replace('/mainmenu')}>
            <IonText color="danger">Menú Principal</IonText>
        </IonButton>
        <IonButton
          fill="outline"
          color="warning"
          expand="block"
          onClick={handleResetStats}
          style={{ marginTop: 16, marginBottom: 8 }}
        >
          <IonText color="warning">Reiniciar estadísticas</IonText>
        </IonButton>

      </IonContent>
    </IonPage>
  );
};

export default Stats;