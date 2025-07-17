import { IonPage, IonContent, IonText } from '@ionic/react';
import { Tip } from '../models/Tip';
import { getRarityBorderClass, getRarityLabel, getRarityColor } from '../utils/tips';

import '../theme/variables.css';

interface TipCardProps {
  tip: Tip;
  locked?: boolean;
  handleTap?: () => void;
}

const TipCard: React.FC<TipCardProps> = ({ tip, locked = false, handleTap }) => (
  <IonPage>
    <IonContent fullscreen className="tip-screen">
      <div
        className={`tip-container ${getRarityBorderClass(tip.rarity)}`}
        onClick={handleTap}
      >
        <IonText className="tip-text">
          {locked ? (
            <span className={`tip-collection ${getRarityColor(tip.rarity)}`}>
              {getRarityLabel(tip.rarity)}
            </span>
          ) : (
            <>
              <p>“{tip.description}”</p>
              <span className={`tip-collection ${getRarityColor(tip.rarity)}`}>
                {getRarityLabel(tip.rarity)} - {tip.collection}
              </span>
            </>
          )}
        </IonText>
      </div>
    </IonContent>
  </IonPage>
);

export default TipCard;