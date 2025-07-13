// src/pages/WelcomeScreen.tsx
import {
  IonPage,
  IonContent,
  IonText,
} from '@ionic/react';
import { useEffect, useState } from 'react';
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

const WelcomeScreen = () => {
  const [expired, setExpired] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    const selectedTip = getWeightedRandomTip(tips);
    setTip(selectedTip);

    const timer = setTimeout(() => {
      console.log('⏳ Tiempo agotado, ir a la siguiente pantalla...');
      setExpired(true);
      // Aquí luego usaremos router.push("/home")
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const handleTap = () => {
    console.log('✅ Frase desbloqueada por el usuario');
    setExpired(true);
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
                    {getRarityLabel(tip.rarity)}
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
