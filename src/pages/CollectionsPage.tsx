import {
  IonPage,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonButton,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
} from '@ionic/react';

import { useEffect, useState } from 'react';
import { documentText } from 'ionicons/icons';

import { useHistory } from 'react-router-dom';

import tips from '../data/tips.json'; // Asegúrate de tener el archivo

import { Preferences } from '@capacitor/preferences';

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

function getRarityBorderClass(rarity: string) {
  return `border-${rarity}`;
}

async function getUnlockedTipIds(): Promise<string[]> {
  const { value } = await Preferences.get({ key: 'handled_tip_id' });
  return value ? JSON.parse(value) : [];
}


const CollectionsPage: React.FC = () => {
  const [collections, setCollections] = useState<
    Record<string, { unlocked: Tip[]; locked: Tip[] }>
  >({});
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const unlockedIds = await getUnlockedTipIds();
      const grouped: Record<string, { unlocked: Tip[]; locked: Tip[] }> = {};
      tips.forEach((tip) => {
        const isUnlocked = unlockedIds.includes(tip.id);
        if (!grouped[tip.collection]) {
          grouped[tip.collection] = { unlocked: [], locked: [] };
        }
        grouped[tip.collection][isUnlocked ? 'unlocked' : 'locked'].push(tip);
      });
      const filtered = Object.fromEntries(
        Object.entries(grouped)
          .filter(([, group]) => group.unlocked.length > 0)
          .sort(([a], [b]) => a.localeCompare(b))
      );
      setCollections(filtered);
    };
    loadData();
  }, []);

  const collectionNames = Object.keys(collections);
  const history = useHistory();

  return (
    <IonPage>
      <IonContent className="menu-main">
        <div className="technique-title">
        <IonText>
            <h1>Colecciones Desbloqueadas</h1>
        </IonText>
        </div>
        {!selectedCollection ? (
          <>
            <IonGrid>
              <IonRow>
                {collectionNames.map((name, idx) => (
                  <IonCol size="4" key={name}>
                    <IonCard button onClick={() => setSelectedCollection(name)}>
                        <IonCardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <IonCardTitle>{name}</IonCardTitle>
                            <IonText color="medium" style={{ marginLeft: '8px', fontWeight: 'bold' }}>
                                {collections[name].unlocked.length}/{collections[name].unlocked.length + collections[name].locked.length}
                            </IonText>
                        </IonCardHeader>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
            <IonButton fill="clear" expand="block" onClick={() => history.replace('/mainmenu')}>
                <IonText color="danger">Menú Principal</IonText>    
            </IonButton>
          </>
        ) : (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{selectedCollection}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  {[...collections[selectedCollection].unlocked, ...collections[selectedCollection].locked].map((tip, index) => (
                    <IonCol size="6" key={tip.id}>
                        <IonCard className={`tip-card ${getRarityBorderClass(tip.rarity)}`}>
                            <IonCardContent className="ion-text-center" style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                <IonIcon icon={documentText} size="large" color="light" />
                                {collections[selectedCollection].unlocked.includes(tip) ? (
                                    <>
                                        <IonText className="tip-text" style={{ display: 'block', margin: '8px 0' }}>“{tip.text}”</IonText>
                                        <IonText className="rarity-label">{tip.collection} - {index + 1}</IonText>
                                    </>
                                ) : (
                                    <div style={{ width: '100%' }}>
                                        <IonText className="locked-tip" style={{ display: 'block', margin: '8px 0', opacity: 0.5 }}>{tip.collection} - {index + 1}</IonText>
                                    </div>
                                )}
                            </IonCardContent>
                        </IonCard>
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>
              <IonButton fill="clear" expand="block" onClick={() => setSelectedCollection(null)}>
                <IonText color="primary">Volver</IonText>
              </IonButton>
              <IonButton fill="clear" expand="block" onClick={() => history.replace('/mainmenu')}>
                <IonText color="danger">Menú Principal</IonText>    
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default CollectionsPage;