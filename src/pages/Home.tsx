import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonText,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import './Home.css';

const Home = () => {
  const [handledTipId, setHandledTipId] = useState<string | null>(null);
  const [unlockedCollections, setUnlockedCollections] = useState<string[] | null>(null);
  const [completedCollections, setCompletedCollections] = useState<string[] | null>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      const { value: tipId } = await Preferences.get({ key: 'handled_tip_id' });
      setHandledTipId(tipId);

      const { value: unlocked } = await Preferences.get({ key: 'unlocked_collections' });
      setUnlockedCollections(unlocked ? JSON.parse(unlocked) : []);

      const { value: completed } = await Preferences.get({ key: 'completed_collections' });
      setCompletedCollections(completed ? JSON.parse(completed) : []);
    };

    fetchPreferences();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pomodoro App</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding" color="light">
        <div style={{ textAlign: 'center', marginTop: '10vh' }}>
          <IonText color="dark" style={{ fontSize: '64px' }}>
            <p>25:00</p>
          </IonText>
          <IonText color="medium" style={{ fontSize: '24px' }}>
            <p>
              {handledTipId
                ? `Último tip desbloqueado: ${handledTipId}`
                : 'Cargando tip...'}
              <br />
              {unlockedCollections !== null &&
                `Colecciones desbloqueadas: ${unlockedCollections.length}`}
              <br />
              {completedCollections !== null &&
                `Colecciones completadas: ${completedCollections.length}`}
            </p>
          </IonText>
          <IonGrid>
            <IonRow className="ion-justify-content-center ion-padding-top">
              <IonCol size="auto">
                <IonButton color="primary">Iniciar</IonButton>
              </IonCol>
              <IonCol size="auto">
                <IonButton color="medium">Pausar</IonButton>
              </IonCol>
              <IonCol size="auto">
                <IonButton color="danger">Reiniciar</IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
