import React, { Component } from 'react';
import { Text,Alert, View,ScrollView,SafeAreaView,StyleSheet,Image,Modal,BackHandler,Platform,TouchableWithoutFeedback,ActivityIndicator,PermissionsAndroid,Animated } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { Card, ListItem,Header, Button,SearchBar,ButtonGroup,Avatar } from 'react-native-elements'
import MapView, { Marker,PROVIDER_GOOGLE,Polygon,Polyline,Callout,Animated as AnimatedMap,AnimatedRegion } from 'react-native-maps';

import Icon from 'react-native-vector-icons/FontAwesome5';
import Filter from './Filter';
import Carousel from 'react-native-snap-carousel';
import { sliderWidth, itemWidth } from '../styles/SliderEntry.style';
import slideStyle, { colors } from '../styles/index.style';
import SliderEntry from '../component/SliderEntry';
import shallowCompare from 'react-addons-shallow-compare';
import '../global.js';
import isEqual from 'lodash.isequal'
import AndroidOpenSettings from 'react-native-android-open-settings'

const severe_title = global.severe_title;
const scootet_status = global.scootet_status;
var t = 0;
let home_timer = null;
export default class MapScreen extends React.Component {
    constructor () {
      super()
      this.state = {
        selectedIndex: null,
        nearScooter:null,
        setCenter:{latitude: 22.622673,longitude: 120.300267,latitudeDelta:0.005,longitudeDelta: 0.005},
        scooter:[],
        clickMarker:false,
        avatar:global.avatar,
        selectMarker:null,
        work_area:'',
        all_work_area:[],
        load_data:false,
        modalVisible:false,
        search:"",
        changed:false,
        tracksViewChanges: true,
        first_loadMarker:true,
        MyPosition:null,
        search_loading:false,
        highAccuracy:true,
        OldLocation:null,
        no_change_center:false,
        marginBottom:1,
        show_user_location:false
      }
      this.updateIndex = this.updateIndex.bind(this);
      this.setModalVisible=this.setModalVisible.bind(this);
      this.CloseCard=this.CloseCard.bind(this);
      this.onClear=this.onClear.bind(this);
      this._renderDarkItem=this._renderDarkItem.bind(this);
      this.reload_all_scooter=this.reload_all_scooter.bind(this);
      this.fetch_scooters=this.fetch_scooters.bind(this);
      this.filter_scooter=this.filter_scooter.bind(this);
      this.updateSearch=this.updateSearch.bind(this);
      this.stopRendering=this.stopRendering.bind(this);
      this.startRendering=this.startRendering.bind(this);
      this.onBackClicked = this._onBackClicked.bind(this);
      this.send2Map=this.send2Map.bind(this);
      this.getPosition=this.getPosition.bind(this);
      this.chk_location_permission=this.chk_location_permission.bind(this);
      this.update_user_location=this.update_user_location.bind(this);
      this.change_center=this.change_center.bind(this);
      this._onMapReady=this._onMapReady.bind(this);
      this.after_reload_scooter=this.after_reload_scooter.bind(this);
    }
    componentWillMount() {
        this.setState({scooter:global.scooter,condition:global.condition});
        
        this.setState({ 
          all_work_area:global.all_work_area,
          geofence:global.geofence,
          set_polygon:true
        });
        
    }
    componentDidMount() {
      this.chk_location_permission();

    }
    async chk_location_permission(){
      if(Platform.OS == 'android'){
            const permissions = [
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]
            const granteds = await PermissionsAndroid.requestMultiple(permissions);
            if (granteds["android.permission.ACCESS_FINE_LOCATION"] === "granted") {
             this.getPosition();
            } else {
              Alert.alert('⚠️ 定位失敗',"定位權限被禁止",[{text: 'OK'}]);
            }
      }
    }
    onRefilter = (e) => {
      this.modalFilter = e
    }
    change_center(){
      this.setState({no_change_center:true});
    }
    _onMapReady(){
      this.setState({marginBottom: 0});
    }
    setStorage = async (scooter) => {
        try {
          await AsyncStorage.multiSet([
            ['@FoOps:scooters', JSON.stringify(scooter)],
            ['@FoOps:last_get_time',scooter[0].last_get_time]
          ]);
        } catch (error) {
          console.warn(error);
        }
    }
    update_user_location(event){
      const positionData = event.nativeEvent.coordinate;
      var location = positionData.latitude+","+positionData.longitude;
      if(this.state.OldLocation == null){
        this.setState({OldLocation:location});
        this.setState({setCenter:{latitude:positionData.latitude,longitude:positionData.longitude,latitudeDelta: 0.01,longitudeDelta: 0.01}});
      }
    }

