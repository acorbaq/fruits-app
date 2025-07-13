import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonText, IonButton, IonGrid, IonRow, IonCol, } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';

const Home = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pomodoro App</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding" color="light">
        <div style={{ textAlign: 'center', marginTop: '10vh' }}>
          <IonText color="dark" style={{ fontSize: '64px' }}>
            <p>25:00</p>
          </IonText>
          <IonGrid>
            <IonRow class="ion-justify-content-center ion-padding-top">
              <IonCol size="auto">
                <IonButton color="primary">Iniciar</IonButton>
              </IonCol>
              <IonCol size="auto">
                <IonButton color="medium">Pausar</IonButton>
              </IonCol>
              <IonCol size="auto">
                <IonButton color="danger">Reiniciar</IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
