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

const ALLOWED_MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const PomodoroSetup: React.FC = () => {
  const [hours, setHours] = useState<number>(1);
  const [minutes, setMinutes] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

  const handleStart = () => {
    if (minutes <= 0) {
      setError('Introduce una cantidad de tiempo válido.');
      return;
    }

    const totalWorkMinutes = hours * 60 + minutes;
    const workBlock = 25;
    const shortBreak = 5;
    let remainingWork = totalWorkMinutes;
    const sessions: { type: 'work' | 'short_break' | 'long_break'; duration: number }[] = [];
    let workCount = 0;

    while (remainingWork > 0) {
      const blockDuration = remainingWork >= workBlock ? workBlock : remainingWork;
      sessions.push({ type: 'work', duration: blockDuration });
      remainingWork -= blockDuration;
      workCount++;

      if (remainingWork > 0) {
        if (workCount % 4 === 0) {
          const longBreak = 15 + Math.floor(Math.random() * 4) * 5; // 15, 20, 25, 30
          sessions.push({ type: 'long_break', duration: longBreak });
        } else {
          sessions.push({ type: 'short_break', duration: shortBreak });
        }
      }
    }

    sessionStorage.setItem('pomodoro_plan', JSON.stringify(sessions));
    history.push('/timer');
  };

  const handleHoursChange = (e: CustomEvent) => {
    const val = Number(e.detail.value);
    setHours(val >= 0 ? val : 0);
  };

  const incrementMinutes = () => {
    let newMinutes = minutes + 25;
    let newHours = hours;

    if (newMinutes >= 60) {
      newHours += 1;
      newMinutes = newMinutes % 60;
    }

    setMinutes(newMinutes);
    setHours(newHours);
  };

  const decrementMinutes = () => {
    let newMinutes = minutes - 25;
    let newHours = hours;

    if (newMinutes < 0) {
      if (hours > 0) {
        newHours -= 1;
        newMinutes = 60 + newMinutes;
      } else {
        newMinutes = 0; // no puede bajar más
      }
    }

    setMinutes(newMinutes);
    setHours(newHours);
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
                value={hours}
                onIonChange={handleHoursChange}
              />
              </div>
                <div className="time-input">
                  <IonLabel position="stacked">Minutos</IonLabel>
                  <IonInput
                    value={minutes}
                    onIonChange={e => {
                      const val = Number((e as CustomEvent).detail.value);
                      setMinutes(val >= 0 && val <= 59 ? val : 0);
                    }}
                    className="custom-minute-input"
                  />
                </div>
                <div className="minute-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '8px' }}>
                  <IonButton size="small" onClick={incrementMinutes}>+25</IonButton>
                  <IonButton size="small" onClick={decrementMinutes}>-25</IonButton>
                </div>
            </div>

          {error && (
            <IonText color="danger">
              <p>{error}</p>
            </IonText>
          )}

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