    _onBackClicked(){
      return true;
    } 

    
    getPosition(){
     
      const GeoLowAccuracy = () => {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (locLowAccuracy)=>{
              this.setState({highAccuracy:false});
              resolve(locLowAccuracy)
            },
            (error)=>{
              reject(error)
            },
            {enableHighAccuracy: false, timeout: 2000}
          )
        });
      };

        GeoLowAccuracy().then(locationData => {
            const positionData: any = locationData.coords;
            this.setState({MyPosition:positionData});
            this.setState({show_user_location:true});
            this.setState({setCenter:{latitude:positionData.latitude,longitude:positionData.longitude,latitudeDelta: 0.01,longitudeDelta: 0.01}});
        })
        .catch(error => Alert.alert('⚠️ 定位失敗',"無法取得您所在位置，請開啟定位服務",[{text: '不要！'},{text: '去設定', onPress: () => AndroidOpenSettings.locationSourceSettings()}]));
      

    }
    


    pad(number){ return (number < 10 ? '0' : '') + number }
    dateFormat(date){
      var format_date = new Date(date);
      var create_date = this.pad(format_date.getMonth()+1)+'/'+this.pad(format_date.getDate())+' '+this.pad(format_date.getHours())+':'+this.pad(format_date.getMinutes());
      return create_date;
    }
    updateIndex (selectedIndex) {
        if(selectedIndex == 0){
          global.page = "Map"; 
          this.setModalVisible(true);
          // this.CloseCard();
        }else{
            if(selectedIndex == 1){
                global.page = "Home"; 
                this.props.navigation.state.params.doSomething();
                this.props.navigation.navigate("Home",{
                    send2Map: this.send2Map,
                });
            }
            this.setState({selectedIndex});
        }
    }
    updateSearch = search => {
      global.search = search;
      var promise1 = new Promise((resolve,reject)=>{this.setState({search:search,toSearch:true,search_loading:true});resolve(0);});
      promise1.then(value=>new Promise((resolve,reject)=>{this.filter_scooter_by_search();}));
    }
    onClear(){
      global.search = "";
      // this.setState({toSearch:false,search_loading:true,scooter:global.scooter});
    }
    show_location(coordinate){
        console.warn(coordinate);
    }
    reload_all_scooter(){
        this.setState({load_data:true});
        // fetch(global.API+'/tools/clear_cache_key/all_scooter',{
        //     method: 'GET',
        //     credentials: 'include'
        // }).then((response) => {
          this.fetch_scooters();
        // });
    }
    fetch_scooters(){
        var result = []
        fetch(global.API+'/scooter',{
          method: 'GET',
          credentials: 'include'
        })
        .then((response) => {
            if(response.status == 200){
              return response.json();
            }else{
              this.props.navigation.navigate('TimeOut');
            }
        })
        .then((json) => {
          if(json.data.length == 0){
            this.props.navigation.navigate('TimeOut');
          }else{
             global.scooters = json.data;
            // global.scooter = json.data;
            global.last_get_time =  json.data[0]['last_get_time'];
            this.setStorage(json.data);
            this.after_reload_scooter(json.data);
          }
        });
    }
    after_reload_scooter(data){
      console.warn(data);
      // 使用 promise 進行異步控制
      var runFunctions = new Promise(function (resolve, reject) {
       
        this.modalFilter.after_reload_scooter();
        resolve(0);
      }.bind(this));
      runFunctions
      .then(()=>{
          this.setState({load_data:false},()=>{this.filter_scooter_by_search()});  
      });
    }
    get_status_type(type){
        var result = "";
        var scooter_color = ['#c2c0c2','#8cb162','#4a90e2','#d63246'];
        scootet_status.map(function(m,i){
            if(m.type == type){
                result = <Text style={{color:scooter_color[i]}} key={i}>{m.title}</Text>;
            }
        })
        return result;
    }
    get_severe_lvl(severe,output){
        var result = "";
        var color=['#FF3333','#ff5722','#f5a623','#7ed321'];

        if(output == "text"){
            result = severe_title[severe-1];
        }else{
            result = <Text style={{color:color[severe-1]}}>{severe_title[severe-1]}</Text>;
        }

        return result;
    }
    getConditions(id){
        var result = "";
        var condition = this.state.condition;
        condition.map(function(m, i){
            if(parseInt(m.id) == parseInt(id)){
                var description = m.description;
                if(m.name.indexOf('(option)') != -1){
                    description = m.description + "_option";
                }
              
                result = description;
            }
        });
        return result;
    }
    GetDistance = ( lat1,  lng1,  lat2,  lng2)=>{
      var radLat1 = lat1*Math.PI / 180.0;
      var radLat2 = lat2*Math.PI / 180.0;
      var a = radLat1 - radLat2;
      var  b = lng1*Math.PI / 180.0 - lng2*Math.PI / 180.0;
      var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
      Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
      s = s *6378.137 ;// EARTH_RADIUS;
      s = Math.round(s * 10000) / 10000;
      return s;
    }
    get_status_type(type){
        var result = "";
        var scooter_color = ['#c2c0c2','#8cb162','#4a90e2','#d63246'];
        scootet_status.map(function(m,i){
            if(m.type == type){
                result = <Text style={{color:scooter_color[i]}} key={i}>{m.title}</Text>;
            }
        })
        return result;
    }
    get_severe_lvl(severe,output){
        var result = "";
        var color=['#FF3333','#ff5722','#f5a623','#7ed321'];

        if(output == "text"){
            result = severe_title[severe-1];
        }else{
            result = <Text style={{color:color[severe-1]}}>{severe_title[severe-1]}</Text>;
        }

        return result;
    }
    getConditions(id){
        var result = "";
        this.state.condition.map(function(m, i){
            if(parseInt(m.id) == parseInt(id)){
              var description = m.description;
              result = description;
            }
        });
        return result;
    }

    CloseCard(){
      this.setState({clickMarker:false,selectMarker:null});
    }

    filter_scooter_by_search(){
      if(this.state.search != undefined){
          var result = [];
          
          global.scooter.map(function(m, i){
            var plate = m.plate.toUpperCase();
            if(plate.indexOf(this.state.search.toUpperCase()) != -1){
              result.push(m);
            }
              
          }.bind(this));
          if(result.length > 0){
            let r = {
                latitude: parseFloat(result[0].location.lat),
                longitude: parseFloat(result[0].location.lng),
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };
            this.setState({setCenter:r});
          }
          this.setState({ scooter:result,search_loading:false });
      }else{
          this.setState({ toSearch:false });
          this.setState({ search_loading:false,scooter:global.scooter });
      }
    }
    _renderDarkItem ({item, index}) {
        global.page = 'Map';
        return <SliderEntry data={item} even={true} CloseCard={this.CloseCard} navigation={this.props.navigation} sid={item.id}/>;
    }
    
    filter_scooter(scooter){
      global.scooter = scooter;
      this.setState({scooter:scooter});
    }
    setModalVisible(visible) {
        // if(global.page=="Map"){
        //     this.updateIndex (1);
        // }
        this.setState({modalVisible: visible});
    }
    stopRendering = () =>
    {
        this.setState({ tracksViewChanges: false });
    }
    startRendering = () =>
    {
        this.setState({ tracksViewChanges: true });
    }
    send2Map(){
        var promise1 = new Promise((resolve,reject)=>{
          setTimeout(()=>{resolve(0);},100);
        });
        promise1.then(value=>new Promise((resolve,reject)=>{this.setState({search:global.search},()=>this.filter_scooter_by_search())}));
      
    }
    openDetail(id){
      this.props.navigation.navigate('ScooterDetail',{scooter:id,screen:'Map'});
      if(this.props.navigation.state.params != undefined && this.props.navigation.state.params.newScooter != undefined){
          this.props.navigation.state.params.newScooter(id);
      }
    }
    render() {
        const {selectedIndex,toSearch,clickMarker,scooter,geofence,changed,show_user_location} = this.state;
        // var scooter = [];
        var search = global.search;
        var set_polygon = this.state.set_polygon;
        

        const component1 = () => <View style={{flexDirection: 'row',justifyContent: "center", alignItems: "center"}}><Icon name="filter" style={{marginRight:10}} /><Text>篩選</Text></View>
        const component2 = () => <View style={{flexDirection: 'row',justifyContent: "center", alignItems: "center"}}><Icon name="list" style={{marginRight:10}} /><Text>列表</Text></View>
        const buttons = [{ element: component1 }, { element: component2 }]

        
        mapStyle = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#6195a0"}]},{"featureType":"landscape","stylers":[{"color":"#e0dcdc"},{"visibility":"simplified"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels","stylers":[{"lightness":"60"},{"gamma":"1"},{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#e6f3d6"},{"visibility":"on"}]},{"featureType":"road","stylers":[{"saturation":-100},{"lightness":"65"}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#f4f4f4"},{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#f4f4f4"},{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#787878"}]},{"featureType":"road.highway","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#f4d2c5"},{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#f4d2c5"},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"labels.text","stylers":[{"color":"#4e4e4e"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"#fdfafa"}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"color":"#fdfafa"},{"visibility":"on"}]},{"featureType":"transit.station.rail","stylers":[{"visibility":"on"}]},{"featureType":"transit.station.rail","elementType":"labels.icon","stylers":[{"hue":"#1b00ff"},{"visibility":"on"}]},{"featureType":"transit.station.rail","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"transit.station.rail","elementType":"labels.text.stroke","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#eaf6f8"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#eaf6f8"}]}];

       

        var setPolyPath=[];
        if(set_polygon){
            var fence = [];
            if(geofence != undefined){
              geofence.map(function(value,index){
                  if(value.promotion > 0){
                    return;
                  }
                  fence[index] = [];
                  value.zone.map(function(v,i){
                    fence[index].push({latitude:parseFloat(v[1]),longitude: parseFloat(v[0])});
                  });
                  setPolyPath.push(fence[index]);
              });
            }
            var work_area_color1 = ['rgba(255,255,119,0.6)','rgba(204,238,255,0.6)','rgba(255,204,204,0.6)','rgba(204,204,255,0.6)','rgba(119,255,204,0.6)','rgba(238,119,0,0.6)'];
            var work_area_color2 = ['rgba(255,255,119,0.2)','rgba(204,238,255,0.2)','rgba(255,204,204,0.2)','rgba(204,204,255,0.2)','rgba(119,255,204,0.2)','rgba(238,119,0,0.2)'];
            var work_areas = this.state.all_work_area.map(function(value,index){
              // console.log(index);
              if(Array.isArray(value[0])){
                return value.map(function(m,i){
                    var setArea = [];
                    m.map(function(d,k){
                      setArea.push({latitude:parseFloat(d.lat),longitude:parseFloat(d.lng)});
                    });
                    return <MapView.Polygon
                      key={"polygon:Ary:"+index+":"+i}
                      coordinates = {setArea}
                      strokeColor = {work_area_color1[index]}
                      strokeWeight = {3}
                      fillColor = {work_area_color2[index]}
                    />
                });
              }else{
                var set_work_area = []
                value.map(function(m,i){
                  set_work_area.push({latitude:parseFloat(m.lat),longitude:parseFloat(m.lng)});
                });
                return <MapView.Polygon
                  key={"polygon::"+index}
                  coordinates = {set_work_area}
                  strokeColor = {work_area_color1[index]}
                  strokeWeight = {3}
                  fillColor = {work_area_color2[index]}
                />
              }


                
            });
            
            
            
        }


        var filter_option = {
            modalVisible:this.state.modalVisible,
            setModalVisible:this.setModalVisible,
            filter_scooter:this.filter_scooter
        }
        return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#ff5722'}}>
            <Header
              leftComponent={<Avatar rounded source={{uri:'https://gokube.com/images/logo.png'}} overlayContainerStyle={{backgroundColor:'transparent'}}  />}
              centerComponent={<SearchBar
                                showLoading={this.state.search_loading}
                                placeholder="搜尋..."
                                onChangeText={text => this.updateSearch(text)}
                                onClear={this.onClear}
                                value={search}
                                round
                                containerStyle={styles.search_container}
                                inputContainerStyle={styles.search_input}
                                inputStyle={styles.input}
                                lightTheme={true}
                                autoCorrect={false} 
                              />}
              rightComponent={<Avatar rounded source={{uri:this.state.avatar}} onPress={()=>this.props.navigation.toggleDrawer()} />}
              containerStyle={styles.header}
            />
              <Filter filter_option={filter_option} onRefilter={this.onRefilter}/>
              <ButtonGroup
                onPress={this.updateIndex}
                selectedIndex={selectedIndex}
                buttons={buttons}
                containerStyle={styles.btn_containerStyle}
                buttonStyle={styles.btn_buttonStyle}
                selectedButtonStyle={styles.btn_selectedButtonStyle}
              />
           
            
               <MapView
                 ref = {(ref)=>this.mapView=ref}
                 provider={PROVIDER_GOOGLE}
                 style={{flex: 1,width: '100%',height: '100%', marginBottom: this.state.marginBottom}}
                 customMapStyle={mapStyle}
                 mapType="standard"
                 region={this.state.setCenter}
                 showsMyLocationButton={true}
                 showsUserLocation={true}
                 showsCompass={true}
                 onMapReady={this._onMapReady}
                 onUserLocationChange={event => this.update_user_location(event)}
               >
               
                  <MapView.Polygon
                    coordinates={[{ latitude: -89, longitude: -179.99999999 },{ latitude: 0, longitude: -179.99999999 },{ latitude: 89, longitude: -179.99999999 },{ latitude: 89, longitude: 0 },{ latitude: 89, longitude: 179.99999999 },{ latitude: 0, longitude: 179.99999999 },{ latitude: -89, longitude: 179.99999999 },{ latitude: -89, longitude: 0 },{ latitude: -89, longitude: -179.99999999 }]}
                    strokeColor={'#ff0000'}
                    fillColor={'rgba(0,0,0,0.2)'}
                    strokeWidth={2}
                    holes={setPolyPath}
                  />
                {work_areas}
                {scooter.map(m => (
                  m.power > 30 ? (
                    <MapView.Marker key={"marker_"+m.id}   coordinate={{latitude:parseFloat(m.location.lat),longitude:parseFloat(m.location.lng),latitudeDelta: 0.01,longitudeDelta: 0.01}}
                    {...this.props} pinColor="green"   onPress={(e) => {e.stopPropagation();}} >
                        <Callout onPress={() => {global.page = "Map";this.openDetail(m.id); }}>
                          <View style={{padding:10}}>
                            <Text>{m.plate}</Text>
                            <Text>電量：{m.power}%</Text>
                            {(m.status == "MAINTAINCES") ? <Text style={{color:'#ccc'}}>🚫 Offline</Text> : <Text style={{color:'#00FF00'}}>📶 Online</Text>}
                          </View>
                        </Callout>
                    </MapView.Marker>
                  ):(
                    <MapView.Marker key={"marker_"+m.id}   coordinate={{latitude:parseFloat(m.location.lat),longitude:parseFloat(m.location.lng),latitudeDelta: 0.01,longitudeDelta: 0.01}}
                      {...this.props} pinColor="red"   onPress={(e) => {e.stopPropagation();}} >
                          <Callout onPress={() => {global.page = "Map";this.openDetail(m.id); }}>
                            <View style={{padding:10}}>
                              <Text>{m.plate}</Text>
                              <Text>電量：{m.power}%</Text>
                              {(m.status == "MAINTAINCES") ? <Text style={{color:'#ccc'}}>🚫 Offline</Text> : <Text style={{color:'#00FF00'}}>📶 Online</Text>}
                            </View>
                          </Callout>
                      </MapView.Marker>
                  )
                  
                ))}
                
               </MapView>
             <View>
               
             </View>

             <View style={styles.circle} >
               <TouchableWithoutFeedback onPress={()=>this.reload_all_scooter()}>
                { this.state.load_data ?(
                  <ActivityIndicator  color="#ffffff"  />
                  ):
                  (<Icon name="redo" size={20} color={'#ffffff'}/>)
                }
                  
               </TouchableWithoutFeedback>
             </View>

            

             <View style={{position:'absolute',left:0,bottom:0,width:'100%',padding:2,backgroundColor:'rgba(0,0,0,0.6)'}}>
                <View style={{flexDirection: 'column',justifyContent:'center',alignItems:'center'}}>
                  <Text style={{fontSize:11,color:'#fff'}}>最後更新時間：{global.last_get_time}</Text>
                </View>
             </View>
        </SafeAreaView>
         
        );
    }
}


