import React, { Component } from 'react';
import { Text,TextInput, View,Button,Image,StyleSheet,TouchableOpacity,Alert,ProgressViewIOS,Animated,Easing,ActivityIndicator,Vibration } from 'react-native';
import { CheckBox } from 'react-native-elements'
import AsyncStorage from '@react-native-community/async-storage';
import '../global.js';
export default class Login extends React.Component {

  
  constructor(props) {
    super(props);
    this.state = { email: null,password:null,progress:0,timeout:true,show_loading:false };
    this.close_msg = this.close_msg.bind(this);
    this.login=this.login.bind(this);
    this.removeItemValue=this.removeItemValue.bind(this);
  }
  componentWillMount() {
    // this.setState({show_login:false});
        this.setState({show_login:false,fadeInOpacity: new Animated.Value(0),save_login:false});
  }
  componentDidMount() {
    if(this.state.show_login){
      Animated.timing(this.state.fadeInOpacity, {
          toValue: 1, 
          duration: 500, 
          easing: Easing.ease
      }).start();
    }
    this.getStorage().done();
  }
  getStorage = async () => {
      try {
        const value = await AsyncStorage.getItem('@FoOps:token');
        if (value !== null) {
          global.user_id =  await AsyncStorage.getItem('@FoOps:user_id');
          global.user_email =  await AsyncStorage.getItem('@FoOps:user_email');
          global.user_givenName =  await AsyncStorage.getItem('@FoOps:user_givenName');
          global.avatar =  await AsyncStorage.getItem('@FoOps:avatar');
          global.token =  await AsyncStorage.getItem('@FoOps:token');
          this.props.navigation.navigate('Home');
        }else{
          console.warn('show_login');
          this.setState({show_login:true});
        }
        const email = await AsyncStorage.getItem('@FoOps:email');
        if (email !== null) {
          this.setState({email:email,save_login:true});
        }
        const pwd = await AsyncStorage.getItem('@FoOps:pwd');
        if (pwd !== null) {
          this.setState({password:pwd});
        }


      } catch (error) {
        console.warn(error);
      }
  }
  login(){
    // this.props.navigation.navigate('Home');
    // return false;
    this.setState({show_loading:true});
    var formData  = new FormData();
    formData.append("email",this.state.email);
    formData.append("password",this.state.password);
    fetch(global.API+'/user/login',{
        method: 'POST',
        body: formData,
        credentials: 'include'
    })
    .then((response) => {
      if(response.status == 200){
        return response.json();
      }else if(response.status == 403){
        Alert.alert('⚠️ Warning','您沒有權限，請洽系統管理員',[{text: '好的！'}]);
        this.setState({show_loading:false});
      }
      else{
        Alert.alert('⚠️ Warning','登入失敗',[{text: '重新登入'}]);
        this.setState({show_loading:false});
      }
    })
    .then((json) => {
        var login = false;
        json.data.roles.map(function(data){
          if(data.Name == "OPERATOR"){
              var account = json.data.email;
              // 儲存資料
              this.setState({user_id:json.data.id,user_email:json.data.email,user_givenName:account.split('@')[0],token:json.token,avatar:json.data.avatar},()=>{this.setStorage()});
              login = true;
          }
        }.bind(this));

        if(login){
          Vibration.vibrate(500);
          // this.setState({timeout:true});
          this.props.navigation.navigate('Home');
          this.setState({show_loading:false});

        }else{
          Alert.alert('⚠️ Warning','登入失敗',[{text: '您沒有權限，請洽系統管理員'}]);
          this.setState({show_loading:false});
        }

    });
  }
  setStorage = async () => {
    try {
      global.user_id =  this.state.user_id;
      global.user_email =  this.state.user_email;
      global.user_givenName =  this.state.user_givenName;
      global.avatar =  this.state.avatar;
      global.token =  this.state.token;
      await AsyncStorage.setItem('@FoOps:user_id', this.state.user_id);
      await AsyncStorage.setItem('@FoOps:user_email', this.state.user_email);
      await AsyncStorage.setItem('@FoOps:user_givenName', this.state.user_givenName);
      await AsyncStorage.setItem('@FoOps:avatar', this.state.avatar);
      await AsyncStorage.setItem('@FoOps:token', this.state.token);
      if(this.state.save_login){
        await AsyncStorage.setItem('@FoOps:email', this.state.email);
        await AsyncStorage.setItem('@FoOps:pwd', this.state.password);
      }else{
        await AsyncStorage.removeItem('@FoOps:email');
        await AsyncStorage.removeItem('@FoOps:pwd');
      }
    } catch (error) {
      console.warn(error);
    }
  }
  close_msg(){
    this.setState({timeout:false});
  }
  async removeItemValue(key) {
    try {
      await AsyncStorage.removeItem(key);
      this.setState({show_login:true});
    }
    catch(exception) {
      this.setState({show_login:true});
    }
  }
  
  render() {
    if(this.props.navigation.state.params != undefined){
      if(this.state.timeout && this.props.navigation.state.params.msg !=undefined){
          this.removeItemValue('@FoOps:token');
          this.setState({timeout:false});
          Alert.alert('⚠️ Warning',this.props.navigation.state.params.msg,[{text: 'OK',onPress: () => this.close_msg()}]);
      } 
      if(!this.state.show_login && this.props.navigation.state.params.logout){
        this.setState({show_login:true});
      }
    }
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' ,backgroundColor:'#2f3345' }}>
        <Image source={require('../img/gokube-logo.png')} style={{marginBottom:30}} />
        {this.state.show_loading &&(
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#ffffff" style={{marginBottom:5}} />
            <Text style={{color:'#fff'}}>Loading...</Text>
          </View>
        )}
        {this.state.show_login &&(
           <Animated.View style={{width:'100%',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  opacity: this.state.fadeInOpacity, 
                                  transform: [{
                                    translateY: this.state.fadeInOpacity.interpolate({
                                      inputRange: [0, 1],
                                      outputRange: [150, 0]
                                    }),
                                  }],}} >
           
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => this.setState({email:text})}
                  value={this.state.email}
                  placeholder='帳號'
                />
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => this.setState({password:text})}
                  value={this.state.password}
                  textContentType='password'
                  secureTextEntry={true}
                  placeholder='密碼'
                />
                <CheckBox title='紀錄登入資訊' checked={this.state.save_login} onPress={()=>this.setState({save_login:true})} containerStyle={{marginTop:10,marginBottom:10,backgroundColor:'transparent',borderWidth:0,}} textStyle={{color:'#fff'}}  />
                
                <TouchableOpacity style={styles.login_btn} onPress={this.login.bind(this)} >
                   <Text style={{color:'#fff'}}> 登入 </Text>
                </TouchableOpacity>
 
            </Animated.View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
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
  login_btn:{
    marginTop:30,
    backgroundColor:'#ff5722',
    padding:12,
    borderTopLeftRadius:5,
    borderTopRightRadius:5,
    borderBottomRightRadius:5,
    borderBottomLeftRadius:5,

  }

});