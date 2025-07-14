// src/pages/WelcomeScreen.tsx
import {
  IonPage,
  IonContent,
  IonText,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { Preferences } from '@capacitor/preferences';

import { getLocalIsoDate } from '../utils/date';

import tips from '../data/tips.json'; // Asegúrate de tener un archivo JSON con las frases

type Rarity = 'common' | 'uncommon' | 'rare' | 'super_rare' | 'epic';

type Tip = {
  id: string;
  text: string;
  collection: string;
  rarity: Rarity;
};

const getRarityColor = (rarity: Rarity): string => {
  switch (rarity) {
    case 'common':
      return 'medium';
    case 'uncommon':
      return 'success';
    case 'rare':
      return 'primary';
    case 'super_rare':
      return 'tertiary';
    case 'epic':
      return 'warning'; // puedes personalizar un color especial en theme/variables.css
    default:
      return 'medium';
  }
};

const getRarityLabel = (rarity: Rarity): string => {
  switch (rarity) {
    case 'common':
      return 'Común';
    case 'uncommon':
      return 'Poco común';
    case 'rare':
      return 'Raro';
    case 'super_rare':
      return 'Súper raro';
    case 'epic':
      return 'Épico';
    default:
      return '';
  }
};

const rarityWeights: Record<Rarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  super_rare: 4,
  epic: 1,
};

