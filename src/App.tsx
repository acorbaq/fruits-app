import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useEffect, useState } from 'react';
import { Preferences } from '@capacitor/preferences';

import routes from './routes';
import { getLocalIsoDate } from './utils/date';

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

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

import './theme/variables.css';

const STORAGE_KEYS = {
  lastSeenDate: 'last_seen_date',
};

setupIonicReact();

const App: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    const checkIfSeenToday = async () => {
      const today = getLocalIsoDate();
      const { value: lastSeen } = await Preferences.get({ key: STORAGE_KEYS.lastSeenDate });

      if (lastSeen === today) {
        setShowWelcome(true);
      } else {
        setShowWelcome(false);
      }
    };

    checkIfSeenToday();
  }, []);

  if (showWelcome === null) return null;

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {routes}
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;
