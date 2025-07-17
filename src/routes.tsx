import { Route, Redirect } from 'react-router-dom';
import WelcomeScreen from './pages/WelcomeScreen';
import MainMenu from './pages/MainMenu';
import CollectionsPage from './pages/CollectionsPage';
import Stats from './pages/Stats';
import PomodoroSetup from './pages/PomodoroSetup';
import PomodoroTimer from './pages/PomodoroTimer';

const routes = [
  <Route path="/welcome" component={WelcomeScreen} exact />,
  <Route path="/mainmenu" component={MainMenu} exact />,
  <Route path="/collections" component={CollectionsPage} exact />,
  <Route path="/stats" component={Stats} exact />,
  <Route path="/technique/pomodoro" component={PomodoroSetup} exact />,
  <Route path="/timer" component={PomodoroTimer} exact />,
  // Agrega aquí más técnicas o páginas
  <Redirect exact from="/" to="/mainmenu" />,
];

export default routes;