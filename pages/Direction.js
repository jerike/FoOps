import React, { Component } from 'react';
import { Text, View,SafeAreaView,StyleSheet,Modal,Platform,WebView } from 'react-native';
import {Button} from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import '../global.js';


var t = 0;

export default class Direction extends React.Component {
    constructor () {
        super()
        this.state = {
            
        }

    }
    componentDidMount() {
      
    }
    
    pad(number){ return (number < 10 ? '0' : '') + number }
    dateFormat(date){
      var format_date = new Date(date);
      var create_date = this.pad(format_date.getMonth()+1)+'/'+this.pad(format_date.getDate())+' '+this.pad(format_date.getHours())+':'+this.pad(format_date.getMinutes());
      return create_date;
    }
    
    render() {
        const {direction_option} = this.props;
         var latlng = "";
        if(direction_option.scooter.location != undefined){
          latlng = direction_option.scooter.location.lat+","+ direction_option.scooter.location.lng;
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
                    source={{uri: 'https://www.google.com/maps/dir/?api=1&destination='+latlng+'&travelmode=two-wheeler'}}
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

