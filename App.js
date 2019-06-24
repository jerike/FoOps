import React from 'react';
import {createStackNavigator,createAppContainer,createDrawerNavigator,NavigationActions} from 'react-navigation';
import {Platform } from 'react-native';
import Login from './pages/Login';
import Home from './pages/Home';
import MapScreen from './pages/MapScreen';
import ScooterDetail from './pages/ScooterDetail';
import Logout from './pages/Logout';

// console.disableYellowBox = true;
class Hidden extends React.Component {
  render() {
    return null;
  }
}

const HomeStack=createDrawerNavigator(
  {
    Home: {screen:Home,path:'app/home',navigationOptions: {drawerLabel: <Hidden />}},
    Map:{screen: MapScreen,navigationOptions: {drawerLabel: <Hidden />}},
    ScooterDetail:{screen: ScooterDetail,navigationOptions: {drawerLabel: <Hidden />}},
    Logout:{screen: Logout}
  },{
    drawerPosition: 'right',
    drawerLabel:'Menu',

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
      gesturesEnabled: false 
    },
    
  }
);



export default createAppContainer(App);



