import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,TouchableOpacity,ActivityIndicator } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { Card, ListItem,Header, Button,Image,SearchBar,ButtonGroup,Avatar } from 'react-native-elements'
import MapView, { Marker,PROVIDER_GOOGLE,Polygon,Polyline } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Filter from './Filter';
import Carousel from 'react-native-snap-carousel';
import { sliderWidth, itemWidth } from '../styles/SliderEntry.style';
import slideStyle, { colors } from '../styles/index.style';
import SliderEntry from '../component/SliderEntry';
import '../global.js';
const marker1 = require("../img/marker-normal.png");
const marker2 = require("../img/marker-green.png");
const marker3 = require("../img/marker-gray.png");
const severe_title = global.severe_title;
const scootet_status = global.scootet_status;
var t = 0;
export default class MapScreen extends React.Component {
    constructor () {
      super()
      this.state = {
        selectedIndex: null,
        nearScooter:null,
        setCenter:{latitude: 22.6209962,longitude: 120.297948,latitudeDelta:0.005,longitudeDelta: 0.005},
        search_scooter:[],
        clickMarker:false,
        avatar:global.avatar,
        selectMarker:null,
        work_area:'',
        all_work_area:[],
        load_data:false,
      }
      this.updateIndex = this.updateIndex.bind(this);
      this.onMarkerClick = this.onMarkerClick.bind(this);
      this.CloseCard=this.CloseCard.bind(this);
      this.onClear=this.onClear.bind(this);
      this.getFirstLatLng=this.getFirstLatLng.bind(this);
      this._renderDarkItem=this._renderDarkItem.bind(this);
      this.getStorage=this.getStorage.bind(this);
      this.reload_all_scooter=this.reload_all_scooter.bind(this);
      this.fetch_scooters=this.fetch_scooters.bind(this);
    }
    componentWillMount() {
        var scooter = this.props.navigation.state.params.scooter;
        var search = this.props.navigation.state.params.filter_option.search;
        var save_scooter = this.props.navigation.state.params.filter_option.save_scooter;
        this.setState({search:'',modalVisible: false,save_scooter:scooter,scooter:scooter,condition:[],search:search },()=>{
            if(search != ""){this.updateSearch(search);}
        });
        this.get_scooter_status();
        this.get_geofence();
        this.get_work_area();
    }
    componentDidMount() {
      // this.getPosition();
      this.getStorage();
    }
    getStorage = async () => {
        try {
          const avatar = await AsyncStorage.getItem('@FoOps:avatar');
          if (avatar !== null) {
            this.setState({avatar:avatar});
          }
        } catch (error) {
          console.warn(error);
        }
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
            this.setState({ all_work_area:json.data });
          }else{
            alert(json.reason);
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
        this.setState({ geofence:json.data });
        this.setState({ updated_time:json.updated }); 
        this.setState({set_polygon:true});
      });
    }
    getPosition(){
      navigator.geolocation.getCurrentPosition(
        (position: any) => {
          const positionData: any = position.coords;
          this.setState({setCenter:{latitude:positionData.latitude,longitude:positionData.longitude,latitudeDelta: 0.01,longitudeDelta: 0.01}});
        },
        (error: any) => {
          console.warn('失敗：' + JSON.stringify(error.message))
        }, {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 1000
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
          global.page = "map"; 
          this.props.navigation.state.params.filter_option.setModalVisible(true);
          this.CloseCard();
        }else{
            if(selectedIndex == 1){
                this.props.navigation.navigate("Home",{scooter:this.state.scooter});
                this.props.navigation.state.params.filter_option.changeScreen('Home');
            }else{
                this.props.navigation.navigate("Map");
            }
            this.setState({selectedIndex});
        }
    }
    updateSearch = search => {
      this.props.navigation.state.params.filter_option.updateSearch(search);
      this.setState({toSearch:true});
      this.setState({search:search},()=>this.filter_scooter_by_search());
    }
    onClear(){
      this.setState({toSearch:false});
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
            this.setState({scooter:json.data});   
            this.setState({load_data:false});         
          }
        });
    }
    //取得車況
    get_scooter_status =()=>{
        fetch(global.API+'/scooter/status',{
          method: 'GET'
        })
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          if(json.code == 1){
            this.setState({ condition:json.data });
          }else{
            alert(json.reason);
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
        this.state.condition.map(function(m, i){
            if(parseInt(m.id) == parseInt(id)){
              var description = m.description;
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
      this.setState({nearScooter:null,selectScooter:id,clickMarker:true});
      var nearScooter = [];
      var LatLng = {};
      var index = 0;
      this.state.scooter.map(function(m,i){
          var distance = this.GetDistance(lat,lng,m.location.lat,m.location.lng);
          distance = distance.toFixed(2);          
          if (distance < 0.1) {
              var stats_type = this.get_status_type(m.status);
              var severe_lvl = this.get_severe_lvl(m.severe);
              var card_header = <div>{severe_lvl}</div>;
              var show_power = "";
              var power_type = "";
              var power = m.power;
              var ticket_id = "";
              var conditions = [];
              var scooter_status = "";
              var power = m.power;
              switch(true){
                  case power >= 50:
                      show_power = <Text style={{color:'#28a745'}}>電量：{power}%</Text>
                  break;
                  case power >= 20 && power < 50:
                      show_power = <Text style={{color:'#FF8800'}}>電量：{power}%</Text>
                  break;
                  case power < 20:
                      show_power = <Text style={{color:'#f00'}}>電量：{power}%</Text>
                  break;
              }
              if(m.ticket){
                if(m.ticket.scooter_conditions){
                  m.ticket.scooter_conditions.map(function(d,k){
                    var description = this.getConditions(d);
                      if(description == "其他"){
                          // console.log(m.ticket.other_conditions);
                          m.ticket.other_conditions.map(function(s,i){
                              if(s.id == d){

                                  conditions.push(s.summary);
                              }
                          });
                      }else{
                          conditions.push(description);
                      }
                  }.bind(this));
                  
                }

                if(m.ticket.id != undefined){
                  scooter_status = <Text>車況：【{conditions.join(" 、 ")}】</Text>;
                }
              }
              var last_rental_day = (m.last_rental == "") ? "無" : this.dateFormat(m.last_rental);
              var power_msg = show_power;
              if(index == 0){
                this.setState({selectMarker:m.id});
                LatLng = {
                    latitude: parseFloat(m.location.lat),
                    longitude: parseFloat(m.location.lng),
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.001
                }
              }
              nearScooter.push({
                  id: m.id,
                  title: m.plate,
                  stats_type: stats_type,
                  power_msg: power_msg,
                  scooter_status: scooter_status,
                  range_days: m.range_days,
                  location: m.location,

              });
              index++;
          }
      }.bind(this));
      this.setState({nearScooter:nearScooter});
      this.setState({setCenter:LatLng});
      
    }
    CloseCard(){
      this.setState({nearScooter:null,clickMarker:false,selectMarker:null});
    }
    getFirstLatLng(latlng){
      this.setState({setCenter:latlng});
    }
    filter_scooter_by_search(){
        if(this.state.search !=""){
            var result = [];
            
            this.state.scooter.map(function(m, i){
              var plate = m.plate.toUpperCase();
              if(plate.indexOf(this.state.search.toUpperCase()) != -1){
                result.push(m);
              }
                
            }.bind(this));
            if(result.length > 0){
              let r = {
                  latitude: parseFloat(result[0].location.lat),
                  longitude: parseFloat(result[0].location.lng),
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
              };
              this.setState({setCenter:r});
            }
            this.setState({ search_scooter:result });
        }else{
            this.setState({ toSearch:false });
            this.setState({ search_scooter:[] });
        }
    }
    _renderDarkItem ({item, index}) {
        global.page = 'map';
        return <SliderEntry data={item} even={true} CloseCard={this.CloseCard} navigation={this.props.navigation} sid={item.id}/>;
    }
    _centerMapOnMarker (markerIndex) {
        const mapRef = this.mapView;
        const markerData = this.state.nearScooter[markerIndex];
        if (!markerData || !mapRef) {
            return;
        }
        this.setState({selectMarker:markerData.id});
        let r = {
            latitude: parseFloat(markerData.location.lat),
            longitude: parseFloat(markerData.location.lng),
            latitudeDelta: 0.0005,
            longitudeDelta: 0.0005
        };
        this.setState({setCenter:r});
        // mapRef.animateToRegion(r);
    }
    render() {
        const {search,selectedIndex,toSearch,clickMarker,geofence} = this.state;
        var get_props_scooter = this.props.navigation.getParam('scooter');
        var scooter_changed = this.props.navigation.getParam('changed');
        var scooter = [];
        var set_polygon = this.state.set_polygon;
        if(toSearch){
            if(this.state.search_scooter.length > 0){
              scooter = this.state.search_scooter;
            }
        }else{
          scooter = get_props_scooter;
        }

        const component1 = () => <View style={{flexDirection: 'row',justifyContent: "center", alignItems: "center"}}><Icon name="filter" style={{marginRight:10}} /><Text>篩選</Text></View>
        const component2 = () => <View style={{flexDirection: 'row',justifyContent: "center", alignItems: "center"}}><Icon name="list" style={{marginRight:10}} /><Text>列表</Text></View>
        const buttons = [{ element: component1 }, { element: component2 }]
        
        if(this.props.navigation.getParam('search') != undefined && this.state.search != this.props.navigation.getParam('search')){
            this.updateSearch(this.props.navigation.getParam('search'));
        }
        
        mapStyle = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#6195a0"}]},{"featureType":"landscape","stylers":[{"color":"#e0dcdc"},{"visibility":"simplified"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels","stylers":[{"lightness":"60"},{"gamma":"1"},{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#e6f3d6"},{"visibility":"on"}]},{"featureType":"road","stylers":[{"saturation":-100},{"lightness":"65"}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#f4f4f4"},{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#f4f4f4"},{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#787878"}]},{"featureType":"road.highway","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#f4d2c5"},{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#f4d2c5"},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"labels.text","stylers":[{"color":"#4e4e4e"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"#fdfafa"}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"color":"#fdfafa"},{"visibility":"on"}]},{"featureType":"transit.station.rail","stylers":[{"visibility":"on"}]},{"featureType":"transit.station.rail","elementType":"labels.icon","stylers":[{"hue":"#1b00ff"},{"visibility":"on"}]},{"featureType":"transit.station.rail","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"transit.station.rail","elementType":"labels.text.stroke","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#eaf6f8"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#eaf6f8"}]}];

        var markers = [];
        scooter.map(function(m,i){

            var latlng = {latitude:parseFloat(m.location.lat),longitude:parseFloat(m.location.lng),latitudeDelta: 0.01,longitudeDelta: 0.01};
            if(!clickMarker && scooter_changed && t == 0 && i === 0){
              t++;
              setTimeout(()=>{
                this.getFirstLatLng(latlng);
                this.setState({nearScooter:null});
                t = 0;
              },100);
            }

            var marker;
            switch(m.status){
              case "MAINTENANCE":
                var isActive = (this.state.selectMarker==m.id) ? true : false;

                marker = <MapView.Marker key={`${m.id}-${isActive ? 'active' : 'inactive'}`} coordinate={latlng} pinColor={isActive ? 'yellow' : 'tan'}  onPress={(e) => {e.stopPropagation(); this.onMarkerClick(m.id,m.location.lat,m.location.lng)}} />
              break;
              case "RIDING":
                var isActive = (this.state.selectMarker==m.id) ? true : false;

                marker = <MapView.Marker key={`${m.id}-${isActive ? 'active' : 'inactive'}`} coordinate={latlng} pinColor={isActive ? 'yellow' : 'green'} onPress={(e) => {e.stopPropagation(); this.onMarkerClick(m.id,m.location.lat,m.location.lng)}} />
              break;
              default:
                var isActive = (this.state.selectMarker==m.id) ? true : false;
                
                marker = <MapView.Marker key={`${m.id}-${isActive ? 'active' : 'inactive'}`} coordinate={latlng} pinColor={isActive ? 'yellow' : 'tomato'} onPress={(e) => {e.stopPropagation(); this.onMarkerClick(m.id,m.location.lat,m.location.lng)}} />
              break;
            }
            markers.push(marker);

        }.bind(this));
        var setPolyPath=[];
        if(set_polygon){
            var worldCoords = [
              {latitude:-85.1054596961173,longitude: -180},
              {latitude:85.1054596961173,longitude: -180},
              {latitude:85.1054596961173,longitude: 180},
              {latitude:-85.1054596961173,longitude: 180},
              {latitude:-85.1054596961173,longitude: 0}
            ]; 
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
                var set_work_area = []
                value.map(function(m,i){
                    set_work_area.push({latitude:parseFloat(m.lat),longitude:parseFloat(m.lng)});
                });
                return <MapView.Polygon
                  key={index}
                  coordinates = {set_work_area}
                  strokeColor = {work_area_color1[index]}
                  fillColor={work_area_color2[index]}
                  strokeWidth={3}
                />
            });
            
            
            
        }
        // console.warn(setPolyPath);
        return (
        <View style={{flex: 1, backgroundColor: '#ccc'}}>
            <Header
              leftComponent={<Avatar rounded source={{uri:'https://gokube.com/images/logo.png'}} overlayContainerStyle={{backgroundColor:'transparent'}} />}
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
              containerStyle={{
                backgroundColor: '#ff5722',
                justifyContent: 'space-around',
              }}
            />
            <ButtonGroup
              onPress={this.updateIndex}
              selectedIndex={selectedIndex}
              buttons={buttons}
              containerStyle={styles.btn_containerStyle}
              buttonStyle={styles.btn_buttonStyle}
              selectedButtonStyle={styles.btn_selectedButtonStyle}
            />
            {this.state.nearScooter && (
              <View style={{position:'absolute',bottom:0,zIndex:101,flexDirection: 'row',justifyContent: "flex-end", alignItems: "center"}}>
                  <View style={{position:'absolute',top:0,right:2}}>
                    <Button
                      style={styles.work_area_btn}
                      buttonStyle={{backgroundColor:'#666'}}
                      icon={<Icon name="times-circle" size={15}  color="white" />}
                      onPress={()=>this.CloseCard()}
                    />
                  </View>
                  <Carousel
                    ref={(c) => { this._carousel = c; }}
                    data={this.state.nearScooter}
                    renderItem={this._renderDarkItem}
                    sliderWidth={sliderWidth}
                    itemWidth={itemWidth}
                    loop={true}
                    containerCustomStyle={slideStyle.slider}
                    contentContainerCustomStyle={slideStyle.sliderContentContainer}
                    onSnapToItem={(index, marker) => this._centerMapOnMarker(index)}
                  />

              </View>

            )}
            
             <MapView
               ref = {(ref)=>this.mapView=ref}
               provider={PROVIDER_GOOGLE}
               style={styles.map}
               customMapStyle={mapStyle}
               mapType="standard"
               region={this.state.setCenter}
             >
             
              <MapView.Polygon
                coordinates={[{ latitude: -89, longitude: -179.99999999 },{ latitude: 0, longitude: -179.99999999 },{ latitude: 89, longitude: -179.99999999 },{ latitude: 89, longitude: 0 },{ latitude: 89, longitude: 179.99999999 },{ latitude: 0, longitude: 179.99999999 },{ latitude: -89, longitude: 179.99999999 },{ latitude: -89, longitude: 0 },{ latitude: -89, longitude: -179.99999999 }]}
                strokeColor={'#ff0000'}
                fillColor={'rgba(0,0,0,0.5)'}
                strokeWidth={2}
                holes={setPolyPath}
              />
             
              {work_areas}
              {markers}
              
             </MapView>
             <View style={styles.circle} >
               <TouchableOpacity onPress={()=>this.reload_all_scooter()}>
                { this.state.load_data ?(
                  <ActivityIndicator  color="#ffffff"  />
                  ):
                  (<Icon name="redo" size={20} color={'#ffffff'}/>)
                }
                  
               </TouchableOpacity>
             </View>
        </View>
         
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
    bottom:25,
    left:15,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,  
  }
});