async function getWeightedRandomTip(tips: Tip[]): Promise<Tip> {
  // Verifica si todas las frases están desbloqueadas
  const allUnlocked = await areAllTipsUnlocked();
  console.log('Todas las frases desbloqueadas:', allUnlocked);
  if (allUnlocked) {
    // Si todas las frases están desbloqueadas, muestra una aleatoria sin peso
    const randomIndex = Math.floor(Math.random() * tips.length);
    return tips[randomIndex];
  }

  // Obtiene los IDs de frases ya desbloqueadas
  const handledIds = await getHandledTipIds();
  console.log('IDs de frases desbloqueadas:', handledIds);
  // Filtra las frases no manejadas
  const availableTips = tips.filter(tip => !handledIds.includes(tip.id));
  console.log('Frases disponibles:', availableTips.length);

  // Si no hay frases disponibles, muestra una aleatoria de todas
  if (availableTips.length === 0) {
    const randomIndex = Math.floor(Math.random() * tips.length);
    return tips[randomIndex];
  }

  // Aplica pesos a las frases disponibles
  const weightedTips: Tip[] = [];
  availableTips.forEach(tip => {
    const weight = rarityWeights[tip.rarity] || 1;
    for (let i = 0; i < weight; i++) {
      weightedTips.push(tip);
    }
  });
  console.log('Frases con peso:', weightedTips.length);

  // 40% de probabilidad de mostrar una frase de una colección desbloqueada
  if (Math.random() < 0.4) {
    const unlockedCollections = await getUnlockedCollections();
    const completedCollections = await getCompletedCollections();
    console.log('Colecciones desbloqueadas:', unlockedCollections);
    console.log('Colecciones completadas:', completedCollections);
    // Filtra colecciones desbloqueadas pero no completadas
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

  // Si no se cumple la condición anterior, muestra una frase aleatoria por peso
  const randomIndex = Math.floor(Math.random() * weightedTips.length);
  return weightedTips[randomIndex];
}

// Funcion para guardar el ID de la frase mostrada en capcitor/preferences
async function saveHandledTipId(tipId: string) {
  // Obtener el array actual de IDs guardados
  const { value } = await Preferences.get({ key: 'handled_tip_id' });
  let ids: string[] = [];
  if (value) {
    try {
      ids = JSON.parse(value);
    } catch {
      ids = [];
    }
  }
  // Agregar el nuevo ID si no existe
  if (!ids.includes(tipId)) {
    ids.push(tipId);
    await Preferences.set({
      key: 'handled_tip_id',
      value: JSON.stringify(ids),
    });
  }
}

// Función para obetener un array de IDs de frases manejadas
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

// Verificar si se han desbloquedo todas las frases
async function areAllTipsUnlocked(): Promise<boolean> {
  const handledIds = await getHandledTipIds();
  return handledIds.length === tips.length;
}

// Funcion para guardar la colección desbloqueada
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

// Función para obtener las colecciones desbloqueadas
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

// Función para comprobar si la frase que vamos a incluir completa la colección
async function isColleticonComplete(collection: string): Promise<boolean> {
  const unlockedCollections = await getUnlockedCollections();
  // mostrar log de las colecciones desbloqueadas
  console.log('Colecciones desbloqueadas:', unlockedCollections);
  // contamos cuantas veces aparece la colección en el array de colecciones desbloqueadas
  const count = unlockedCollections.filter(col => col === collection).length;
  // si el número de veces que aparece es igual al número de frases de esa colección,
  // entonces la colección está completa
  const totalTipsInCollection = tips.filter(tip => tip.collection === collection).length;
  return count === totalTipsInCollection;
}

// fucnión para guardar una coleccion completada
async function saveCompletedCollection(collection: string) {
  // Verifica si la colección está realmente completa antes de guardarla
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

// Funcion para obtener las colecciones completadas
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

export async function unlockTip(tip: Tip) {
  await saveHandledTipId(tip.id);
  await saveUnlockedCollection(tip.collection);
  await saveCompletedCollection(tip.collection);
}

const WelcomeScreen = () => {
  const [expired, setExpired] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    // Antes de mostrar nada si last_seen_date es hoy nos movemos a home
    (async () => {
      const today = getLocalIsoDate();
      const { value } = await Preferences.get({ key: 'last_seen_date' });
      if (value === today) {
        console.log('Ya se vio hoy, redirigiendo a home...');
        setExpired(true);
        window.location.replace('/mainmenu'); // Redirigir a la pantalla de inicio
        return; // Detener el resto del efecto
      }
      // El resto del código se ejecuta solo si no se ha visto hoy
      const fetchTip = async () => {
      const selectedTip = await getWeightedRandomTip(tips);
      setTip(selectedTip);
      console.log('Frase seleccionada:', selectedTip);
      };
      fetchTip();

      const timer = setTimeout(() => {
      console.log('⏳ Tiempo agotado, ir a la siguiente pantalla...');
      setExpired(true);
      Preferences.set({
        key: 'last_seen_date',
        value: today,
      });
      window.location.replace('/mainmenu');
      }, 6000);

      return () => clearTimeout(timer);
    })();
    const fetchTip = async () => {
      const selectedTip = await getWeightedRandomTip(tips);
      setTip(selectedTip);
      console.log('Frase seleccionada:', selectedTip);
    };
    fetchTip();

    const timer = setTimeout(() => {
      console.log('⏳ Tiempo agotado, ir a la siguiente pantalla...');
      setExpired(true);
      // Asignar fecha de hoy como última vista capacitor/preferences STORAGE_KEYS.lastSeenDate 
      Preferences.set({
        key: 'last_seen_date',
        value: getLocalIsoDate(), // Formato YYYY-MM-DD
      });
      // Redirigir a la pantalla de inicio
      window.location.replace('/mainmenu');
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const handleTap = () => {
    console.log('✅ Frase desbloqueada por el usuario');
    // al hacer tap cambiamos de pantalla a home
    // Asignar fecha de hoy como última vista capacitor/preferences STORAGE_KEYS.lastSeenDate 
    Preferences.set({
      key: 'last_seen_date',
      value: getLocalIsoDate(), // Formato YYYY-MM-DD
    });
    // Guardar el ID de la frase manejada
    if (tip) {
      unlockTip(tip);
    }
    setExpired(true);
    window.location.replace('/mainmenu'); // Redirigir a la pantalla de inicio
    // Aquí luego guardaremos y navegaremos
  };

  return tip && !expired ? (
  <IonPage>
    <IonContent fullscreen className="tip-screen">
      <div className="tip-container" onClick={handleTap}>
        <IonText className="tip-text">
          <p>“{tip.text}”</p>
          <span className={`tip-collection ${tip.rarity}`}>{tip.collection}</span>
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
}

export default WelcomeScreen;
