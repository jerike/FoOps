import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,Alert,PixelRatio,TouchableOpacity,TextInput,Picker,ActivityIndicator } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import { Card, ListItem,Header,Input, Button,Image,SearchBar,ButtonGroup,CheckBox } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome5';
import '../global.js';
import ActionSheet from 'react-native-action-sheet';


var t = 0;

export default class MoveView extends React.Component {
    constructor () {
        super()
        this.state={
          photos:[],
        }
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
    pad(number){ return (number < 10 ? '0' : '') + number }
    dateFormat(date){
      var format_date = new Date(date);
      var create_date = this.pad(format_date.getFullYear())+'/'+this.pad(format_date.getMonth()+1)+'/'+this.pad(format_date.getDate())+' '+this.pad(format_date.getHours())+':'+this.pad(format_date.getMinutes());
      return create_date;
    }
    clearData(){
      this.setState({photos: []});
      this.props.moveview_option.onClose('moveview_modal');
    }
    render() {
        const {moveview_option} = this.props;
        if(this.state.photos.length == 0 && moveview_option.data != undefined){
          this.getPhotos(moveview_option.data.id);
        }

        var photos = this.state.photos.map(function(m,i){
            if(m == ""){
              return true;
            }
            return (<View
                    style={[
                      styles.avatar,
                      styles.avatarContainer,
                    ]}
                    key={"photo"+i}
                  >
                    <View><Image style={styles.avatar} source={{uri: m}} /></View>
                  </View>
            );
        })
        return (
            <Modal
              animationType="slide"
              transparent={false}
              visible={moveview_option.moveview_modal}
              presentationStyle="fullScreen"
              >
              <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
                
                <ScrollView >

                  <View style={{flex:1,justifyContent:'center'}}>
                    {this.state.show_loading && (
                      <View style={{position:'absolute',justifyContent:'center',alignItems:'center',width:'100%',height:'110%',top:0,left:0,zIndex:100005,backgroundColor:'rgba(0,0,0,0.6)'}}>
                          <View  style={styles.loading}>
                          <ActivityIndicator size="large" color="#ffffff" style={{marginBottom:5}} />
                          <Text style={{color:'#fff'}}>Loading...</Text>
                          </View>
                      </View>
                    )}
                      <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                        <View style={{justifyContent:'center',textAlign:'center',marginTop:5,marginLeft:10,width:120,borderBottomColor:'#ccc',borderBottomWidth:1}}>
                          <Text style={{ color: '#333',fontSize:18,textAlign:'center' }}>{moveview_option.data.plate}</Text>
                        </View>
                        <View style={{  justifyContent: "flex-start", alignItems: "flex-end",marginRight:5,marginTop:5 }}>
                           <Icon name='times-circle' size={30}  onPress={() => {
                              this.clearData();
                            }} />
                        </View>
                      </View>
                      <Card title="📷 移車拍照">
                        <View style={{flexDirection:'row',justifyContent: "space-around",alignItems: "center"}}>
                          {photos}    
                        </View>
                      </Card>
                     
                      
                      <Card title="👨‍🔧 移車人員">
                        <View>
                          <Text>{moveview_option.data.operator}</Text>
                        </View>
                      </Card>
                      <Card title="⏰ 移車時間">
                        <View>
                           <Text>{this.dateFormat(moveview_option.data.created)}</Text>
                        </View>
                      </Card>
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


