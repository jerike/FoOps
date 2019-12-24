import React from 'react';
import {createStackNavigator,createAppContainer,createBottomTabNavigator,createDrawerNavigator,NavigationActions,DrawerItems,DrawerActions} from 'react-navigation';
import {Platform,View,Text,Image,ScrollView,Dimensions } from 'react-native';
import Login from './pages/Login';
import Home from './pages/Home';
import MapScreen from './pages/MapScreen';
import ScooterDetail from './pages/ScooterDetail';
import Logout from './pages/Logout';
import Dashboard from './pages/Dashboard';
import ChargingBattery from './pages/ChargingBattery';
import MoveScooter from './pages/MoveScooter';
import ViolationRecord from './pages/ViolationRecord';
import TimeOut from './pages/timeout';
import { Button} from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome5';
import DeviceInfo from 'react-native-device-info';
import WorkRecord from './pages/WorkRecord';
import MoveRecord from './pages/MoveRecord';
import TirePump from './pages/TirePump';
import TireRecord from './pages/TireRecord';

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
    <View style={{marginTop:20}}><Text style={{textAlign:'center'}}>V {DeviceInfo.getVersion()}</Text></View>
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

const TabNavigator = createBottomTabNavigator({
  WorkRecord: { screen: WorkRecord,navigationOptions: { title: '車輛換電'} },
  MoveRecord: { screen: MoveRecord,navigationOptions: { title: '違規移車'} },
  TireRecord: { screen: TireRecord,navigationOptions: { title: '胎壓紀錄'} },
},
{
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;
        switch(routeName){
          case "WorkRecord":
            iconName = `charging-station`;
          break;
          case "MoveRecord":
            iconName = `route`;
          break;
          case "TireRecord":
            iconName = `wind`;
          break;
        }
        // You can return any component that you like here!
        return <Icon name={iconName} size={25} color={tintColor} />;
      },
    }),
    tabBarOptions: {
      activeTintColor: 'tomato',
      inactiveTintColor: 'gray',
    },
});

const HomeStack=createStackNavigator(
  {
    Dashboard: {screen:Dashboard},
    ScooterDetail:{screen: ScooterDetail},
    ViolationRecord:{screen: ViolationRecord},
    TimeOut:{screen: TimeOut},
    ChargingBattery:{screen:ChargingBattery},
    MoveScooter:{screen:MoveScooter},
    TirePump:{screen:TirePump},
    BrokenTrack:{screen:BrokenTrack},
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
    TabNavigator:{screen:TabNavigator,navigationOptions: { title: '工作記錄'}},
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



