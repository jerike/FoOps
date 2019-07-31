import React, { Component } from 'react';
import { Text, View,SafeAreaView,StyleSheet,Modal,Platform,Linking } from 'react-native';
import {Button} from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import '../global.js';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';

var t = 0;

export default class Direction extends React.Component {
    constructor () {
        super()
        this.state = {
            positionData:null
        }

    }
    componentWillMount(){
      Geolocation.getCurrentPosition(
        (position: any) => {
          const positionData: any = position.coords;
          this.setState({positionData:positionData});
        },
        (error: any) => {
          console.warn('失敗：' + JSON.stringify(error.message))
        }, {
          enableHighAccuracy: true,
          timeout: 20000
        }
      );
    }
    componentDidMount() {
      
    }
    
    pad(number){ return (number < 10 ? '0' : '') + number }
    dateFormat(date){
      var format_date = new Date(date);
      var create_date = this.pad(format_date.getMonth()+1)+'/'+this.pad(format_date.getDate())+' '+this.pad(format_date.getHours())+':'+this.pad(format_date.getMinutes());
      return create_date;
    }
    _onNavigationStateChange(webViewState){
      if(webViewState.url.indexOf('intent') != -1){
          var url = webViewState.url.replace('intent://navlite.app.goo.gl/?link=',"");
          Linking.openURL(url).catch((err) => console.error('An error occurred', err));
      }
      
    }
    render() {
        const {direction_option} = this.props;
        var latlng = "";
        if(direction_option.scooter.location != undefined){
          latlng = direction_option.scooter.location.lat+","+ direction_option.scooter.location.lng;
        }
        var origin="";
        if(this.state.positionData != null){
          origin = this.state.positionData.latitude+","+this.state.positionData.longitude;
        }
        return (
            <Modal
              animationType="slide"
              transparent={false}
              visible={direction_option.direction_modal}
              presentationStyle="fullScreen"
              >
              <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
                  <View style={{  justifyContent: "flex-start", alignItems: "flex-end",marginRight:10 }}>
                     <Icon name='close' size={30}  onPress={() => {
                        direction_option.onClose('direction_modal');
                      }} />
                  </View>
                  <WebView
                    onNavigationStateChange={this._onNavigationStateChange.bind(this)}
                    geolocationEnabled={true}
                    source={{uri: 'https://www.google.com/maps/dir/?api=1&origin='+origin+'&destination='+latlng+'&travelmode=two-wheeler'}}
                  />
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
    backgroundColor: '#F5FCFF',
  },
  avatarContainer: {
    backgroundColor: '#F5F5F5',
    borderColor: '#9B9B9B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 90,
    height: 90,
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