const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    height: 400,
    width: 400,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  marker:{
    width:30,height:40
  },
  markerSelect:{
    width:40,height:53
  },
  search_container: {
    backgroundColor:'#ff5722',
    paddingTop:-50,
    
    borderWidth:0,
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent'
  },
  search_input: {
    width:'100%',
    marginTop:-10,
    backgroundColor:'#fff',
    borderWidth: 0,
    height:15,
    borderBottomLeftRadius:20,
    borderBottomRightRadius:20,
    borderTopLeftRadius:20,
    borderTopRightRadius:20
  },
  input:{
    fontSize:12,
    borderWidth: 0,
  },
  containerStyle:{
    margin:0,
    padding:0,

  },
  btn_containerStyle: {
      height: 40,
      width: '100%',
      // borderTopRightRadius: 20,
      borderWidth: 0,
      backgroundColor: '#fff',
      marginTop: 0,
      borderRadius: 0,
      paddingLeft:0,
      marginLeft:0,
      marginBottom:0,
      borderBottomWidth:1,
      borderBottomColor:'rgba(224, 224, 224,0.5)',
      shadowColor: '#ccc',
      shadowOffset: { width: 2, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 4,
  },
  btn_buttonStyle: {
      backgroundColor: '#fff',

      borderWidth: 0,
  },
  btn_selectedButtonStyle: {
      backgroundColor: '#fff'
  },
  circle:{
    position:'absolute',
    bottom:5,
    left:10,
    zIndex:10009,
    marginRight:10,
    alignItems:'center',
    justifyContent:'center',
    width: 50,
    height:50,
    backgroundColor:'#f76260',
    borderColor:'green',
    borderStyle:'solid',
    borderRadius:25,
    paddingBottom:2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,  
  },
  compass:{
    position:'absolute',
    bottom:5,
    right:5,
    zIndex:10009,
    alignItems:'center',
    justifyContent:'center',
    width: 50,
    height:50,
    backgroundColor:'#fff',
    borderColor:'#666',
    borderStyle:'solid',
    borderRadius:25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 4,  
  },
  header:{
      backgroundColor: '#ff5722',
      justifyContent: 'space-around',
      paddingTop:-25,
      height:50
  },
  markerWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(130,4,150, 0.9)",
  },
  ring: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(130,4,150, 0.3)",
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(130,4,150, 0.5)",
  },
});

