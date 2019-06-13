import React from 'react';
import {createStackNavigator,createMaterialTopTabNavigator,createAppContainer,createDrawerNavigator} from 'react-navigation';

import Login from './pages/Login';
import Home from './pages/Home';

 
const App = createStackNavigator(
  {
    Login: {screen:Login},
    Home: {screen:Home},
    
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