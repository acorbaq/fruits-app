import { IonCard, IonCardContent, IonText } from '@ionic/react';
import { Tip } from '../models/Tip';
import { getRarityBorderClass, getRarityLabel } from '../utils/tips';

interface TipCardProps {
  tip: Tip;
  locked?: boolean;
}

const TipCard: React.FC<TipCardProps> = ({ tip, locked = false }) => (
  <IonCard className={`tip-card ${getRarityBorderClass(tip.rarity)}`}>
    <IonCardContent className="ion-text-center">
      {locked ? (
        <IonText className="locked-tip">{getRarityLabel(tip.rarity)}</IonText>
      ) : (
        <>
          <IonText className="tip-text">“{tip.description}”</IonText>
          <IonText className="rarity-label">{getRarityLabel(tip.rarity)}</IonText>
        </>
      )}
    </IonCardContent>
  </IonCard>
);

export default TipCard;