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
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { pieChart, book } from 'ionicons/icons';
import { isLastSeenToday } from '../utils/preferences';

const MainMenu: React.FC = () => {
  const history = useHistory();

  useEffect(() => {
    const checkLastSeen = async () => {
      if (!(await isLastSeenToday())) {
        history.replace('/welcome');
      }
    };
    checkLastSeen();
  }, [history]);

  const handleTechniqueSelect = (technique: string) => {
    history.replace(`/technique/${technique}`);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="main-menu">
        <div className="technique-title">
          <IonText>
            <h1>Selecciona tu Técnica</h1>
          </IonText>
        </div>

        <IonGrid>
          <IonRow class="ion-justify-content-center">
            {[
              { name: 'Pomodoro Clásico', emoji: '🍅', key: 'pomodoro' },
              { name: 'Flowtime', emoji: '🍌', key: 'flowtime' },
              // Agrega más técnicas aquí
            ].map((technique) => (
              <IonCol size="6" size-md="4" key={technique.key}>
                <div className="technique-card" onClick={() => handleTechniqueSelect(technique.key)}>
                  <span className="technique-emoji">{technique.emoji}</span>
                  <span className="technique-name">{technique.name}</span>
                </div>
              </IonCol>
            ))}
          </IonRow>

          <IonRow class="ion-justify-content-around ion-padding-top">
            <IonCol size="auto">
              <IonButton fill="clear" className="menu-button" onClick={() => history.replace('/collections')}>
                <IonIcon icon={book} slot="start" />
                Colecciones
              </IonButton>
            </IonCol>
            <IonCol size="auto">
              <IonButton fill="clear" className="menu-button" onClick={() => history.replace('/stats')}>
                <IonIcon icon={pieChart} slot="start" />
                Estadísticas
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default MainMenu;