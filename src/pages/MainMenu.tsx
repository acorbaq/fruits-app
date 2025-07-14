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
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { pieChart, book } from 'ionicons/icons';

import { Preferences } from '@capacitor/preferences';

// Verificar si la fecha last_seen_date es de hoy
const STORAGE_KEYS = {
  lastSeenDate: 'last_seen_date',
};
const isToday = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const { value: lastSeen } = await Preferences.get({ key: STORAGE_KEYS.lastSeenDate });
  return lastSeen === today;
}




const MainMenu: React.FC = () => {
  const history = useHistory();
  // Si la fecha guardada no es de hoy regresa a la pantalla de bienvenida
    useEffect(() => {
        const checkLastSeen = async () => {
        if (!(await isToday())) {
            history.replace('/welcome');
        }
        };
        checkLastSeen();
    }, [history]);

  const handleTechniqueSelect = (technique: string) => {
    history.push(`/technique/${technique}`); // ej: /technique/pomodoro
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
