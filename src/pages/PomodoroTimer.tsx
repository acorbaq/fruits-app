// src/pages/PomodoroTimer.tsx
import {
    IonPage,
    IonContent,
    IonText,
    IonButton,
} from '@ionic/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

type SessionType = 'work' | 'short_break' | 'long_break';

interface PomodoroSession {
    type: SessionType;
    duration: number; // minutos
}

interface Block {
    sessionType: SessionType;
    minuteIndex: number;
}

const DURATIONS: Record<SessionType, number> = {
    work: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
};

const LABELS: Record<SessionType, string> = {
    work: 'Trabajo',
    short_break: 'Descanso corto',
    long_break: 'Descanso largo',
};

const PomodoroTimer: React.FC = () => {
    const history = useHistory();
    const [plan, setPlan] = useState<PomodoroSession[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const [progressBlocks, setProgressBlocks] = useState<Block[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const currentSessionType = plan[currentIndex]?.type;

    // Cargar plan desde sessionStorage
    useEffect(() => {
        const raw = sessionStorage.getItem('pomodoro_plan');
        if (raw) {
            try {
                const parsed: PomodoroSession[] = JSON.parse(raw);
                setPlan(parsed);
                setTimeLeft(parsed[0]?.duration ? parsed[0].duration * 60 : 0);
            } catch {
                history.replace('/mainmenu');
            }
        } else {
            history.replace('/mainmenu');
        }
    }, [history]);

    // Actualizar tiempo y progreso
    useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
        const newTime = prev - 1;

        // Mover esta lógica fuera para evitar doble render (ver siguiente paso)
        return newTime;
        });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
    }, [isRunning]);

    const previousMinuteRef = useRef<number>(-1);

    useEffect(() => {
    if (timeLeft > 0 && timeLeft % 60 === 0) {
        const currentMinute = Math.floor(timeLeft / 60);

        // Solo registrar si el minuto actual es diferente al último registrado
        if (previousMinuteRef.current !== currentMinute) {
        previousMinuteRef.current = currentMinute;

        setProgressBlocks((blocks) => [
            ...blocks,
            {
            sessionType: currentSessionType!,
            minuteIndex: blocks.length + 1,
            },
        ]);
        }
    }
    }, [timeLeft, currentSessionType]);


    // Formatear tiempo mm:ss
    const formatTime = (seconds: number): string =>
        `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

    // Avanzar a la siguiente sesión
    const handleNext = useCallback(() => {

        const nextIndex = currentIndex + 1;
        if (nextIndex >= plan.length) {
            alert('🎉 ¡Plan Pomodoro completado!');
            history.replace('/mainmenu');
            return;
        }

        previousMinuteRef.current = -1; // resetear el contador de minuto
        setCurrentIndex(nextIndex);
        setTimeLeft(plan[nextIndex].duration * 60);
        setIsRunning(true);
    }, [currentIndex, plan, history]);

    // Pausar/iniciar timer
    const toggleTimer = () => setIsRunning((prev) => !prev);

    if (!plan.length) return null;

    return (
        <IonPage>
            <IonContent fullscreen className="pomodoro-timer-screen">
                <div className="timer-container">
                    <IonText className="session-label">
                        <h2>{LABELS[currentSessionType!]}</h2>
                    </IonText>

                    <IonText className="timer-display">
                        <h1>{formatTime(timeLeft)}</h1>
                    </IonText>

                    <div className="timer-controls">
                        <IonButton fill="clear" className="control-button" onClick={toggleTimer}>
                            {isRunning ? 'Pausar' : 'Iniciar'}
                        </IonButton>
                        <IonButton fill="clear" className="control-button secondary" onClick={handleNext}>
                            Siguiente
                        </IonButton>
                    </div>

                    <div className="progress-bar">
                        {progressBlocks.map((block, idx) => (
                            <div
                                key={idx}
                                className={`progress-block ${block.sessionType}`}
                                title={`${LABELS[block.sessionType]} - minuto ${block.minuteIndex}`}
                            />
                        ))}
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default PomodoroTimer;
