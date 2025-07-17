import { IonCard, IonCardHeader, IonCardTitle, IonText } from '@ionic/react';

interface CollectionCardProps {
  name: string;
  unlocked: number;
  total: number;
  onClick: () => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ name, unlocked, total, onClick }) => (
  <IonCard button onClick={onClick}>
    <IonCardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <IonCardTitle>{name}</IonCardTitle>
      <IonText color="medium" style={{ marginLeft: '8px', fontWeight: 'bold' }}>
        {unlocked}/{total}
      </IonText>
    </IonCardHeader>
  </IonCard>
);

export default CollectionCard;