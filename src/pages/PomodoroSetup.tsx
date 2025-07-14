// src/pages/PomodoroSetup.tsx
import {
  IonPage,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonText,
} from '@ionic/react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';

const PomodoroSetup: React.FC = () => {
  const [hours, setHours] = useState<number | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

  const handleStart = () => {
    if (!hours || hours <= 0) {
      setError('Introduce una cantidad válida de horas.');
      return;
    }

    // Calcular número de ciclos posibles
    const totalMinutes = hours * 60 + (minutes || 0);
    const blockMinutes = 25 + 5; // cada bloque Pomodoro ocupa 30 minutos
    const fullCycles = Math.floor(totalMinutes / blockMinutes);
    const sessions: ('work' | 'short_break' | 'long_break')[] = [];

    for (let i = 0; i < fullCycles; i++) {
      sessions.push('work');
      if ((i + 1) % 4 === 0) {
        sessions.push('long_break');
      } else {
        sessions.push('short_break');
      }
    }

    // Guardar configuración en Preferences o pasarlo por router
    sessionStorage.setItem('pomodoro_plan', JSON.stringify(sessions));
    history.push('/timer');
  };

  return (
    <IonPage>
      <IonContent fullscreen className="pomodoro-setup-screen">
        <div className="setup-container">
          <IonText className="setup-title">
            <h1>Pomodoro Clásico</h1>
          </IonText>

          <IonText className="setup-description">
            <p>
              Establece el <strong>tiempo total de trabajo</strong> que deseas realizar hoy. El temporizador dividirá automáticamente este tiempo en sesiones de Pomodoro.
            </p>
          </IonText>

          <div className="time-inputs">
            <div className="time-input">
              <IonLabel position="stacked">Horas</IonLabel>
              <IonInput
                type="number"
                inputmode="numeric"
                min="0"
                value={hours ?? 1}
                onIonChange={(e) => {
                  const val = Number(e.detail.value);
                  setHours(val >= 0 ? val : 0);
                }}
              />
            </div>
            <div className="time-input">
              <IonLabel position="stacked">Minutos</IonLabel>
              <IonInput
              type="number"
              inputmode="numeric"
              step="15"
              value={minutes ?? 0}
              onIonChange={(e) => {
                let val = Number(e.detail.value);
                let newHours = hours ?? 1;
                if (val > 45) {
                val = 0;
                newHours += 1;
                } else if (val < 0) {
                val = 45;
                newHours = Math.max(0, newHours - 1);
                }
                // Solo actualizar si el valor está dentro de los límites permitidos
                if (val === 0 || val === 15 || val === 30 || val === 45) {
                setMinutes(val);
                setHours(newHours);
                }
              }}
              />
            </div>
          </div>

          {error && <IonText color="danger"><p>{error}</p></IonText>}

          <IonButton expand="block" onClick={handleStart} className="start-button">
            Iniciar Pomodoro
          </IonButton>

          <IonButton fill="clear" expand="block" onClick={() => history.replace('/mainmenu')}>
              <IonText color="danger">Menú Principal</IonText>    
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PomodoroSetup;
