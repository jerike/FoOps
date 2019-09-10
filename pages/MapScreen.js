import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Image,Modal,BackHandler,Platform,TouchableWithoutFeedback,ActivityIndicator,PermissionsAndroid,Animated } from 'react-native';
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
import Geolocation from '@react-native-community/geolocation';
import shallowCompare from 'react-addons-shallow-compare';
import '../global.js';
import isEqual from 'lodash.isequal'

const severe_title = global.severe_title;
const scootet_status = global.scootet_status;
var t = 0;
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
        MyPosition:null
      }
      this.updateIndex = this.updateIndex.bind(this);
      this.onMarkerClick = this.onMarkerClick.bind(this);
      this.setModalVisible=this.setModalVisible.bind(this);
      this.CloseCard=this.CloseCard.bind(this);
      this.onClear=this.onClear.bind(this);
      this.getFirstLatLng=this.getFirstLatLng.bind(this);
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
    }
    componentWillMount() {
        
        
        this.setState({ 
          all_work_area:global.all_work_area,
          geofence:global.geofence,
          set_polygon:true
        });
        
    }
    componentDidMount() {
        // if (Platform.OS === 'android') {
        //    BackHandler.addEventListener('hardwareBackPress',()=>{this.props.navigation.goBack()});
        // }else{
        //     BackHandler.addEventListener('hardwareBackPress', this.onBackClicked);
        // }
        this.getPosition();
        var scooter = global.scooter;
        var condition = global.condition;
        // console.warn(search);
        this.setState({scooter:scooter,condition:condition});
    }
    _onBackClicked(){
      return true;
    } 
    shouldComponentUpdate(nextProps, nextState){
        return shallowCompare(this, nextProps, nextState);
    }   
    componentWillUpdate(nextProps,nextState){
       if(this.state.scooter.length > 0 && nextState.scooter != this.state.scooter){
            this.setState({changed:true});
        }
    }
    
    getPosition(){
      Geolocation.getCurrentPosition(
        (position: any) => {
          const positionData: any = position.coords;
          this.setState({MyPosition:positionData});
          this.setState({setCenter:{latitude:positionData.latitude,longitude:positionData.longitude,latitudeDelta: 0.01,longitudeDelta: 0.01}});
        },
        (error: any) => {
          Alert.alert('⚠️ 定位失敗',JSON.stringify(error.message),[{text: 'OK'}]);
        }, {
          enableHighAccuracy: true,
          timeout: 20000
        }
      );
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
      this.setState({toSearch:true});
      this.setState({search:search},()=>this.filter_scooter_by_search());
    }
    onClear(){
      global.search = "";
      this.setState({toSearch:false,scooter:global.scooter});
    }
    reload_all_scooter(){
        this.setState({load_data:true});
        fetch(global.API+'/tools/clear_cache_key/all_scooter',{
            method: 'GET',
            credentials: 'include'
        }).then((response) => {
          this.fetch_scooters();
        });
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
            global.scooter = json.data;
            var theTime = new Date();
            var reload_time = this.pad(theTime.getMonth()+1)+'/'+this.pad(theTime.getDate())+' '+this.pad(theTime.getHours())+':'+this.pad(theTime.getMinutes())+':'+this.pad(theTime.getSeconds());
            global.reload_time = reload_time;
            this.setState({scooter:json.data});   
            this.setState({load_data:false});         
          }
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
    onMarkerClick = (id,lat,lng) => {
      // if (Platform.OS === 'ios') {
      //   this.startRendering();
      // }
      // this.setState({nearScooter:null,selectScooter:id,clickMarker:true,selectMarker:id});
      // var LatLng = {
      //     latitude: parseFloat(lat),
      //     longitude: parseFloat(lng),
      //     latitudeDelta: 0.005,
      //     longitudeDelta: 0.005
      // }
      // this.setState({setCenter:LatLng});
      
    }
    CloseCard(){
      this.setState({clickMarker:false,selectMarker:null});
    }
    getFirstLatLng(latlng){
      this.setState({setCenter:latlng});
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
            console.warn(r);
            this.setState({setCenter:r});
          }
          this.setState({ scooter:result });
      }else{
          this.setState({ toSearch:false });
          this.setState({ scooter:global.scooter });
      }
    }
    _renderDarkItem ({item, index}) {
        global.page = 'Map';
        return <SliderEntry data={item} even={true} CloseCard={this.CloseCard} navigation={this.props.navigation} sid={item.id}/>;
    }
    _centerMapOnMarker (markerIndex) {
        const mapRef = this.mapView;
        const markerData = this.state.nearScooter[markerIndex];
        if (!markerData || !mapRef) {
            return;
        }

        this.setState({selectMarker:markerData.id});
        if (Platform.OS === 'ios') {
          this.startRendering();
        }
        let r = {
            latitude: parseFloat(markerData.location.lat),
            longitude: parseFloat(markerData.location.lng),
            latitudeDelta: 0.008,
            longitudeDelta: 0.008
        };
        this.setState({setCenter:r});

        // mapRef.animateToRegion(r);
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
      console.warn('send2Map');
        var promise1 = new Promise((resolve,reject)=>{
          this.setState({scooter:global.scooter});
          resolve(0);
        });
        promise1.then(value=>new Promise((resolve,reject)=>{this.filter_scooter(global.scooter);setTimeout(()=>{resolve(1);},500)}))
                .then(value=>new Promise((resolve,reject)=>{this.setState({search:global.search},()=>this.filter_scooter_by_search())}));
      
    }
    render() {
        const {selectedIndex,toSearch,clickMarker,geofence,changed,scooter} = this.state;
        // var scooter = this.state.scooter;
        var search = global.search;
        var set_polygon = this.state.set_polygon;
        var stop_time = 2000;
        if (Platform.OS === 'ios') {
          if(this.state.first_loadMarker){
            this.setState({first_loadMarker:false});
          }else{
            stop_time = 1000;
          }
        }
        // if(toSearch){
        //     if(search == ""){
        //       scooter = this.state.scooter;
        //     }else{
        //       if(this.state.scooter.length > 0){
        //         scooter = this.state.scooter;
        //       }
        //     }
        // }
        const component1 = () => <View style={{flexDirection: 'row',justifyContent: "center", alignItems: "center"}}><Icon name="filter" style={{marginRight:10}} /><Text>篩選</Text></View>
        const component2 = () => <View style={{flexDirection: 'row',justifyContent: "center", alignItems: "center"}}><Icon name="list" style={{marginRight:10}} /><Text>列表</Text></View>
        const buttons = [{ element: component1 }, { element: component2 }]
        

        
        mapStyle = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#6195a0"}]},{"featureType":"landscape","stylers":[{"color":"#e0dcdc"},{"visibility":"simplified"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels","stylers":[{"lightness":"60"},{"gamma":"1"},{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#e6f3d6"},{"visibility":"on"}]},{"featureType":"road","stylers":[{"saturation":-100},{"lightness":"65"}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#f4f4f4"},{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#f4f4f4"},{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#787878"}]},{"featureType":"road.highway","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#f4d2c5"},{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#f4d2c5"},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"labels.text","stylers":[{"color":"#4e4e4e"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"#fdfafa"}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"color":"#fdfafa"},{"visibility":"on"}]},{"featureType":"transit.station.rail","stylers":[{"visibility":"on"}]},{"featureType":"transit.station.rail","elementType":"labels.icon","stylers":[{"hue":"#1b00ff"},{"visibility":"on"}]},{"featureType":"transit.station.rail","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"transit.station.rail","elementType":"labels.text.stroke","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#eaf6f8"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#eaf6f8"}]}];

        var markers = [];
        scooter.map(function(m,i){
            if(global.search != undefined){
              if(m.plate.indexOf(global.search) == -1){
                  return true;
              }
            }
            if(global.select_severe != undefined){
                if(m.severe != global.select_severe){
                    return;
                }
            }
            var latlng = {latitude:parseFloat(m.location.lat),longitude:parseFloat(m.location.lng),latitudeDelta: 0.01,longitudeDelta: 0.01};

            var marker;
            var status = (m.status == "MAINTAINCES") ? <Text style={{color:'#ccc'}}>🚫 Offline</Text> : <Text style={{color:'#00FF00'}}>📶 Online</Text>
            if(m.power <= 30){
              // if(this.state.selectMarker == null || this.state.selectMarker == m.id){
                  marker = <MapView.Marker key={"marker_"+m.id}   coordinate={latlng}
                  {...this.props} pinColor="red"   onPress={(e) => {e.stopPropagation();}} >
                      <Callout onPress={() => {global.page = "Map";this.props.navigation.navigate('ScooterDetail',{scooter:m.id}); }}>
                        <Text>{m.plate}</Text>
                        <Text>電量：{m.power}%</Text>
                        {status}
                      </Callout>
                  </MapView.Marker>
              // }
            }else{
              // if(this.state.selectMarker == null || this.state.selectMarker == m.id){
                  marker = <MapView.Marker key={"marker_"+m.id}   coordinate={latlng}
                  {...this.props} pinColor="green"   onPress={(e) => {e.stopPropagation();}} >
                      <Callout onPress={() => {global.page = "Map";this.props.navigation.navigate('ScooterDetail',{scooter:m.id}); }}>
                        <View style={{padding:10}}>
                          <Text>{m.plate}</Text>
                          <Text>電量：{m.power}%</Text>
                          {status}
                        </View>
                      </Callout>
                  </MapView.Marker>
              // }
            }

            
            markers.push(marker);
        }.bind(this));
        // if (Platform.OS === 'ios') {
        //   if(this.state.tracksViewChanges){
        //     setTimeout(()=>{this.stopRendering()},stop_time);
        //   }
        // }
        var setPolyPath=[];
        if(set_polygon){
            var fence = [];
            if(geofence != undefined){
              geofence.map(function(value,index){
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
        var Mymarker;

        if(this.state.MyPosition != null){

          var Mylatlng = {latitude:parseFloat(this.state.MyPosition.latitude),longitude:parseFloat(this.state.MyPosition.longitude),latitudeDelta: 0.01,longitudeDelta: 0.01};
          Mymarker = <MapView.Marker key={"mylocation"}   coordinate={Mylatlng}  image={require('../img/here.png')} />
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
                                placeholder="搜尋..."
                                onChangeText={this.updateSearch}
                                value={search}
                                containerStyle={styles.search_container}
                                inputContainerStyle={styles.search_input}
                                inputStyle={styles.input}
                                lightTheme={true}
                                onClear={this.onClear}
                              />}
              rightComponent={<Avatar rounded source={{uri:this.state.avatar}} onPress={()=>this.props.navigation.toggleDrawer()} />}
              containerStyle={styles.header}
            />
              <Filter filter_option={filter_option}/>
              <ButtonGroup
                onPress={this.updateIndex}
                selectedIndex={selectedIndex}
                buttons={buttons}
                containerStyle={styles.btn_containerStyle}
                buttonStyle={styles.btn_buttonStyle}
                selectedButtonStyle={styles.btn_selectedButtonStyle}
              />
           
            
               <AnimatedMap
                 ref = {(ref)=>this.mapView=ref}
                 provider={PROVIDER_GOOGLE}
                 style={styles.map}
                 customMapStyle={mapStyle}
                 mapType="standard"
                 region={this.state.setCenter}
                 showsMyLocationButton={true}
                 onPress={()=>{this.CloseCard()}}
               >
               
                  <MapView.Polygon
                    coordinates={[{ latitude: -89, longitude: -179.99999999 },{ latitude: 0, longitude: -179.99999999 },{ latitude: 89, longitude: -179.99999999 },{ latitude: 89, longitude: 0 },{ latitude: 89, longitude: 179.99999999 },{ latitude: 0, longitude: 179.99999999 },{ latitude: -89, longitude: 179.99999999 },{ latitude: -89, longitude: 0 },{ latitude: -89, longitude: -179.99999999 }]}
                    strokeColor={'#ff0000'}
                    fillColor={'rgba(0,0,0,0.5)'}
                    strokeWidth={2}
                    holes={setPolyPath}
                  />
                {Mymarker}
                {work_areas}
                {markers}
                
               </AnimatedMap>
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

             <View style={styles.compass} >
               <TouchableWithoutFeedback onPress={()=>this.getPosition()}>
                <Icon name="compass" size={20} />
                  
               </TouchableWithoutFeedback>
             </View>

             <View style={{position:'absolute',bottom:0,right:0,padding:2,backgroundColor:'rgba(0,0,0,0.6)'}}>
               <Text style={{fontSize:11,color:'#fff'}}>最後更新時間：{global.reload_time}</Text>
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
    bottom:10,
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
    bottom:25,
    right:5,
    zIndex:10009,
    alignItems:'center',
    justifyContent:'center',
    width: 40,
    height:40,
    backgroundColor:'#F5F5F5',
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

