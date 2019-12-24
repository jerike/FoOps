import React, { Component } from 'react';
import { TextInput, View,StyleSheet,TouchableOpacity,Image,TouchableHighlight,Alert,ScrollView,Animated,Easing,ActivityIndicator,Dimensions,SafeAreaView,BackHandler,AppRegistry} from 'react-native';
import { Text,Card, ListItem,Header, Button,SearchBar,ButtonGroup,Avatar,Input,Divider   } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import '../global.js';
import ImagePicker from 'react-native-image-crop-picker';
import shallowCompare from 'react-addons-shallow-compare';

export default class BrokenTrack extends React.Component {
    constructor(props) {
        super(props);
        this.state={
          chk_power:false,
          content:null,
          fix_cost:null,
          photo1: null,
          photo2: null,
          scooter:{},
          show_loading:false,
          show_msg:"Loading...",
          after_power:"?",
          send_now:false,
        }
        this.selectPhotoTapped = this.selectPhotoTapped.bind(this);
        this.back2page=this.back2page.bind(this);
    }
    componentDidMount() {
      this.setState({scooter:this.props.navigation.state.params.scooter});
    }
    shouldComponentUpdate(nextProps, nextState){
      return shallowCompare(this, nextProps, nextState);
    }   
    componentWillUpdate(nextProps,nextState){
      if(nextProps.navigation.state.params.scooter != this.state.scooter){
        this.setState({scooter:nextProps.navigation.state.params.scooter});
      }
    }
    back2page(){
      this.clearData();
      this.props.navigation.navigate('Home');
    }
    

