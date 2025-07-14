// src/pages/MainMenu.tsx
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonText,
  IonCard,
  IonCardContent,
  IonIcon,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { pieChart, book } from 'ionicons/icons';

const MainMenu: React.FC = () => {
  const history = useHistory();

  const handleTechniqueSelect = (technique: string) => {
    history.push(`/technique/${technique}`); // ej: /technique/pomodoro
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonText>
          <h1 style={{ textAlign: 'center' }}>Selecciona tu Técnica</h1>
        </IonText>

        <IonGrid>
          <IonRow class="ion-justify-content-center ion-padding-top">
            <IonCol size="12" size-md="6">
              <IonCard button onClick={() => handleTechniqueSelect('pomodoro')}>
                <IonCardContent className="ion-text-center">
                  <span role="img" aria-label="Pomodoro" style={{ fontSize: '48px' }}>🍅</span>
                  <h2>Pomodoro Clásico</h2>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" size-md="6">
              <IonCard button onClick={() => handleTechniqueSelect('flowtime')}>
                <IonCardContent className="ion-text-center">
                  <span role="img" aria-label="Flowtime" style={{ fontSize: '48px' }}>🍌</span>
                  <h2>Flowtime</h2>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          <IonRow class="ion-justify-content-around ion-padding">
            <IonButton fill="outline" onClick={() => history.push('/collections')}>
              <IonIcon icon={book} slot="start" />
              Colecciones
            </IonButton>
            <IonButton fill="outline" onClick={() => history.push('/stats')}>
              <IonIcon icon={pieChart} slot="start" />
              Estadísticas
            </IonButton>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default MainMenu;
