import React, { Component } from 'react';
import { TextInput, View,StyleSheet,TouchableOpacity,Image,TouchableHighlight,Alert,ScrollView,Platform,Animated,Easing,ActivityIndicator,Dimensions,SafeAreaView,BackHandler,AppRegistry} from 'react-native';
import { Text,Card, ListItem,Header, Button,SearchBar,ButtonGroup,Avatar,Input,Divider   } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import '../global.js';
import ImagePicker from 'react-native-image-crop-picker';
import shallowCompare from 'react-addons-shallow-compare';
import ScooterTireRecord from './ScooterTireRecord';
export default class TirePump extends React.Component {
    constructor(props) {
        super(props);
        this.state={
          chk_power:false,
          photo1: null,
          photo2: null,
          scooter:{},
          show_loading:false,
          show_msg:"Loading...",
          after_power:"?",
          send_now:false,
          pumpup:false,
          last_pump_date:"",
          str_modal:false,
        }
        this.selectPhotoTapped = this.selectPhotoTapped.bind(this);
        this.back2page=this.back2page.bind(this);
        this.ChkTirePressure=this.ChkTirePressure.bind(this);
        this.onClose=this.onClose.bind(this);
    }
    onRef = (e) => {
      this.modal = e
    }
    componentDidMount(){
      this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        this.props.navigation.goBack();
        return true;
      });
      this.setState({scooter:this.props.navigation.state.params.scooter},()=>{this.ChkTirePressure()});
    }
    componentWillUnmount() {
      this.backHandler.remove();
    }
    shouldComponentUpdate(nextProps, nextState){
      return shallowCompare(this, nextProps, nextState);
    }   
    componentWillUpdate(nextProps,nextState){
      if(nextProps.navigation.state.params.scooter != this.state.scooter){
        this.setState({scooter:nextProps.navigation.state.params.scooter},()=>{this.ChkTirePressure()});
      }
    }
    back2page(){
      this.clearData();
      this.props.navigation.navigate('Home');
    }
    openRecord(){
      this.modal.getRecord(this.state.scooter);
      this.setState({str_modal:true});
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
    ChkTirePressure(){
      fetch(global.API+'/scooter/'+this.state.scooter.id+'/tire_pressure',{
        method: 'GET',
        credentials: 'include'
      })
      .then((response) => {
            return response.json();
      })
      .then((json) => {
        console.warn(json);
        if(json.code == 1){
          this.setState({pumpup:true});
        }
        if(json.last_date != undefined){
          if(json.last_date == "-"){
            this.setState({last_pump_date:"無紀錄"});
          }else{
            this.setState({last_pump_date:"上次紀錄："+json.last_date});
          }
          
        }
      });
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
        after_power:"?",
        send_now:false,
        str_modal:false
      });
    }
    Confirm(){
      if(this.state.photo1 == null || this.state.photo1 == null){
          Alert.alert('系統訊息',"請上傳胎壓照片",[{text: 'ok'}]);
          return false;
      }
      else{
          this.setState({send_now:true});
          var formData  = new FormData();    
          formData.append("scooter", this.state.scooter.id);
          formData.append("plate", this.state.scooter.plate);
          formData.append("operator", global.user_givenName);
          formData.append("operator_id", global.user_id);
          formData.append("photo1", 'data:image/jpeg;base64,'+this.state.photo1);
          formData.append("photo2", 'data:image/jpeg;base64,'+this.state.photo2);

          // 送出紀錄
          fetch(global.API+'/ticket/addTirePump_record',{
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
              Alert.alert('系統訊息',json.reason,[{text: 'ok', onPress: () => {this.setState({send_now:false})}}]);
            }
          });
      }
      
    }
    onClose(key){
        this.setState({
          [key]: false,
        });
    }
    render() {
        const {step,step_title,chk_power,photo1,photo2,scooter,show_msg,after_power,pumpup,last_pump_date,str_modal} = this.state;
        var show_photo1 = (photo1 != null) ? 'data:image/jpeg;base64,'+photo1 : null;
        var show_photo2 = (photo2 != null) ? 'data:image/jpeg;base64,'+photo2 : null;
        var tire_record_option={
          onClose:this.onClose,
          str_modal:str_modal
        }

        return (
            <SafeAreaView style={{flex: 1,justifyContent: 'center',alignItems: 'center',backgroundColor:'#2F3345',color:'#fff'}}>
                <Header
                  centerComponent={<View style={{justifyContent:'center',textAlign:'center',marginTop:10,paddingBottom:5,width:120,borderBottomColor:'#16B354',borderBottomWidth:1}}>
                                    <Text style={{ color: '#fff',fontSize:18,textAlign:'center' }}>胎壓紀錄</Text>
                                  </View>}
                  leftComponent={<TouchableHighlight onPress={()=>this.props.navigation.goBack()}><View style={{flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}><Icon name="angle-left" color='#fff' size={25} /><Text style={{paddingLeft:10,color:'#fff',fontWeight:'bold',fontSize:13}}>回詳細頁</Text></View></TouchableHighlight>}
                  rightComponent={<Button buttonStyle={{backgroundColor:'#FF3333',color:'#fff',height:30}} titleStyle={{fontSize:11}}  title={scooter.plate} onPress={()=>this.openRecord()}/>}
                  containerStyle={styles.header}
                />
                {this.state.show_loading &&(
                  <View style={styles.loading}>
                    <ActivityIndicator size="large" color="#ffffff" style={{marginBottom:5}} />
                    <Text style={{color:'#fff'}}>{show_msg}</Text>
                  </View>
                )}
                <ScooterTireRecord onRef={this.onRef} tire_record_option={tire_record_option} />
                <ScrollView style={{width:'100%'}}>
                  <View style={{justifyContent:'center',alignItems: 'center'}}>
                    <View style={{width:'80%',justifyContent:'center'}}>
                      
                        <View>
                          <View style={{flexDirection:'row',justifyContent:'flex-start',alignItems:'flex-end',marginTop:10,paddingBottom:5,borderBottomColor:'#C67B38',borderBottomWidth:1}}>
                            <Text style={{ color: '#fff',fontSize:18 }}>胎壓照片</Text>
                            <Text style={{ color: '#fff',fontSize:11,marginLeft:20 }}>({last_pump_date})</Text>
                          </View>
                          <View style={{flexDirection:'row',marginTop:10,justifyContent:'space-around'}}>
                            <View style={{width:150,height:200}}>
                              {show_photo1 == null ?(
                              <TouchableOpacity onPress={()=>this.takePhoto1()}>
                                <View style={[
                                  styles.avatar,
                                  styles.avatarContainer,
                                ]}>
                                    <Icon name="camera-retro" size={50} color={"#333"} />
                                    <Text>前胎壓</Text>
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
                                    <Icon name="camera-retro" size={50} color={"#333"} />
                                    <Text>後胎壓</Text>
                                </View>
                              </TouchableOpacity>
                              ):(
                                <TouchableOpacity style={{width:150,height:200}} onPress={()=>this.retakePhoto2()}>
                                  <Image source={{uri: show_photo2}} style={{flex: 1,width: null,height: null,resizeMode:'contain'}}/>
                                </TouchableOpacity>
                              )}
                              
                            </View>
                          </View>
                        </View>
                      
                    </View>                        
                  </View>
                  
                </ScrollView>
                <View style={{width:'100%',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                  {this.state.send_now ? 
                    <Button title="傳送中..."  containerStyle={{width:'100%',marginTop:20}} raised={true} buttonStyle={{backgroundColor:'#FF3333',borderRadius:0}} disabled  disabledStyle={{backgroundColor:'#e0e0e0'}}/>
                  :
                    <Button
                      title="確定送出"
                      containerStyle={{width:'100%',marginTop:20}}
                      buttonStyle={{backgroundColor:'#FF3333',borderRadius:0}}
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
      backgroundColor: '#2F3345',
      justifyContent: 'space-around',
      paddingTop:-25,
      height:50,
      borderBottomWidth:0
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    resizeMode:'contain'
  },
  avatar2: {
    width: 200,
    height: 300,
    resizeMode:'contain'
  },
  avatarContainer: {
    backgroundColor: '#F5F5F5',
    borderColor: '#9B9B9B',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
