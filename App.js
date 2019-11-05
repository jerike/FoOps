import React from 'react';
import {createStackNavigator,createAppContainer,createDrawerNavigator,NavigationActions,DrawerItems,DrawerActions} from 'react-navigation';
import {Platform,View,Text,Image,ScrollView,Dimensions } from 'react-native';
import Login from './pages/Login';
import Home from './pages/Home';
import MapScreen from './pages/MapScreen';
import ScooterDetail from './pages/ScooterDetail';
import Logout from './pages/Logout';
import Dashboard from './pages/Dashboard';
import ViolationRecord from './pages/ViolationRecord';
import TimeOut from './pages/timeout';
import { Button} from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';

// console.disableYellowBox = true;
const { width, height } = Dimensions.get('screen');
class Hidden extends React.Component {
  render() {
    return null;
  }
}

const DrawerContent = (props) => (
  <View style={{flex:1}}>
    <View
      style={{
        backgroundColor: '#2f3345',
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image source={require('./img/gokube-logo.png')} style={{width:150,height:36}} />
    </View>
    <View style={{alignItems: 'center',justifyContent: 'center',}}>
      <DrawerItems {...props} />
    </View>
    <View style={{marginTop:20}}><Text>V1.22</Text></View>
    <View style={{position:'absolute',bottom:0,left:0,width:'100%'}}>
      <Button
        title="回收視窗"
        icon={<Icon
              name="arrow-right"
              size={15}
              color="white"
            />}
        iconRight
        containerStyle={{borderBottomLeftRadius:0}}
        buttonStyle={{backgroundColor:'#ff5722',borderRadius:0}}
        onPress={()=>props.navigation.dispatch(DrawerActions.closeDrawer())}
      />
    </View>

  </View>
)

const HomeStack=createStackNavigator(
  {
    Dashboard: {screen:Dashboard},
    ScooterDetail:{screen: ScooterDetail},
    ViolationRecord:{screen: ViolationRecord},
    TimeOut:{screen: TimeOut},

  },{
    headerMode:'none',
    defaultNavigationOptions: {
      gesturesEnabled: false 
    },
  }
);

const MenuScreen=createDrawerNavigator(
  {
    Home: {screen:Home,path:'app/home',navigationOptions: {drawerLabel: <Hidden />}},
    Map:{screen: MapScreen,navigationOptions: {drawerLabel: <Hidden />}},
    HomeStack:{screen:HomeStack,navigationOptions: {drawerLabel: <Hidden />}},
    Dashboard: {screen:Dashboard,navigationOptions: { title: '導航頁'}},
    Logout:{screen: Logout,navigationOptions: { title: '登 出'}}

  },{
    initialRouteName: 'Home',
    headerMode:'none',
    drawerPosition: 'right',
    drawerLabel:'Menu',
    contentComponent: DrawerContent,
    drawerWidth: Math.min(height, width) * 0.6,
  }
);



const App = createStackNavigator(
  {
    Login: {screen:Login},
    MenuScreen:{screen:MenuScreen}, 
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



