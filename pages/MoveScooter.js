import React, { Component } from 'react';
import { TextInput, View,StyleSheet,TouchableOpacity,TouchableHighlight,Alert,ScrollView,Animated,Easing,ActivityIndicator,Dimensions,SafeAreaView,BackHandler,AppRegistry} from 'react-native';
import { Text,Card, ListItem,Header, Button,Image,SearchBar,ButtonGroup,Avatar,Input,Divider   } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import '../global.js';


export default class MoveScooter extends React.Component {
    constructor(props) {
        super(props);
        this.state={
          photo1: null,
          photo2: null,
          scooter:{},
          show_loading:false,
          show_msg:"Loading...",
          before_location:{},
          after_location:{},
          send_now:false
        }
    }
    componentDidMount() {
      
    }
    back2page(){
      this.props.navigation.navigate('Home');
    }
    takePhoto1(){
      this.selectPhotoTapped(1);
    }
    retakePhoto1(){
      this.setState({photo1: null});
      this.selectPhotoTapped(1);
    }
    takePhoto2(){
      if(this.state.photo2 == null){
        this.selectPhotoTapped(2);
      }
    }
    retakePhoto2(){
      this.setState({photo2: null});
      this.selectPhotoTapped(2);
    }
    link2Confirm(){
      this.setState({step:6,step_title:"最後確認"}); 
    }
    selectPhotoTapped(index) {
      ImagePicker.openCamera({
        compressImageMaxWidth: 800,
        compressImageMaxHeight: 800,
        includeBase64:true,
        compressImageQuality:0.6,
        forceJpg:true
      }).then(image => {
        switch(index){
          case 1 :
            this.setState({photo1:image.data});
          break;
          case 2 :
            this.setState({photo2:image.data});
          break;
        }
      });
    }
    clearData(){
      this.setState({
        chk_power:false,
        photo1: null,
        photo2: null,
        scooter:{},
        show_loading:false,
        show_msg:"Loading...",
        send_now:false
      });
    }
    Confirm(){
      if(this.state.photo1 == null || this.state.photo2 == null){
          Alert.alert('系統訊息',"請上傳照片",[{text: 'ok'}]);
          return false;
      }
      else{
          this.setState({send_now:true});
          var formData  = new FormData();    
          formData.append("scooter", this.state.scooter.id);
          formData.append("plate", this.state.scooter.plate);
          formData.append("operator", global.user_givenName);
          formData.append("operator_id", global.user_id);
          formData.append("before_location", this.state.before_location);
          formData.append("after_location", this.state.after_location);
          formData.append("photo1", 'data:image/jpeg;base64,'+this.state.photo1);
          formData.append("photo2", 'data:image/jpeg;base64,'+this.state.photo2);
          // 送出紀錄
          fetch(global.API+'/ticket/addChgBettery_record',{
            method: 'POST',
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
              Alert.alert('系統訊息',"已完成紀錄！",[{text: '回列表頁', onPress: () => {this.clearData();this.setState({send_now:false});this.props.navigation.navigate('Home')}}]);
            }else{
              Alert.alert('系統訊息',json.reason,[{text: 'ok'}]);
            }
          });
      }
      
    }
    render() {

        return (
            <SafeAreaView style={{flex: 1,justifyContent: 'center',alignItems: 'center',backgroundColor:'#2F3345',color:'#fff'}}>
                <TouchableHighlight onPress={()=>this.back2page()} style={{position:'absolute',top:10,left:10}}><View style={{flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}><Icon name="angle-left" color='#fff' size={25} /><Text style={{paddingLeft:10,color:'#fff',fontWeight:'bold',fontSize:13}}>返回</Text></View></TouchableHighlight>
                <View style={{justifyContent:'center',textAlign:'center',marginTop:10,paddingBottom:5,width:120,borderBottomColor:'#FF5722',borderBottomWidth:1}}>
                  <Text style={{ color: '#fff',fontSize:18,textAlign:'center' }}>移動車輛</Text>
                </View>
                <View style={{justifyContent:'space-around',marginTop:10,paddingBottom:5,borderBottomColor:'#C67B38',borderBottomWidth:1}}>
                        <Text style={{ color: '#fff',fontSize:18 }}>車輛照片</Text>
                      </View>
                      <View style={{flexDirection:'row',marginTop:10,justifyContent:'space-around'}}>
                        <View style={{width:150,height:200}}>
                          {show_photo1 == null ?(
                          <TouchableOpacity onPress={()=>this.takePhoto1()}>
                            <View style={[
                              styles.avatar,
                              styles.avatarContainer,
                            ]}>
                                <Icon name="camera-retro" size={30} color={"#333"} />
                            </View>
                          </TouchableOpacity>
                          ):(
                            <TouchableOpacity style={{width:150,height:200}} onPress={()=>this.retakePhoto1()}>
                              <Image source={{uri: show_photo1}} style={{flex: 1,width: null,height: null,resizeMode:'contain'}}/>
                            </TouchableOpacity>
                          )}
                        </View>
                        <View style={{width:150,height:200}}>
                          {show_photo2 == null ?(
                          <TouchableOpacity onPress={()=>this.takePhoto2()}>
                            <View style={[
                              styles.avatar,
                              styles.avatarContainer,
                            ]}>
                                <Icon name="camera-retro" size={30} color={"#333"} />
                            </View>
                          </TouchableOpacity>
                          ):(
                            <TouchableOpacity style={{width:150,height:200}} onPress={()=>this.retakePhoto2()}>
                              <Image source={{uri: show_photo2}} style={{flex: 1,width: null,height: null,resizeMode:'contain'}}/>
                            </TouchableOpacity>
                          )}
                          
                        </View>
                      </View>
                      <View style={{flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                      {this.state.send_now ? 
                        <Button title="傳送中..."  containerStyle={{width:'70%',marginTop:20}} raised={true} buttonStyle={{backgroundColor:'#FF3333'}} disabled  disabledStyle={{backgroundColor:'#e0e0e0'}}/>
                      :
                        <Button
                          title="確定送出"
                          containerStyle={{width:'70%',marginTop:20}}
                          buttonStyle={{backgroundColor:'#FF3333'}}
                          raised={true}
                          onPress={()=>this.Confirm()}
                          icon={<Icon
                                name="paper-plane"
                                size={15}
                                color="white"
                              />}
                          titleStyle={{marginLeft:10}}
                        />
                      }
                      </View> 

            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
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
  },
  listItem:{
    borderBottomWidth:1,borderBottomColor:'#EFF1F4'
  },
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

  header:{
      backgroundColor: '#ff5722',
      justifyContent: 'space-around',
      paddingTop:-25,
      height:50
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
});
// AppRegistry.registerComponent('default', () => ChargingBattery);