import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import { useEffect, useState } from 'react';
import { Preferences } from '@capacitor/preferences';

import Home from './pages/Home';
import MainMenu from './pages/MainMenu';
import WelcomeScreen from './pages/WelcomeScreen';
import CollectionsPage from './pages/CollectionsPage';
import PomodoroSetup from './pages/PomodoroSetup';
import PomodoroTimer from './pages/PomodoroTimer';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

const STORAGE_KEYS = {
  lastSeenDate: 'last_seen_date',
  handledTipId: 'handled_tip_id',
  unlockedCollections: 'unlocked_collections',
  completedCollections: 'completed_collections',
};
//await Preferences.clear(); // Limpiar preferencias al iniciar

setupIonicReact();

const App: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    const checkIfSeenToday = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { value: lastSeen } = await Preferences.get({ key: STORAGE_KEYS.lastSeenDate });

      if (lastSeen === today) {
        setShowWelcome(true); // Ya lo vio hoy
      } else {
        setShowWelcome(false); // Mostrar pantalla de bienvenida
      }
    };

    checkIfSeenToday();
  }, []);

  if (showWelcome === null) return null; // puedes mostrar un IonLoading mientras carga

  return (
    <IonApp>
      <IonReactRouter>
      <IonRouterOutlet>
        <Route path="/welcome" component={WelcomeScreen} exact />
        <Route path="/mainmenu" component={MainMenu} exact />
        <Route path="/collections" component={CollectionsPage} exact />
        <Route path="/technique/pomodoro" component={PomodoroSetup} exact />
        <Route path="/timer" component={PomodoroTimer} exact />
        <Redirect exact from="/" to={showWelcome ? "/welcome" : "/mainmenu"} />
      </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
