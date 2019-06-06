import React from 'react';
import {createStackNavigator,createMaterialTopTabNavigator,createAppContainer,createDrawerNavigator} from 'react-navigation';

import Login from './pages/Login';
import Home from './pages/Home';

const API = "http://localhost:8000";
 
const App = createStackNavigator(
  {
    Login: {screen:Login,params: { API: API }},
    Home: {screen:Home,params: { API: API }},
    
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