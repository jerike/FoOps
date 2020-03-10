import React, { Component } from 'react';
import { Text,Alert, View,ScrollView,SafeAreaView,StyleSheet,Image,Modal,BackHandler,Platform,TouchableWithoutFeedback,ActivityIndicator,PermissionsAndroid,Animated,Linking } from 'react-native';
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
import ActionSheet from 'react-native-action-sheet';
import Direction from './Direction'

const severe_title = global.severe_title;
const scootet_status = global.scootet_status;
const IconR = <Icon name="map-marker-alt" size={40} color={'#f00'} style={{shadowColor: '#000',shadowOffset: {width: 2, height: 2},shadowOpacity: 0.8,shadowRadius: 2}}/>;
const IconW = <Icon name="map-marker-alt" size={40} color={'#fff'} style={{shadowColor: '#000',shadowOffset: {width: 2, height: 2},shadowOpacity: 0.8,shadowRadius: 2}}/>;
const IconO = <Icon name="map-marker-alt" size={40} color={'#FF5511'} style={{shadowColor: '#000',shadowOffset: {width: 2, height: 2},shadowOpacity: 0.8,shadowRadius: 2}}/>;
const IconG = <Icon name="map-marker-alt" size={40} color={'#008800'} style={{shadowColor: '#000',shadowOffset: {width: 2, height: 2},shadowOpacity: 0.8,shadowRadius: 2}}/>;
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
        show_loading:false,
        highAccuracy:true,
        OldLocation:null,
        no_change_center:false,
        marginBottom:1,
        show_user_location:false,
        geofence:[],
        select_scooter:{},
        direction_modal:false
      }
      this.updateIndex = this.updateIndex.bind(this);
      this.setModalVisible=this.setModalVisible.bind(this);
      this.onClear=this.onClear.bind(this);
      this.showModal=this.showModal.bind(this);
      this.onClose=this.onClose.bind(this);
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
      this.get_work_area=this.get_work_area.bind(this);
      this.get_geofence=this.get_geofence.bind(this);
    }
    componentWillMount() {
        this.setState({
          condition:global.condition,
          show_loading:true,
          set_polygon:true,
          show_msg:'車輛佈點中...'
        });
        
        
    }
    componentDidMount() {
      this.chk_location_permission();
      this.get_work_area();
      this.get_geofence();
    }
    get_work_area = () =>{
        //取得工作區域
        fetch(global.API+'/scooter/get_all_work_zone',{
          method: 'GET',
          credentials: 'include'
        })
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            if(json.code == 1){
              this.setState({all_work_area:json.data});
            }
        });
    }
    get_geofence =()=>{
        //取得電子柵欄
        fetch(global.API+'/tools/get_geofence',{
           method: 'GET',
           credentials: 'include'
        })
        .then((response) => response.json())
        .then((json)=> {
          this.setState({geofence:json.data});
        });
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
        switch(global.outsource){
          case 2:
            var scooter_url = global.API+'/scooter/outsource?team=2';
          break;
          case 3:
            var scooter_url = global.API+'/scooter/outsource?team=3';
          break;
          default:
            var scooter_url = global.API+'/scooter';
          break;
        }
        fetch(scooter_url,{
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
          var data = [];
          var last_get_time = "";
          if(json.data.length > 0){
            data = json.data;
            last_get_time = json.data[0]['last_get_time'];
          } 
          global.scooters = data;
          // global.scooter = json.data;
          global.last_get_time =  last_get_time;
          this.setStorage(data);
          this.after_reload_scooter(data);
        });
    }
    after_reload_scooter(data){
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
      }
      // else{
      //     this.setState({ toSearch:false });
      //     this.setState({ search_loading:false,scooter:global.scooter });
      // }
    }

    filter_scooter(scooter){
      global.scooter = scooter;
      this.setState({scooter:scooter,show_loading:false});
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
    showController(scooter){
      var BUTTONS = [
        '📋 瀏覽車輛資料',
        '🔊 響鈴',
        '🔓 啟動',
        '🔒 熄火',
        '📍 導航',
        '❌ 取消',
      ];

      var DESTRUCTIVE_INDEX = parseInt(BUTTONS.length) - 2;
      var CANCEL_INDEX = parseInt(BUTTONS.length) - 1;
      ActionSheet.showActionSheetWithOptions({
        title:'車輛控制項',
        message:'目前只提供 4G 網路操作，無法提供藍芽選項',
        options: BUTTONS,
        cancelButtonIndex: CANCEL_INDEX,
        destructiveButtonIndex: DESTRUCTIVE_INDEX,
        tintColor: '#ff5722',
      },
      (buttonIndex) => {
        switch(buttonIndex){
          case 0:
            this.openDetail(scooter.id);
          break;
          case 1:
            this.controller(scooter.id,'whistle');
          break;
          case 2:
            this.controller(scooter.id,'unlock');
          break;
          case 3:
            this.controller(scooter.id,'lock');
          break;
          case 4:
            this.setState({select_scooter:scooter},()=>{this.showDirection()});
          break;
        }
      });
    }



    controller(id,type){
      this.setState({show_loading:true,show_msg:'系統處理中...'});
      var formData  = new FormData();    
      formData.append("value", type);  
      formData.append("operator", global.user_givenName);
      formData.append("from", "FoOps");
      var request_option = '/scooter/'+id+'/type';
      var method = "PUT";
      fetch(global.API+request_option,{
      // fetch(global.ServiceAPI+request_option,{
        method: method,
        credentials: 'include',
        body: formData
      })
      .then((response) => {
          if(response.status == 401){
            this.props.navigation.navigate('TimeOut');
          }else{
            var msg = "";
            switch(type){
              case "unlock":
                msg = "車輛已啟動";
              break;
              case "lock":
                msg = "車輛已熄火";
              break;
              case "trunk":
                msg = "車廂已開啟";
              break;
              case "whistle":
                msg = "喇叭已響起";
              break;
            }
            setTimeout(
              ()=>{
                this.setState({show_loading:false});
                Alert.alert('🛵 車輛訊息',msg,[{text: '好的！'}]);
              }
            ,3000);
          }
      });
    }

    openDetail(id){
      global.page = "Map";
      this.props.navigation.navigate('ScooterDetail',{scooter:id,screen:'Map'});
      if(this.props.navigation.state.params != undefined && this.props.navigation.state.params.newScooter != undefined){
          this.props.navigation.state.params.newScooter(id);
      }
    }
    chg_location(){
      this.setState({setCenter:{latitude: 22.622673,longitude: 120.300267,latitudeDelta:0.005,longitudeDelta: 0.005}});
    }
    showDirection(){
      const latLng = `${this.state.select_scooter.location.lat},${this.state.select_scooter.location.lng}`;
      url = "geo:0,0?q="+latLng;
      Linking.openURL(url).catch((err) => console.error('找不到 google map App', err));
    }
    showModal(key){
        this.setState({
          [key]: true,
        });
    }
    onClose(key){
        this.setState({
          [key]: false,
        });
    }
    render() {
        const {selectedIndex,toSearch,clickMarker,scooter,geofence,changed,show_user_location,show_loading,all_work_area,show_msg} = this.state;
        // var scooter = [];
        var search = global.search;
        var set_polygon = this.state.set_polygon;
        

        const component1 = () => <View style={{flexDirection: 'row',justifyContent: "center", alignItems: "center"}}><Icon name="filter" style={{marginRight:10}} /><Text>篩選</Text></View>
        const component2 = () => <View style={{flexDirection: 'row',justifyContent: "center", alignItems: "center"}}><Icon name="list" style={{marginRight:10}} /><Text>列表</Text></View>
        const buttons = [{ element: component1 }, { element: component2 }]
        const direction_option={
          onClose:this.onClose,
          direction_modal:this.state.direction_modal,
          scooter:this.state.select_scooter,
        }
        
        mapStyle = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#6195a0"}]},{"featureType":"landscape","stylers":[{"color":"#e0dcdc"},{"visibility":"simplified"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels","stylers":[{"lightness":"60"},{"gamma":"1"},{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#e6f3d6"},{"visibility":"on"}]},{"featureType":"road","stylers":[{"saturation":-100},{"lightness":"65"}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#f4f4f4"},{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#f4f4f4"},{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#787878"}]},{"featureType":"road.highway","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#f4d2c5"},{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#f4d2c5"},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"labels.text","stylers":[{"color":"#4e4e4e"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"#fdfafa"}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"color":"#fdfafa"},{"visibility":"on"}]},{"featureType":"transit.station.rail","stylers":[{"visibility":"on"}]},{"featureType":"transit.station.rail","elementType":"labels.icon","stylers":[{"hue":"#1b00ff"},{"visibility":"on"}]},{"featureType":"transit.station.rail","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"transit.station.rail","elementType":"labels.text.stroke","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#eaf6f8"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#eaf6f8"}]}];

       

        var setPolyPath=[];
        if(set_polygon){
            if(geofence != undefined){
              var fence = [];
              geofence.map(function(value,index){
                  if(value.promotion > 0){
                    return;
                  }
                  fence[index] = [];
                  value.zone.map(function(v,i){
                    fence[index].push({latitude:parseFloat(v[1]),longitude: parseFloat(v[0])});
                  });
                  if(fence[index].length > 0){
                    setPolyPath.push(fence[index]);
                  }
              });
            }
            var work_areas = [];
            var work_area_color1 = ['rgba(255,255,119,0.6)','rgba(204,238,255,0.6)','rgba(255,204,204,0.6)','rgba(204,204,255,0.6)','rgba(119,255,204,0.6)','rgba(238,119,0,0.6)'];
            var work_area_color2 = ['rgba(255,255,119,0.2)','rgba(204,238,255,0.2)','rgba(255,204,204,0.2)','rgba(204,204,255,0.2)','rgba(119,255,204,0.2)','rgba(238,119,0,0.2)'];
            work_areas = all_work_area.map(function(value,index){
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
        console.warn(setPolyPath);

        var filter_option = {
            modalVisible:this.state.modalVisible,
            setModalVisible:this.setModalVisible,
            filter_scooter:this.filter_scooter
        }
        var scooterG = [];
        var scooterW = [];
        var scooterO = [];
        var scooterR = [];
        scooter.map(function(m,i){
            if(m.status == "RIDING"){
              scooterG.push(m);
            }
            else if(m.status == "MAINTENANCE"){
              scooterW.push(m);
            }
            else{
              scooterO.push(m);
            }
            
        });
        var count = scooter.length;
        return (
        <SafeAreaView style={{flex: 1,justifyContent:'center', backgroundColor: '#ff5722'}}>
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
              <Direction direction_option={direction_option} />
              <ButtonGroup
                onPress={this.updateIndex}
                selectedIndex={selectedIndex}
                buttons={buttons}
                containerStyle={styles.btn_containerStyle}
                buttonStyle={styles.btn_buttonStyle}
                selectedButtonStyle={styles.btn_selectedButtonStyle}
              />
              {show_loading &&(
                <View style={styles.loading}>
                  <ActivityIndicator size="small" color="#ffffff" style={{marginRight:5}} />
                  <Text style={{color:'#fff'}}>{show_msg}</Text>
                </View>
              )}
              <View style={styles.dokodemo_door}>
                    <Button
                      icon={
                        <Icon
                          name="door-open"
                          size={15}
                          color="white"
                        />
                      }
                      onPress={()=>this.chg_location()}
                    />
                </View>
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
                 tracksViewChanges={false}
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
                {scooterG.map(m => (
                    <MapView.Marker key={"marker_"+m.id} tracksViewChanges={false}   coordinate={{latitude:parseFloat(m.location.lat),longitude:parseFloat(m.location.lng),latitudeDelta: 0.01,longitudeDelta: 0.01}}
                    {...this.props}  pinColor="green"   onPress={(e) => {e.stopPropagation();}} >
                        <Callout onPress={() => {this.showController(m); }}>
                          <View style={{padding:10,width:120}}>
                            <Text>{m.plate}</Text>
                            <Text>電量：{m.power}%</Text>
                            <Text style={{color:'#227700'}}>使用中</Text>
                          </View>
                        </Callout>
                    </MapView.Marker>
                ))}
                {scooterO.map(m => (
                    <MapView.Marker key={"marker_"+m.id} tracksViewChanges={false}   coordinate={{latitude:parseFloat(m.location.lat),longitude:parseFloat(m.location.lng),latitudeDelta: 0.01,longitudeDelta: 0.01}}
                    {...this.props}   pinColor="orange"  onPress={(e) => {e.stopPropagation();}} >
                        <Callout onPress={() => {this.showController(m); }}>
                          <View style={{padding:10,width:120}}>
                            <Text>{m.plate}</Text>
                            <Text>電量：{m.power}%</Text>
                            <Text style={{color:'#EE7700'}}>未租用</Text>
                          </View>
                        </Callout>
                    </MapView.Marker>
                ))}
                {scooterW.map(m => (
                    <MapView.Marker key={"marker_"+m.id} tracksViewChanges={false}   coordinate={{latitude:parseFloat(m.location.lat),longitude:parseFloat(m.location.lng),latitudeDelta: 0.01,longitudeDelta: 0.01}}
                    {...this.props}  pinColor="red"   onPress={(e) => {e.stopPropagation();}} >
                        <Callout onPress={() => {this.showController(m); }}>
                          <View style={{padding:10,width:120}}>
                            <Text>{m.plate}</Text>
                            <Text>電量：{m.power}%</Text>
                            <Text style={{color:'#900'}}>下線中</Text>
                          </View>
                        </Callout>
                    </MapView.Marker>
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

            

             <View style={{position:'absolute',left:0,bottom:0,width:'100%',paddingLeft:40,paddingTop:2,paddingBottom:2,backgroundColor:'rgba(0,0,0,0.6)'}}>
                <View style={{flexDirection: 'row',justifyContent:'space-around',alignItems:'center'}}>
                  <Text style={{fontSize:11,color:'#fff'}}>最後更新時間：{global.last_get_time}</Text>
                  <Text style={{fontSize:11,color:'#fff'}}>數量：{count}</Text>
                  
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
  loading:{
      position:'absolute',
      zIndex:101,
      top:100,
      left:'30%',
      flexDirection:'row',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      backgroundColor:'rgba(1,1,1,0.6)',
      padding:20,
      borderBottomLeftRadius:5,
      borderBottomRightRadius:5,
      borderTopLeftRadius:5,
      borderTopRightRadius:5
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
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
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
  dokodemo_door:{
    position:"absolute",
    top:100,
    left:10,
    zIndex:151,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  }

});

