import React from 'react';
import {createStackNavigator,createMaterialTopTabNavigator,createAppContainer,createDrawerNavigator} from 'react-navigation';

import Login from './pages/Login';
import Home from './pages/Home';
import MapScreen from './pages/MapScreen';
 
const App = createDrawerNavigator(
  {
    Login: {screen:Login},
    Home: {screen:Home,path:'app/home'},
    Map:{screen: MapScreen}
    
  },
  {
    initialRouteName : 'Login',
    headerMode:'none',
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: '#f4511e',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
  }
);

export default createAppContainer(App);