import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,Alert,PixelRatio,TouchableOpacity,TextInput,Picker,ActivityIndicator } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import { Card, ListItem,Header,Input, Button,Image,SearchBar,ButtonGroup,CheckBox } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome5';
import '../global.js';
import ActionSheet from 'react-native-action-sheet';
import {SingleImage} from 'react-native-zoom-lightbox';

var t = 0;

export default class TireView extends React.Component {
    constructor () {
        super()
        this.state={
          photos:[],
          photos2:[]
        }
    }
    componentWillMount(){
      this.props.onRef(this);
    }
    getPhotos(id){
      fetch(global.API+'/ticket/'+id+'/getTireRecord_photo/',{
          method: 'GET',
          credentials: 'include'
        })
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          if(json.code ==1){
              this.setState({
                photos:json.data
              });
          }
        });
    }
    pad(number){ return (number < 10 ? '0' : '') + number }
    dateFormat(date){
      var format_date = new Date(date);
      var create_date = this.pad(format_date.getFullYear())+'/'+this.pad(format_date.getMonth()+1)+'/'+this.pad(format_date.getDate())+' '+this.pad(format_date.getHours())+':'+this.pad(format_date.getMinutes());
      return create_date;
    }
    clearData(){
      this.setState({photos: []});
      this.props.tireview_option.onClose('tireview_modal');
    }
    render() {
        const {tireview_option} = this.props;
        var photos = this.state.photos.map(function(m,i){
            if(m == "" || m == null){
              return true;
            }
            return (<View
                    style={[
                      styles.avatar,
                      styles.avatarContainer,
                    ]}
                    key={"photo"+i}
                  >
                    <SingleImage style={styles.avatar} uri={m} />
                  </View>
            );
        });
        return (
            <Modal
              animationType="slide"
              transparent={false}
              visible={tireview_option.tireview_modal}
              presentationStyle="fullScreen"
              onRequestClose={()=>this.clearData()}
              >
              <SafeAreaView style={{flex: 1, backgroundColor: '#2F3345'}}>
                <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                    <View style={{justifyContent:'center',textAlign:'center',marginTop:5,marginLeft:10,width:120,borderBottomColor:'#ccc',borderBottomWidth:1}}>
                      <Text style={{ color: '#ff5722',fontSize:18,textAlign:'center' }}>胎壓紀錄</Text>
                    </View>
                    <View style={{  justifyContent: "flex-start", alignItems: "flex-end",marginRight:5,marginTop:5 }}>
                       <Icon name='times-circle' size={30} color="#fff"  onPress={() => {
                          this.clearData();
                        }} />
                    </View>
                </View>
                <ScrollView>
                  
                  <View style={{justifyContent:'center',alignItems: 'center'}}>
                    
                    {this.state.show_loading && (
                      <View style={{position:'absolute',justifyContent:'center',alignItems:'center',width:'100%',height:'110%',top:0,left:0,zIndex:100005,backgroundColor:'rgba(0,0,0,0.6)'}}>
                          <View  style={styles.loading}>
                          <ActivityIndicator size="large" color="#ffffff" style={{marginBottom:5}} />
                          <Text style={{color:'#fff'}}>Loading...</Text>
                          </View>
                      </View>
                    )}
                    
                    <View style={{width:'80%',justifyContent:'center',marginBottom:50}}>
                      <View style={{justifyContent:'space-around',marginTop:10,paddingBottom:5,borderBottomColor:'#C67B38',borderBottomWidth:1}}>
                        <Text style={{ color: '#fff',fontSize:18 }}>📷 胎壓照片</Text>
                      </View>
                      <View style={{flexDirection:'row',marginTop:10,justifyContent: "space-around",alignItems: "center"}}>
                        {photos}    
                      </View>
                      
                      <View style={{justifyContent:'space-around',marginTop:10,paddingBottom:5,borderBottomColor:'#C67B38',borderBottomWidth:1}}>
                        <Text style={{ color: '#fff',fontSize:18 }}>👨‍🔧 紀錄人員</Text>
                      </View>
                      <View style={{padding:10}}>
                        <Text style={{fontSize:18,color:'#fff'}} >{tireview_option.data.operator}</Text>
                      </View>
                      <View style={{justifyContent:'space-around',marginTop:10,paddingBottom:5,borderBottomColor:'#C67B38',borderBottomWidth:1}}>
                        <Text style={{ color: '#fff',fontSize:18 }}>⏰ 執行時間</Text>
                      </View>
                      <View style={{padding:10}}>
                        <Text style={{fontSize:18,color:'#fff'}}>{this.dateFormat(tireview_option.data.created)}</Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>    
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
    width: 100,
    height: 150,
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


