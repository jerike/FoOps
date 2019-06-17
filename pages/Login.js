import React, { Component } from 'react';
import { Text,TextInput, View,Button,Image,StyleSheet,TouchableOpacity,Alert,ProgressViewIOS } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import '../global.js';
export default class Login extends React.Component {

  
  constructor(props) {
    super(props);
    this.state = { email: null,password:null,progress:0,timeout:true };
    this.close_msg = this.close_msg.bind(this);
    this.login=this.login.bind(this);
  }
  componentWillMount() {
        
  }
  componentDidMount() {
    this.getStorage().done();
  }
  getStorage = async () => {
      try {
        const value = await AsyncStorage.getItem('@FoOps:token');
        if (value !== null) {
          this.props.navigation.navigate('Home');
        }
      } catch (error) {
        console.warn(error);
      }
  }
  login(){
    // this.props.navigation.navigate('Home');
    // return false;
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
      }
      else{
        Alert.alert('⚠️ Warning','登入失敗',[{text: '重新登入'}]);
      }
    })
    .then((json) => {
        var login = false;
        json.data.roles.map(function(data){
          if(data.Name == "OPERATOR"){
              var account = json.data.email;
              // 儲存資料
              this.setState({user_id:json.data.id,user_email:json.data.email,user_givenName:account.split('@')[0],token:json.token},()=>{this.setStorage()});
              login = true;
          }
        }.bind(this));

        if(login){
          this.setState({timeout:true});
          this.props.navigation.navigate('Home');

        }else{
          Alert.alert('⚠️ Warning','登入失敗',[{text: '您沒有權限，請洽系統管理員'}]);
        }

    });
  }
  setStorage = async () => {
    try {
      await AsyncStorage.setItem('@FoOps:user_id', this.state.user_id);
      await AsyncStorage.setItem('@FoOps:user_email', this.state.user_email);
      await AsyncStorage.setItem('@FoOps:user_givenName', this.state.user_givenName);
      await AsyncStorage.setItem('@FoOps:token', this.state.token);
    } catch (error) {
      console.log(error);
    }
  }
  close_msg(){
    this.setState({timeout:false});
  }


  render() {
    if(this.props.navigation.state.params != undefined){
      if(this.state.timeout && this.props.navigation.state.params.msg !=undefined){
          Alert.alert('⚠️ Warning',this.props.navigation.state.params.msg,[{text: 'OK',onPress: () => this.close_msg()}]);
      } 
    }
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' ,backgroundColor:'#2f3345' }}>
        <Image source={require('../img/gokube-logo.png')} style={{marginBottom:30}} />
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
        <TouchableOpacity style={styles.login_btn} onPress={this.login.bind(this)} >
           <Text style={{color:'#fff'}}> 登入 </Text>
        </TouchableOpacity>
      </View>
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