import {
  IonPage,
  IonContent,
  IonText,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { Preferences } from '@capacitor/preferences';

import { getLocalIsoDate } from '../utils/date';
import { getRarityColor, getRarityLabel, getRarityBorderClass } from '../utils/tips';

import { Tip } from '../models/Tip';
import { TipService } from '../services/TipService';
import { TipManager } from '../services/TipManager';

import TipCard from '../components/TipCard';

import tipsData from '../data/tips.json';

// Inicializa los tips usando el modelo Tip
const initialTips: Tip[] = tipsData.map(tip => ({
  id: tip.id,
  title: tip.title ?? tip.text,
  description: tip.description ?? tip.text,
  rarity: tip.rarity,
  unlocked: false,
  collection: tip.collection,
}));

const tipService = new TipService(initialTips);
const tipManager = new TipManager(tipService);

const WelcomeScreen = () => {
  const [expired, setExpired] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    (async () => {
      const today = getLocalIsoDate();
      const { value } = await Preferences.get({ key: 'last_seen_date' });
      if (value === today) {
        setExpired(true);
        window.location.replace('/mainmenu');
        return;
      }
      const selectedTip = await tipManager.getWeightedRandomTip();
      setTip(selectedTip);

      const timer = setTimeout(() => {
        setExpired(true);
        Preferences.set({
          key: 'last_seen_date',
          value: today,
        });
        window.location.replace('/mainmenu');
      }, 6000);

      return () => clearTimeout(timer);
    })();
  }, []);

  const handleTap = async () => {
    Preferences.set({
      key: 'last_seen_date',
      value: getLocalIsoDate(),
    });
    if (tip) {
      await tipManager.unlockTip(tip);
    }
    setExpired(true);
    window.location.replace('/mainmenu');
  };

  return tip && !expired ? (
    <IonPage>
      <IonContent fullscreen className="tip-screen">
        <div onClick={handleTap}>
          <TipCard tip={tip} />
          <IonText className="tip-collection">
            {tip.collection}
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  ) : expired ? (
    <IonPage>
      <IonContent fullscreen className="tip-screen">
        <div className="tip-container">
          <IonText color="medium">
            <p>Redirigiendo...</p>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  ) : null;
};

export default WelcomeScreen;