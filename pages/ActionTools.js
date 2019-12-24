import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,Alert,ActivityIndicator } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import { Card, ListItem,Header,Input, Button,Image,SearchBar,ButtonGroup,CheckBox } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome5';
import '../global.js';

const severe_title = global.severe_title;
const scootet_status = global.scootet_status;

var t = 0;
export default class ActionTools extends React.Component {
    constructor () {
        super()
        this.state = {
            
        }

        
    }


   
    render() {
        const {action_tools_option} = this.props;


        return (
            <Modal
              animationType="slide"
              visible={action_tools_option.action_tools_modal}
              hardwareAccelerated={true}
              onRequestClose={() => {action_tools_option.onClose('action_tools_modal')}}
              transparent={true}
            >
            <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.7)'}}></View>
              <View style={{position:'absolute',width:'100%',height:180,bottom:0,backgroundColor: '#fff',borderTopWidth:1,borderColor:'#666'}}>
                  {this.state.show_loading &&(
                    <View style={styles.loading}>
                      <ActivityIndicator size="large" color="#ffffff" style={{marginBottom:5}} />
                      <Text style={{color:'#fff'}}>Loading...</Text>
                    </View>
                  )}
                  <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                    <View style={{justifyContent:'center',textAlign:'center',marginTop:5,marginLeft:10,width:'60%',borderBottomColor:'#ccc',borderBottomWidth:1}}>
                      <Text style={{ color: '#333',fontSize:18,textAlign:'center' }}>操作選項</Text>
                    </View>
                    <View style={{  justifyContent: "flex-start", alignItems: "flex-end",marginRight:5,marginTop:5 }}>
                       <Icon name='times-circle' size={30}  onPress={() => {
                          action_tools_option.onClose('action_tools_modal');
                        }} />
                    </View>
                  </View>
                 
                  <ScrollView style={{flexDirection:'column',marginTop:20 }}>
                    <View style={{flexDirection:'row',justifyContent:'space-around',alignItems:'flex-start'}}>
                      <View>
                        <Button  key={"abtn_0"} icon={<Icon name="exclamation-triangle" size={25} color="#FF8000" />}  type="outline" buttonStyle={{borderWidth:0}}  onPress={()=>action_tools_option.ViewViolationRecord()}/>
                        <Text style={{fontSize:13}}>違規紀錄</Text>
                      </View>
                      <View>
                        <Button  key={"abtn_3"} icon={<Icon name="charging-station" size={25} color="#00A600"   />}  type="outline" buttonStyle={{borderWidth:0}} onPress={()=>action_tools_option.selectWork(1)} />
                        <Text style={{fontSize:13}}>車輛換電</Text>
                      </View>
                      <View>
                        <Button  key={"abtn_4"} icon={<Icon name="charging-station" size={25} color="#00A600"   />}  type="outline" buttonStyle={{borderWidth:0}} onPress={()=>action_tools_option.selectWork(3)} />
                        <Text style={{fontSize:13}}>胎壓紀錄</Text>
                      </View>
                      <View>
                        <Button  key={"abtn_5"} icon={<Icon name="route" size={25} color="#EA0000"   />}  type="outline" buttonStyle={{borderWidth:0}} onPress={()=>action_tools_option.selectWork(2)} />
                        <Text style={{fontSize:13}}>違規移動</Text>
                      </View>
                      <View>
                        <Button  key={"abtn_6"} icon={<Icon name="route" size={25} color="#EA0000"   />}  type="outline" buttonStyle={{borderWidth:0}} onPress={()=>action_tools_option.BrokenTrack()} />
                        <Text style={{fontSize:13}}>車損追蹤</Text>
                      </View>

                      
                    </View>
                  </ScrollView>
              </View>
            </Modal>
       
        );
    }
}

const styles = StyleSheet.create({
  loading:{
    position:'absolute',
    zIndex:10001,
    top:'40%',
    left:'40%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'rgba(1,1,1,0.8)',
    padding:20,
    borderBottomLeftRadius:5,
    borderBottomRightRadius:5,
    borderTopLeftRadius:5,
    borderTopRightRadius:5
  },
  input: {
    width:'60%',
    backgroundColor:'#fff',
    borderTopLeftRadius:5,
    borderTopRightRadius:5,
    borderBottomRightRadius:5,
    borderBottomLeftRadius:5,
    height: 40, 
    borderColor: 'gray', 
    borderWidth: 1,
    marginTop:20,
    paddingLeft:5
  }
});


