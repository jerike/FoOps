import React, { Component } from 'react';
import { TextInput, View,StyleSheet,TouchableOpacity,TouchableHighlight,Alert,ScrollView,Animated,Easing,ActivityIndicator,Dimensions,PermissionsAndroid,Platform,SafeAreaView,BackHandler,AppRegistry} from 'react-native';
import { Text,Card, ListItem,Header, Button,Image,SearchBar,ButtonGroup,Avatar,Input,Divider   } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import '../global.js';
import ImagePicker from 'react-native-image-crop-picker';
import AndroidOpenSettings from 'react-native-android-open-settings'
import shallowCompare from 'react-addons-shallow-compare';
import ScooterMoveRecord from './ScooterMoveRecord';
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
          send_now:false,
          move_modal:false,
        }
        this.getLocation=this.getLocation.bind(this);
        this.onClose=this.onClose.bind(this);
        this.addRecord=this.addRecord.bind(this);
        this.Confirm=this.Confirm.bind(this);
    }
    onRef = (e) => {
      this.modal = e
    }
    componentDidMount(){
      if (Platform.OS === 'android') {  
        BackHandler.addEventListener('hardwareBackPress', ()=>{this.props.navigation.goBack();});
      } 
      this.setState({scooter:this.props.navigation.state.params.scooter});
      this.chk_location_permission();
    }
    shouldComponentUpdate(nextProps, nextState){
      return shallowCompare(this, nextProps, nextState);
    }   
    componentWillUpdate(nextProps,nextState){
      if(nextProps.navigation.state.params.scooter != this.state.scooter){
        this.setState({scooter:nextProps.navigation.state.params.scooter});
      }
    }
    async chk_location_permission(){
      if(Platform.OS == 'android'){
            const permissions = [
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]
            const granteds = await PermissionsAndroid.requestMultiple(permissions);
            if (granteds["android.permission.ACCESS_FINE_LOCATION"] === "granted") {
             // this.getPosition();
            } else {
              Alert.alert('⚠️ 定位失敗',"定位權限被禁止",[{text: 'OK'}]);
            }
      }
    }
    getPosition(index){
      const GeoLowAccuracy = () => {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (locLowAccuracy)=>{
              this.setState({highAccuracy:false});
              resolve(locLowAccuracy)
            },
            (error)=>{
              reject(error)
            },
            {enableHighAccuracy: false, timeout: 2000}
          )
        });
      };
      GeoLowAccuracy().then(locationData => {
          const positionData: any = locationData.coords;
          this.getLocation(index,positionData);
          // this.setState({MyPosition:positionData});
          // this.setState({show_user_location:true});
          // this.setState({setCenter:{latitude:positionData.latitude,longitude:positionData.longitude,latitudeDelta: 0.01,longitudeDelta: 0.01}});
      })
      .catch(error => Alert.alert('⚠️ 定位失敗',"無法取得您所在位置，請開啟定位服務",[{text: '不要！'},{text: '去設定', onPress: () => AndroidOpenSettings.locationSourceSettings()}]));
    }
    back2page(){
      this.props.navigation.navigate('Home');
    }
    takePhoto1(){
      this.getPosition(1);
      this.selectPhotoTapped(1);
    }
    retakePhoto1(){
      this.setState({photo1: null});
      this.selectPhotoTapped(1);
    }
    takePhoto2(){
      this.getPosition(2);
      this.selectPhotoTapped(2);
    }
    retakePhoto2(){
      this.setState({photo2: null});
      this.selectPhotoTapped(2);
    }
    getLocation(index,positionData){
      var location = positionData.latitude+","+positionData.longitude;
      switch(index){
        case 1:
          this.setState({location1:location});
        break;
        case 2:
          this.setState({location2:location});
        break;

      }
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
          formData.append("before_location", this.state.location1);
          formData.append("after_location", this.state.location2);
          formData.append("photo1", 'data:image/jpeg;base64,'+this.state.photo1);
          formData.append("photo2", 'data:image/jpeg;base64,'+this.state.photo2);
          // 送出紀錄
          fetch(global.API+'/ticket/addMoveScooter_record',{
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
              this.addRecord(this.state.scooter.id);
              Alert.alert('系統訊息',"已完成紀錄！",[{text: '回詳細頁', onPress: () => {this.clearData();this.setState({send_now:false});this.props.navigation.goBack()}}]);
            }else{
              Alert.alert('系統訊息',json.reason,[{text: 'ok', onPress: () => {this.setState({send_now:false})}}]);
            }
          }).catch( err => {
            Alert.alert('System',"API 更新中，請稍後再試！",[{text: '好的！'}]);
            this.setState({send_now:false});
            return false;
          });
      }
      
    }
    addRecord(id){
        var formData  = new FormData();
        formData.append("scooter_id", id);
        formData.append("ticket_status_id", 0);
        formData.append("operator", global.user_givenName);
        formData.append("operator_id", global.user_id);
        formData.append("zendesk", "");
        formData.append("scooter_status[]", 622);

        fetch(global.API+'/ticket/addworkrecord',{
            method: 'POST',
            mode: 'cors',
            body: formData,
            credentials: 'include'
        });
    }


    openRecord(){
      this.modal.getRecord(this.state.scooter);
      this.setState({move_modal:true});
    }
    onClose(key){
        this.setState({
          [key]: false,
        });
    }
    render() {
        const {photo1,photo2,scooter,show_msg,move_modal} = this.state;
        var show_photo1 = (photo1 != null) ? 'data:image/jpeg;base64,'+photo1 : null;
        var show_photo2 = (photo2 != null) ? 'data:image/jpeg;base64,'+photo2 : null;
        var move_record_option={
          onClose:this.onClose,
          move_modal:move_modal
        }
        return (
            <SafeAreaView style={{flex: 1,justifyContent: 'center',alignItems: 'center',backgroundColor:'#2F3345',color:'#fff'}}>
                <Header
                  centerComponent={<View style={{justifyContent:'center',textAlign:'center',marginTop:10,paddingBottom:5,width:120,borderBottomColor:'#f00',borderBottomWidth:1}}>
                                    <Text style={{ color: '#fff',fontSize:15,textAlign:'center' }}>{scooter.plate} </Text>
                                    <Text style={{ color: '#fff',fontSize:10,textAlign:'center' }}>[違規移動]</Text>
                                  </View>}
                  leftComponent={<TouchableHighlight onPress={()=>this.props.navigation.goBack()}><View style={{flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}><Icon name="angle-left" color='#fff' size={25} /><Text style={{paddingLeft:10,color:'#fff',fontWeight:'bold',fontSize:13}}>回詳細頁</Text></View></TouchableHighlight>}
                  rightComponent={<Button  titleStyle={{fontSize:11}}  title={"移動紀錄"} onPress={()=>this.openRecord()}/>}
                  containerStyle={styles.header}
                />
                <ScooterMoveRecord onRef={this.onRef} move_record_option={move_record_option} />
                <ScrollView style={{flex: 1}}>
                  <View style={{flexDirection:'row',marginTop:10,justifyContent:'space-around'}}>
                    <View>
                      <View style={{justifyContent:'center',textAlign:'left',marginBottom:10,paddingBottom:5,width:120,borderBottomColor:'#FFFF00',borderBottomWidth:1}}>
                        <Text style={{ color: '#fff',fontSize:18,textAlign:'center' }}>移動前拍照</Text>
                      </View>
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
                            <Image source={{uri: show_photo1}} style={{width:150,height:200,resizeMode:'contain'}}/>
                          </TouchableOpacity> 
                        )}
                      </View>
                    </View>
                    <View>
                      <View style={{justifyContent:'center',textAlign:'left',marginBottom:10,paddingBottom:5,width:120,borderBottomColor:'#FFFF00',borderBottomWidth:1}}>
                        <Text style={{ color: '#fff',fontSize:18,textAlign:'center' }}>移動後拍照</Text>
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
                            <Image source={{uri: show_photo2}} style={{width:150,height:200,resizeMode:'contain'}}/>
                          </TouchableOpacity>
                        )}
                        
                      </View>
                    </View>

                  </View>
                  
                </ScrollView> 
                <View style={{width:'100%',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                {this.state.send_now ? 
                  <Button title="傳送中..."  containerStyle={{width:'100%',marginTop:20}} raised={true} buttonStyle={{backgroundColor:'#FF3333'}} disabled  disabledStyle={{backgroundColor:'#e0e0e0'}}/>
                :
                  <Button
                    title="確定送出"
                    containerStyle={{width:'100%',marginTop:20}}
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
    width: 80,
    height: 80,
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
// AppRegistry.registerComponent('default', () => ChargingBattery);