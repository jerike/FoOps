import React from 'react';
import {createStackNavigator,createAppContainer,createDrawerNavigator,NavigationActions} from 'react-navigation';

import Login from './pages/Login';
import Home from './pages/Home';
import MapScreen from './pages/MapScreen';
import ScooterDetail from './pages/ScooterDetail';

const HomeStack=createDrawerNavigator(
  {
    Home: {screen:Home,path:'app/home'},
    Map:{screen: MapScreen}
  }
);

const App = createStackNavigator(
  {
    Login: {screen:Login},
    HomeStack:{screen:HomeStack}, 
    
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



