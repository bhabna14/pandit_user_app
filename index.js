/**
 * @format
 */

import TrackPlayer from 'react-native-track-player';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import playerService from './src/Component/Service';

AppRegistry.registerComponent(appName, () => App);
TrackPlayer.registerPlaybackService(() => playerService);