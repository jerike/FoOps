import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,Alert,PixelRatio,TouchableOpacity,TextInput,Picker,ActivityIndicator } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import { Card, ListItem,Header,Input, Button,Image,SearchBar,ButtonGroup,CheckBox } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome5';
import '../global.js';
import ActionSheet from 'react-native-action-sheet';
import {SingleImage} from 'react-native-zoom-lightbox';

var t = 0;

export default class MoveView extends React.Component {
    constructor () {
        super()
        this.state={
          photos:[],
          location1:"",
          location2:"",
        }
    }
    componentWillMount(){
      this.props.onRef(this);
    }
    getPhotos(id){
      fetch(global.API+'/ticket/'+id+'/getMoveScooter_photo/',{
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
    get_position(idx,latlng){
      fetch("https://maps.googleapis.com/maps/api/geocode/json?latlng="+latlng+"&language=zh-TW&key="+global.key,{
         method: 'GET',
      })
      .then((response) => response.json())
      .then((json)=> {
        this.setState({hit_position:true});
        if(json.results.length > 0){
          if(json.results.length == 1){
            switch(idx){
              case 1:
                this.setState({location1:json.results[0].formatted_address});
              break;
              case 2:
                this.setState({location2:json.results[0].formatted_address});
              break;
            }
              
          }else{
            switch(idx){
              case 1:
                this.setState({location1:json.results[0].formatted_address+"\n\n"+json.results[1].formatted_address});
              break;
              case 2:
                this.setState({location2:json.results[0].formatted_address+"\n\n"+json.results[1].formatted_address});
              break;
            }
          }
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
      this.setState({photos: [],location1:"",location2:"",});
      this.props.moveview_option.onClose('moveview_modal');
    }
    render() {
        const {moveview_option} = this.props;
        const {photos} = this.state;
        return (
            <Modal
              animationType="slide"
              transparent={false}
              visible={moveview_option.moveview_modal}
              presentationStyle="fullScreen"
              onRequestClose={()=>this.clearData()}
              >
              <SafeAreaView style={{flex: 1, backgroundColor: '#2F3345'}}>
                <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                  <View style={{justifyContent:'center',textAlign:'center',marginTop:5,marginLeft:10,width:120,borderBottomColor:'#ccc',borderBottomWidth:1}}>
                    <Text style={{ color: '#fff',fontSize:18,textAlign:'center' }}>{moveview_option.data.plate}</Text>
                  </View>
                  <View style={{  justifyContent: "flex-start", alignItems: "flex-end",marginRight:5,marginTop:5 }}>
                     <Icon name='times-circle' size={30} color="#ffffff"  onPress={() => {
                        this.clearData();
                      }} />
                  </View>
                </View>
                <ScrollView >
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
                        <Text style={{ color: '#fff',fontSize:18 }}>📷 移動前</Text>
                      </View>
                      <View style={{flexDirection:'row',marginTop:10,justifyContent: "space-around",alignItems: "center"}}>
                        <View
                          style={[
                            styles.avatar,
                            styles.avatarContainer,
                          ]}
                          key={"photo1"}
                        >
                          <SingleImage style={styles.avatar} uri={photos[0]} />
                        </View>  
                        <View style={{width:'50%',wordBreak:'break-all'}}>
                          <Text style={{fontSize:12,color:'#fff'}} >{this.state.location1}</Text>
                        </View> 
                      </View>
                      <View style={{justifyContent:'space-around',marginTop:10,paddingBottom:5,borderBottomColor:'#C67B38',borderBottomWidth:1}}>
                        <Text style={{ color: '#fff',fontSize:18 }}>📷 移動後</Text>
                      </View>
                      <View style={{flexDirection:'row',marginTop:10,justifyContent: "space-around",alignItems: "center"}}>
                        <View
                          style={[
                            styles.avatar,
                            styles.avatarContainer,
                          ]}
                          key={"photo2"}
                        >
                          <SingleImage style={styles.avatar} uri={photos[1]} />
                        </View> 
                        <View style={{width:'50%',wordBreak:'break-all'}}>
                          <Text style={{fontSize:12,color:'#fff'}} >{this.state.location2}</Text>
                        </View>   
                      </View>
                      <View style={{justifyContent:'space-around',marginTop:10,paddingBottom:5,borderBottomColor:'#C67B38',borderBottomWidth:1}}>
                        <Text style={{ color: '#fff',fontSize:18 }}>👨‍🔧 移車人員</Text>
                      </View>
                      <View style={{padding:10}}>
                        <Text style={{fontSize:18,color:'#fff'}} >{moveview_option.data.operator}</Text>
                      </View>
                      <View style={{justifyContent:'space-around',marginTop:10,paddingBottom:5,borderBottomColor:'#C67B38',borderBottomWidth:1}}>
                        <Text style={{ color: '#fff',fontSize:18 }}>⏰ 移車時間</Text>
                      </View>
                      <View style={{padding:10}}>
                        <Text style={{fontSize:18,color:'#fff'}}>{this.dateFormat(moveview_option.data.created)}</Text>
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


