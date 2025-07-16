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

import { getRarityBorderClass } from '../utils/tips';
import { Tip } from '../models/Tip';
import { TipService } from '../services/TipService';
import { TipManager } from '../services/TipManager';

import tipsData from '../data/tips.json';

// Inicializa servicios
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

const CollectionsPage: React.FC = () => {
  const [collections, setCollections] = useState<Record<string, { unlocked: Tip[]; locked: Tip[] }>>({});
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const history = useHistory();

  useEffect(() => {
    const loadData = async () => {
      const grouped = await tipManager.getCollectionsGrouped();
      setCollections(grouped);
    };
    loadData();
  }, []);

  const collectionNames = Object.keys(collections);

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
                              <IonText className="tip-text" style={{ display: 'block', margin: '8px 0' }}>“{tip.description}”</IonText>
                              <IonText className="rarity-label">Frase - {index + 1}</IonText>
                            </>
                          ) : (
                            <div style={{ width: '100%' }}>
                              <IonText className="locked-tip" style={{ display: 'block', margin: '8px 0', opacity: 0.5 }}>Frase - {index + 1}</IonText>
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