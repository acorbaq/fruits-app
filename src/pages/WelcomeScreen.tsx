import {
  IonPage,
  IonContent,
  IonText,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { Preferences } from '@capacitor/preferences';

import { getLocalIsoDate } from '../utils/date';
import { getRarityColor, getRarityLabel, getRarityBorderClass } from '../utils/tips';

import { Tip, Rarity } from '../models/Tip';
import { TipService } from '../services/TipService';

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

const rarityWeights: Record<Rarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  super_rare: 4,
  epic: 1,
};

// Utiliza TipService y utils para la lógica y presentación
async function getWeightedRandomTip(): Promise<Tip> {
  // Verifica si todas las frases están desbloqueadas
  const handledIds = await getHandledTipIds();
  if (handledIds.length === tipService.getAllTips().length) {
    const allTips = tipService.getAllTips();
    const randomIndex = Math.floor(Math.random() * allTips.length);
    return allTips[randomIndex];
  }

  // Filtra las frases no manejadas
  const availableTips = tipService.getAllTips().filter(tip => !handledIds.includes(tip.id));

  if (availableTips.length === 0) {
    const allTips = tipService.getAllTips();
    const randomIndex = Math.floor(Math.random() * allTips.length);
    return allTips[randomIndex];
  }

  // Aplica pesos a las frases disponibles
  const weightedTips: Tip[] = [];
  availableTips.forEach(tip => {
    const weight = rarityWeights[tip.rarity] || 1;
    for (let i = 0; i < weight; i++) {
      weightedTips.push(tip);
    }
  });

  // 40% de probabilidad de mostrar una frase de una colección desbloqueada
  if (Math.random() < 0.4) {
    const unlockedCollections = await getUnlockedCollections();
    const completedCollections = await getCompletedCollections();
    const eligibleCollections = unlockedCollections.filter(
      col => !completedCollections.includes(col)
    );
    if (eligibleCollections.length > 0) {
      const randomCollection =
        eligibleCollections[Math.floor(Math.random() * eligibleCollections.length)];
      const collectionTips = weightedTips.filter(
        tip => tip.collection === randomCollection
      );
      if (collectionTips.length > 0) {
        const randomIndex = Math.floor(Math.random() * collectionTips.length);
        return collectionTips[randomIndex];
      }
    }
  }

  const randomIndex = Math.floor(Math.random() * weightedTips.length);
  return weightedTips[randomIndex];
}

// --- Funciones de Preferences (puedes moverlas a TipService si lo prefieres) ---
async function saveHandledTipId(tipId: string) {
  const { value } = await Preferences.get({ key: 'handled_tip_id' });
  let ids: string[] = [];
  if (value) {
    try {
      ids = JSON.parse(value);
    } catch {
      ids = [];
    }
  }
  if (!ids.includes(tipId)) {
    ids.push(tipId);
    await Preferences.set({
      key: 'handled_tip_id',
      value: JSON.stringify(ids),
    });
  }
}

async function getHandledTipIds(): Promise<string[]> {
  const { value } = await Preferences.get({ key: 'handled_tip_id' });
  if (value) {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return [];
}

async function saveUnlockedCollection(collection: string) {
  const { value } = await Preferences.get({ key: 'unlocked_collections' });
  let collections: string[] = [];
  if (value) {
    try {
      collections = JSON.parse(value);
    } catch {
      collections = [];
    }
  }
  const handledIds = await getHandledTipIds();
  if (handledIds.length - 1 === collections.length) {
    collections.push(collection);
    await Preferences.set({
      key: 'unlocked_collections',
      value: JSON.stringify(collections),
    });
  }
}

async function getUnlockedCollections(): Promise<string[]> {
  const { value } = await Preferences.get({ key: 'unlocked_collections' });
  if (value) {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return [];
}

async function isColleticonComplete(collection: string): Promise<boolean> {
  const unlockedCollections = await getUnlockedCollections();
  const count = unlockedCollections.filter(col => col === collection).length;
  const totalTipsInCollection = tipService.getAllTips().filter(tip => tip.collection === collection).length;
  return count === totalTipsInCollection;
}

async function saveCompletedCollection(collection: string) {
  const isComplete = await isColleticonComplete(collection);
  if (!isComplete) return;

  const { value } = await Preferences.get({ key: 'completed_collections' });
  let collections: string[] = [];
  if (value) {
    try {
      collections = JSON.parse(value);
    } catch {
      collections = [];
    }
  }
  if (!collections.includes(collection)) {
    collections.push(collection);
    await Preferences.set({
      key: 'completed_collections',
      value: JSON.stringify(collections),
    });
  }
}

async function getCompletedCollections(): Promise<string[]> {
  const { value } = await Preferences.get({ key: 'completed_collections' });
  if (value) {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return [];
}

async function unlockTip(tip: Tip) {
  await saveHandledTipId(tip.id);
  await saveUnlockedCollection(tip.collection ?? '');
  await saveCompletedCollection(tip.collection ?? '');
  tipService.unlockTip(tip.id);
}

// --- Componente principal ---
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
      const selectedTip = await getWeightedRandomTip();
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

  const handleTap = () => {
    Preferences.set({
      key: 'last_seen_date',
      value: getLocalIsoDate(),
    });
    if (tip) {
      unlockTip(tip);
    }
    setExpired(true);
    window.location.replace('/mainmenu');
  };

  return tip && !expired ? (
    <IonPage>
      <IonContent fullscreen className="tip-screen">
        <div className={`tip-container ${getRarityBorderClass(tip.rarity)}`} onClick={handleTap}>
          <IonText className="tip-text">
            <p>“{tip.description}”</p>
            <span className={`tip-collection ${getRarityColor(tip.rarity)}`}>
              {tip.collection}
            </span>
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