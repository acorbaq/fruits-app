// src/pages/PomodoroTimer.tsx
import {
    IonPage,
    IonContent,
    IonText,
    IonButton,
} from '@ionic/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { getLocalIsoDate } from '../utils/date';
import {
  getPomodoroStats,
  savePomodoroStats,
  PomodoroStats,
} from '../utils/pomodoroStats';

type SessionType = 'work' | 'short_break' | 'long_break';

interface PomodoroSession {
    type: SessionType;
    duration: number; // minutos
}

interface Block {
    sessionType: SessionType;
    minuteIndex: number;
}

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
    const [currentWorkSessionTime, setCurrentWorkSessionTime] = useState(0); // en segundos
    const [currentWorkPausedTime, setCurrentWorkPausedTime] = useState(0);   // en segundos
    const [isPaused, setIsPaused] = useState(false);

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

    useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
            const newTime = prev - 1;
            if (currentSessionType === 'work' && !isPaused && newTime >= 0) {
                setCurrentWorkSessionTime((t) => t + 1);
            }
            return newTime;
        });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
}, [isRunning, currentSessionType, isPaused]);


    // Formatear tiempo mm:ss
    const formatTime = (seconds: number): string =>
        `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

    // Avanzar a la siguiente sesión
    const handleNext = useCallback(async () => {
        const currentSession = plan[currentIndex];
        const now = new Date();

        const stats = await getPomodoroStats();
        const today = getLocalIsoDate(now);
        

        if (currentSession.type === 'work') {
            stats.totalWorkTime += currentSession.duration * 60;
            stats.totalWorkSessions += 1;

            // Guardar sesión para promedio
            if (currentIndex === plan.length - 1) {
                stats.pomodoroSessions.push({
                    start: new Date(now.getTime() - (currentWorkSessionTime + currentWorkPausedTime) * 1000).toISOString(),
                    end: now.toISOString(),
                    duration: currentWorkSessionTime + currentWorkPausedTime, // en segundos
                });
                setCurrentWorkSessionTime(0);
                setCurrentWorkPausedTime(0);
            }

            // Racha de días productivos
            if (stats.lastSessionDate === today) {
                // Ya registrado hoy, nada
            } else {
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                const formattedYesterday = getLocalIsoDate(yesterday);
                stats.streak = (stats.lastSessionDate === formattedYesterday) ? stats.streak + 1 : 1;
                stats.lastSessionDate = today;
            }

        } else {
            stats.totalBreakTime += currentSession.duration * 60;
        }

        // Verificar ciclos completos
        const last8 = plan.slice(Math.max(0, currentIndex - 7), currentIndex + 1);
        const isFullCycle = last8.filter(s => s.type === 'work').length === 4 &&
                            last8.filter(s => s.type === 'short_break').length === 3 &&
                            last8.filter(s => s.type === 'long_break').length === 1;
        if (isFullCycle) stats.totalPomodoros += 1;

        await savePomodoroStats(stats);

        // Continuar con la sesión
        const nextIndex = currentIndex + 1;
        if (nextIndex >= plan.length) {
            // El timer ya está pausado por el useEffect
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
    const [pauseStart, setPauseStart] = useState<number | null>(null);

    const toggleTimer = async () => {
        if (isRunning && currentSessionType === 'work') {
            setPauseStart(Date.now());
            setIsPaused(true);
        } else if (!isRunning && currentSessionType === 'work' && pauseStart) {
            setCurrentWorkPausedTime((t) => t + Math.floor((Date.now() - pauseStart) / 1000));
            setPauseStart(null);
            setIsPaused(false);
        }
        setIsRunning((prev) => !prev);
};

    useEffect(() => {
        if (timeLeft === 0 && isRunning) {
            const isLastSession = currentIndex === plan.length - 1;
            if (isLastSession) {
                setIsRunning(false); // Pausar solo si es la última fase
            }
            handleNext(); // avanzar automáticamente
        }
    }, [timeLeft, isRunning, handleNext, currentIndex, plan.length]);

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
