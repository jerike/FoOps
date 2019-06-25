import React, { Component } from 'react';
import { Text, View,SafeAreaView,StyleSheet,Modal,Alert,TouchableOpacity} from 'react-native';
import {Button} from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import '../global.js';


export default class Controller extends React.Component {
    controller(type){
      Alert.alert('⚠️ Test',type,[{text: '還未測試車輛'}]);
    }
   
    render() {
        const {controller_option} = this.props;
        return (
            <Modal
              animationType="slide"
              transparent={false}
              visible={controller_option.controller_modal}
              style={{height:200}}
              >
              <View style={{backgroundColor: '#fff'}}>
                  <View style={{  justifyContent: "flex-start", alignItems: "flex-end",marginRight:10 }}>
                     <Icon name='close' size={30}  onPress={() => {
                        controller_option.onClose('controller_modal');
                      }} />
                  </View>
                  <TouchableOpacity onPress={()=>this.controller('start')}>
                    <View>
                        <Text style={{color:'#000'}}>啟動(4G)</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>this.controller('stop')}>
                    <View>
                        <Text style={{color:'#000'}}>熄火(4G)</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>this.controller('trunk')}>
                    <View>
                        <Text style={{color:'#000'}}>開車廂(4G)</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>this.controller('search')}>
                    <View>
                        <Text style={{color:'#000'}}>尋車(4G)</Text>
                    </View>
                  </TouchableOpacity>
                </View>
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


