import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { Card, ListItem,Header, Button, Icon,Image,SearchBar,ButtonGroup } from 'react-native-elements'
import MapView, { Marker,PROVIDER_GOOGLE } from 'react-native-maps';
import Filter from './Filter';


const severe_title=["優先處理","次要處理","待處理","正常"];
const scootet_status = [{"type":"FREE","title":"尚未服務"},{"type":"RESERVED","title":"預約中"},{"type":"RIDING","title":"使用中"},{"type":"MAINTENANCE","title":"暫停服務"}];

export default class MapScreen extends React.Component {
    constructor () {
      super()
      this.state = {
        selectedIndex: null,
      }
      this.updateIndex = this.updateIndex.bind(this);
      this.onMarkerClick = this.onMarkerClick.bind(this);
    }
    componentWillMount() {
        var API = this.props.navigation.state.params.API;
        this.setState({ API: API,search:'',modalVisible: false,scooter:[],condition:[] });
        this.get_scooter_status(API);
        fetch(API+'/scooter',{
            method: 'GET',
            credentials: 'include'
          })
          .then((response) => {
                return response.json();
          })
          .then((json) => {
              this.setState({scooter:json.data});
          }); 
    }

    pad(number){ return (number < 10 ? '0' : '') + number }
    dateFormat(date){
      var format_date = new Date(date);
      var create_date = this.pad(format_date.getMonth()+1)+'/'+this.pad(format_date.getDate())+' '+this.pad(format_date.getHours())+':'+this.pad(format_date.getMinutes());
      return create_date;
    }
    updateIndex (selectedIndex) {
        if(selectedIndex == 0){
            this.setModalVisible(true);
        }else{
            if(selectedIndex == 1){
                this.props.navigation.navigate("列表");
            }else{
                this.props.navigation.navigate("地圖");
            }
            this.setState({selectedIndex});
        }
    }
    updateSearch = search => {
      this.setState({ search });
    }
    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }
    //取得車況
    get_scooter_status =(API)=>{
        fetch(API+'/scooter/status',{
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
    onMarkerClick = (event) => {
      // const markerID = event
      console.warn(event)
      // this.setState({nearScooter:null});
      // this.setState({selectScooter:props.id});
      // var markerLocation = props.position;
      // var nearScooter = [];
      // this.props.scooter.map(function(m,i){
      //     var distance = this.GetDistance(markerLocation.lat,markerLocation.lng,m.location.lat,m.location.lng);
      //     distance = distance.toFixed(2);
      //     if (distance < 0.1) {
      //         nearScooter.push(m);
      //     }
      // }.bind(this));
      
      // this.setState({nearScooter:nearScooter});

    }
    render() {
        const component1 = () => <Text>篩選</Text>
        const component2 = () => <Text>列表</Text>
        const component3 = () => <Text>地圖</Text>
        const buttons = [{ element: component1 }, { element: component2 }]
        const {search,selectedIndex,scooter} = this.state;
        
        mapStyle = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#6195a0"}]},{"featureType":"landscape","stylers":[{"color":"#e0dcdc"},{"visibility":"simplified"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels","stylers":[{"lightness":"60"},{"gamma":"1"},{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#e6f3d6"},{"visibility":"on"}]},{"featureType":"road","stylers":[{"saturation":-100},{"lightness":"65"}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#f4f4f4"},{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#f4f4f4"},{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#787878"}]},{"featureType":"road.highway","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#f4d2c5"},{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#f4d2c5"},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"labels.text","stylers":[{"color":"#4e4e4e"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"#fdfafa"}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"color":"#fdfafa"},{"visibility":"on"}]},{"featureType":"transit.station.rail","stylers":[{"visibility":"on"}]},{"featureType":"transit.station.rail","elementType":"labels.icon","stylers":[{"hue":"#1b00ff"},{"visibility":"on"}]},{"featureType":"transit.station.rail","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"transit.station.rail","elementType":"labels.text.stroke","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#eaf6f8"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#eaf6f8"}]}]
        var markers = [];
        this.state.scooter.map(function(m,i){
            var latlng = {latitude:m.location.lat,longitude:m.location.lng};
            markers.push(<Marker coordinate={latlng}  title={m.plate} description={m.status} onPress={(event) => this.onMarkerClick(event)} />);
        }.bind(this))

        

        return (
        <View style={{flex: 1, backgroundColor: '#ccc'}}>
            <Header
              
              centerComponent={<SearchBar
                                placeholder="搜尋..."
                                onChangeText={this.updateSearch}
                                value={search}
                                containerStyle={styles.search_container}
                                inputContainerStyle={styles.search_input}
                                inputStyle={styles.input}
                                lightTheme={true}
                              />}
              rightComponent={{ icon: 'menu', color: '#fff' }}
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
             <MapView
               provider={PROVIDER_GOOGLE} // remove if not using Google Maps
               style={styles.map}
               customMapStyle={mapStyle}
               mapType={Platform.OS == "android" ? "none" : "standard"}
               region={{
                 latitude: 22.6209962,
                 longitude: 120.297948,
                 latitudeDelta: 0.5,
                 longitudeDelta: 0.5
               }}
             >
             {markers}
             
             </MapView>
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
        height: 30,
        width: '100%',
        // borderTopRightRadius: 20,
        borderWidth: 0,
        backgroundColor: '#fff',
        marginTop: 0,
        borderRadius: 0,
        paddingLeft:0,
        marginLeft:0,
        marginBottom:0,
    },
    btn_buttonStyle: {
        backgroundColor: '#fff',

        borderWidth: 0,
    },
    btn_selectedButtonStyle: {
        backgroundColor: '#fff'
    }
});

