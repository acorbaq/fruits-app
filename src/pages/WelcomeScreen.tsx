// src/pages/WelcomeScreen.tsx
import {
  IonPage,
  IonContent,
  IonText,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { Preferences } from '@capacitor/preferences';
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

function getWeightedRandomTip(tips: Tip[]): Tip {
  const weightedTips: Tip[] = [];
  tips.forEach(tip => {
    const weight = rarityWeights[tip.rarity] || 1;
    for (let i = 0; i < weight; i++) {
      weightedTips.push(tip);
    }
  });
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

export async function unlockTip(tip: Tip) {
  await saveHandledTipId(tip.id);
  await saveUnlockedCollection(tip.collection);
  await saveCompletedCollection(tip.collection);
}

const WelcomeScreen = () => {
  const [expired, setExpired] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    const selectedTip = getWeightedRandomTip(tips);
    setTip(selectedTip);

    const timer = setTimeout(() => {
      console.log('⏳ Tiempo agotado, ir a la siguiente pantalla...');
      setExpired(true);
      // Asignar fecha de hoy como última vista capacitor/preferences STORAGE_KEYS.lastSeenDate 
      Preferences.set({
        key: 'last_seen_date',
        value: new Date().toISOString().slice(0, 10), // Formato YYYY-MM-DD
      });
      // Redirigir a la pantalla de inicio
      window.location.replace('/home');
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const handleTap = () => {
    console.log('✅ Frase desbloqueada por el usuario');
    // al hacer tap cambiamos de pantalla a home
    // Asignar fecha de hoy como última vista capacitor/preferences STORAGE_KEYS.lastSeenDate 
    Preferences.set({
      key: 'last_seen_date',
      value: new Date().toISOString().slice(0, 10), // Formato YYYY-MM-DD
    });
    // Guardar el ID de la frase manejada
    if (tip) {
      unlockTip(tip);
    }
    setExpired(true);
    window.location.replace('/home');
    // Aquí luego guardaremos y navegaremos
  };

  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen>
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '20px',
          }}
        >
          {!expired ? (
            tip && (
              <>
                <IonText
                  color="dark"
                  style={{ fontSize: '24px', cursor: 'pointer' }}
                  onClick={handleTap}
                >
                  <p>“{tip.text}”</p>
                  <span
                    style={{
                      display: 'block',
                      marginTop: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: 'var(--ion-color-' + getRarityColor(tip.rarity) + ')',
                    }}
                  >
                    {tip.collection}
                  </span>
                </IonText>
              </>
            )
          ) : (
            <IonText color="medium">
              <p>Redirigiendo...</p>
            </IonText>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default WelcomeScreen;
