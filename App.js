import React from 'react';
import {createStackNavigator,createAppContainer,createDrawerNavigator,NavigationActions} from 'react-navigation';
import {Platform,View,Text,Image } from 'react-native';
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
class RightMenu extends React.Component {
  render() {
    return(
      <View style={{width:'100%',height:'100%',backgroundColor:'#2f3345'}}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' ,backgroundColor:'#2f3345' }}>
          <Image source={require('./img/gokube-logo.png')} style={{marginBottom:30}} />
        </View>
        <Text>test</Text>
      </View>
    )
  }
}

const HomeStack=createDrawerNavigator(
  {
    Home: {screen:Home,path:'app/home',navigationOptions: {drawerLabel: <Hidden />}},
    Map:{screen: MapScreen,navigationOptions: {drawerLabel: <Hidden />}},
    ScooterDetail:{screen: ScooterDetail,navigationOptions: {drawerLabel: <Hidden />}},
    Logout:{screen: Logout,navigationOptions: {drawerLabel: <RightMenu />}}
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



