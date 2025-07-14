import { IonPage, IonContent, IonButton, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences';
import { getLocalIsoDate } from '../utils/date';

const STORAGE_KEYS = {
  handledTipIds: 'handled_tip_id',
  unlockedCollections: 'unlocked_collections',
  completedCollections: 'completed_collections',
  lastSeenDate: 'last_seen_date',
};

const Stats: React.FC = () => {
  const history = useHistory();
  const [handledTips, setHandledTips] = useState<string[]>([]);
  const [unlockedCollections, setUnlockedCollections] = useState<string[]>([]);
  const [completedCollections, setCompletedCollections] = useState<string[]>([]);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

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
        <IonButton fill="clear" expand="block" onClick={() => history.replace('/mainmenu')}>
            <IonText color="danger">Menú Principal</IonText>
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Stats;