    SelectOperation(){
      var BUTTONS = [
        '開啟相機',
        '從相簿選擇',
        '取消',
      ];

      var DESTRUCTIVE_INDEX = 1;
      var CANCEL_INDEX = 2;
      ActionSheet.showActionSheetWithOptions({
        title:'拍照/上傳',
        options: BUTTONS,
        cancelButtonIndex: CANCEL_INDEX,
        destructiveButtonIndex: DESTRUCTIVE_INDEX,
        tintColor: '#ff5722'
      },
      (buttonIndex) => {
        switch(buttonIndex){
          case 0:
            this.selectPhotoTapped('camera');
          break;
          case 1:
            this.selectPhotoTapped('album');
          break;
        }
      });
    }
    selectPhotoTapped(type) {
      if(type == "album"){
        ImagePicker.openPicker({
          compressImageMaxWidth: 800,
          compressImageMaxHeight: 800,
          minFiles:2,
          maxFiles:4,
          multiple: true,
          includeBase64:true,
          compressImageQuality:0.6,
          forceJpg:true
        }).then(image => {
          if(image.length > 0){
            if(this.state.photos.length > 0){
              var photos = this.state.photos;
              this.setState({photos:photos.concat(image)});
            }else{
              this.setState({photos:image});
            }
          }
        });
      }else{
        ImagePicker.openCamera({
          compressImageMaxWidth: 800,
          compressImageMaxHeight: 800,
          includeBase64:true,
          compressImageQuality:0.6,
          forceJpg:true
        }).then(image => {
          this.setState({photos:this.state.photos.concat(image)});
        });
      }
    }
    clearData(){
      this.setState({
        photos: [],
        scooter:{},
        show_loading:false,
        show_msg:"Loading...",
        send_now:false
      });
    }
    Confirm(){
      if(this.state.content == null){
          Alert.alert('系統訊息',"請輸入車輛狀況",[{text: 'ok'}]);
          return false;
      }

      else{
          this.setState({send_now:true});
          var formData  = new FormData();    
          formData.append("scooter", this.state.scooter.id);
          formData.append("plate", this.state.scooter.plate);
          formData.append("operator", global.user_givenName);
          formData.append("operator_id", global.user_id);
          formData.append("content", this.state.content);
          formData.append("fix_cost", this.state.fix_cost);
          for (var i = 0; i < this.state.photos.length; i++) {
            var photo = "";
            if(this.state.photos[i] != undefined){
              photo = 'data:image/jpeg;base64,' + this.state.photos[i].data;
            }
            formData.append("photo[]",photo);
          }

          // 送出紀錄
          fetch(global.API+'/track/broken',{
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
    render() {
        const {step,step_title,chk_power,scooter,show_msg,after_power,pumpup,last_pump_date} = this.state;
        var photos = this.state.photos.map(function(m,i){
            if(i <= 3){
              let source = 'data:image/jpeg;base64,' + m.data;
              return (<View
                      style={[
                        styles.avatar,
                        styles.avatarContainer,
                      ]}
                      key={"photo"+i}
                    >
                      <Image style={styles.avatar} source={{uri: source}} />
                    </View>
              );
            }
        })
        return (
            <SafeAreaView style={{flex: 1,justifyContent: 'center',alignItems: 'center',backgroundColor:'#2F3345',color:'#fff'}}>
                <Header
                  centerComponent={<View style={{justifyContent:'center',textAlign:'center',marginTop:10,paddingBottom:5,width:120,borderBottomColor:'#16B354',borderBottomWidth:1}}>
                                    <Text style={{ color: '#fff',fontSize:18,textAlign:'center' }}>車輛換電</Text>
                                  </View>}
                  leftComponent={<TouchableHighlight onPress={()=>this.props.navigation.goBack()}><View style={{flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}><Icon name="angle-left" color='#fff' size={25} /><Text style={{paddingLeft:10,color:'#fff',fontWeight:'bold',fontSize:13}}>回詳細頁</Text></View></TouchableHighlight>}
                  rightComponent={<Text style={{color:'#ff5722'}}>{scooter.plate}</Text>}
                  containerStyle={styles.header}
                />
                {this.state.show_loading &&(
                  <View style={styles.loading}>
                    <ActivityIndicator size="large" color="#ffffff" style={{marginBottom:5}} />
                    <Text style={{color:'#fff'}}>{show_msg}</Text>
                  </View>
                )}
                <ScrollView style={{width:'100%'}}>
                  <View style={{justifyContent:'center',alignItems: 'center'}}>
                    <View style={{width:'80%',justifyContent:'center'}}>
                      <View style={{marginTop:10,marginBottom:10,justifyContent:'space-around',flexDirection:'row'}}>
                        <View>
                          <View style={{justifyContent:'space-around',marginTop:10,paddingBottom:5,borderBottomColor:'#C67B38',borderBottomWidth:1}}>
                            <Text style={{ color: '#fff',fontSize:18 }}>車輛狀況</Text>
                          </View>
                          <TextInput
                            multiline={true}
                            numberOfLines={4}
                            onChangeText={(text) => this.setState({content})}
                            value={this.state.content}/>
                        </View>
                        <View>
                          <View style={{justifyContent:'space-around',marginTop:10,paddingBottom:5,borderBottomColor:'#C67B38',borderBottomWidth:1}}>
                            <Text style={{ color: '#fff',fontSize:18 }}>修復費用</Text>
                          </View>
                          <TextInput
                            multiline={true}
                            numberOfLines={4}
                            onChangeText={(text) => this.setState({fix_cost})}
                            value={this.state.fix_cost}/>
                        </View>
                      </View>

                      <View style={{justifyContent:'space-around',marginTop:10,paddingBottom:5,borderBottomColor:'#C67B38',borderBottomWidth:1}}>
                        <Text style={{ color: '#fff',fontSize:18 }}>上傳照片</Text>
                      </View>
                      <View style={{flexDirection:'row',justifyContent: "space-around",alignItems: "flex-start",marginTop:10}}>
                        
                        {photos}
                        {this.state.photos.length < 4 && (
                          <TouchableOpacity onPress={()=>this.SelectOperation()}>
                            <View style={[
                              styles.avatar,
                              styles.avatarContainer,
                            ]}>
                                <Text>+</Text>
                            </View>
                          </TouchableOpacity>
                        )}
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
// AppRegistry.registerComponent('default', () => ChargingBattery);