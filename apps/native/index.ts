
// MUST be first import: sets up RNGestureHandler native bindings before other React Native code
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
