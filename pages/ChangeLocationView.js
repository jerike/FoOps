import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,Alert,PixelRatio,TouchableOpacity,TextInput,Picker,ActivityIndicator } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import { Card, ListItem,Header,Input, Button,Image,SearchBar,ButtonGroup,CheckBox } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome5';
import '../global.js';
import MapView, { Marker,PROVIDER_GOOGLE,Polygon,Polyline,Callout,Animated as AnimatedMap,AnimatedRegion } from 'react-native-maps';


export default class ChangeLocationView extends React.Component {
    constructor () {
        super()
        this.state={
         marginBottom:1,
         moveCenter:null
        }
        this.get_scooter_location=this.get_scooter_location.bind(this);
        this._onMapReady=this._onMapReady.bind(this);
        this.moveMarker=this.moveMarker.bind(this);
        this.updateLocation=this.updateLocation.bind(this);

    }
    componentWillMount() {
        this.props.onRefLocation(this);
    }
    get_scooter_location(scooter){
        var lat = parseFloat(scooter.location.lat);
        var lng = parseFloat(scooter.location.lng);
        this.setState({scooter:scooter,setCenter:{latitude:lat,longitude:lng,latitudeDelta: 0.01,longitudeDelta: 0.01}});
    }
    _onMapReady(){
      this.setState({marginBottom: 0});
    }
    clearData(){
      this.setState({moveCenter: null});
      this.props.clv_option.onClose('clv_modal',false);
    }
    submitClose(){
      this.setState({moveCenter: null});
      this.props.clv_option.onClose('clv_modal',false);
      this.props.clv_option.onClose('action_tools_modal');
    }
    moveMarker(e){
      var lat = e.nativeEvent.coordinate.latitude;
      var lng = e.nativeEvent.coordinate.longitude;
      this.setState({moveCenter:{lat:lat,lng:lng}});
    }
    updateLocation(){
      var before_location = parseFloat(this.state.scooter.location.lat)+","+parseFloat(this.state.scooter.location.lng);
      var after_location = parseFloat(this.state.moveCenter.lat)+","+parseFloat(this.state.moveCenter.lng);
      var formData  = new FormData();    
      formData.append("scooter", this.state.scooter.id);
      formData.append("plate", this.state.scooter.plate);
      formData.append("operator", global.user_givenName);
      formData.append("operator_id", global.user_id);
      formData.append("before_location", before_location);
      formData.append("after_location", after_location);
      formData.append("photo1", '');
      formData.append("photo2", '');

      // 送出紀錄
      fetch(global.API+'/scooter/scooter_location_modify',{
        method: 'PUT',
        credentials: 'include',
        body: formData
      })
      .then((response) => {
          if(response.status == 200){
            return response.json();
          }else{
            this.props.navigation.navigate('TimeOut');
          }
      })
      .then((json) => {
        if(json.code == 1){
          Alert.alert('System',"更新完成",[{text: '好的！', onPress: () => {this.submitClose()}}]);
        }else{
          Alert.alert('System',"更新失敗:\n"+json.reason,[{text: '好的！'}]);
        }
      });
    }
    render() {
        const {clv_option} = this.props;
        const {scooter,setCenter,marginBottom,moveCenter} = this.state;
        var marker = null;
        if(setCenter != undefined){
          marker = <MapView.Marker draggable tracksViewChanges={false}   coordinate={setCenter} title={scooter.plate} onDragEnd={this.moveMarker}
                    {...this.props}  onPress={(e) => {e.stopPropagation();}} >
                    </MapView.Marker>
        }
        var show_move_box = false;
        if(moveCenter != null){
          var show_move_content = moveCenter.lat+"\n"+moveCenter.lng;
          show_move_box = true;
        }
        return (
            <Modal
              animationType="slide"
              transparent={false}
              visible={clv_option.clv_modal}
              presentationStyle="fullScreen"
              onRequestClose={()=>this.clearData()}
              >
              <SafeAreaView style={{flex: 1,justifyContent:'center', backgroundColor: '#2F3345'}}>
                <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                    <View style={{justifyContent:'center',textAlign:'center',marginTop:10,marginLeft:10,width:120,marginBottom:10}}>
                      <Text style={{ color: '#ff5722',fontSize:18,textAlign:'center' }}>{"移動定位"}</Text>
                    </View>
                    <View style={{  justifyContent: "flex-start", alignItems: "flex-end",marginRight:5,marginTop:5 }}>
                       <Icon name='times-circle' size={30} color="#fff"  onPress={() => {
                          this.clearData();
                        }} />
                    </View>
                </View>
                  <MapView
                     ref = {(ref)=>this.mapView=ref}
                     provider={PROVIDER_GOOGLE}
                     style={{flex: 1,width: '100%',height: '100%', marginBottom: marginBottom}}
                     mapType="standard"
                     region={setCenter}
                     showsMyLocationButton={true}
                     showsUserLocation={true}
                     showsCompass={true}
                     onMapReady={this._onMapReady}
                     tracksViewChanges={false}
                   >
                   {marker}
                   </MapView>
                   {show_move_box &&(
                    <View style={{position:'absolute',left:0,bottom:0,width:'100%',paddingLeft:10,paddingRight:10,paddingTop:2,paddingBottom:2,backgroundColor:'rgba(0,0,0,0.6)'}}>
                      <View style={{flexDirection: 'row',justifyContent:'space-between',alignItems:'center'}}>
                        <View>
                          <Text style={{fontSize:15,color:'#fff'}}>{"更新後經緯度："}</Text>
                          <Text style={{fontSize:12,color:'#fff'}}>{show_move_content}</Text>
                        </View>
                        <Button title="更新定位" buttonStyle={{backgroundColor:'#ff0000',height:30,borderRadius:5}} titleStyle={{fontSize:13}}  onPress={()=>this.updateLocation()}/>
                      </View>
                   </View>
                   )}
              </SafeAreaView>
            </Modal>
       
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2F3345',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  
  loading:{
        position:'absolute',
        zIndex:101,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:'rgba(1,1,1,0.8)',
        padding:20,
        borderBottomLeftRadius:5,
        borderBottomRightRadius:5,
        borderTopLeftRadius:5,
        borderTopRightRadius:5
    },
});


