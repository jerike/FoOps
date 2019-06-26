import React, { Component } from 'react';
import { Text,TextInput, View,Button,Image,StyleSheet,TouchableOpacity,Alert,ProgressViewIOS,Animated,Easing,ActivityIndicator,Vibration } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import '../global.js';
export default class Logout extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.removeStorage();
  }
  removeStorage = async () => {
      let keys = ['@FoOps:token','@FoOps:user_id','@FoOps:user_email','@FoOps:user_givenName','@FoOps:avatar',];
      AsyncStorage.multiRemove(keys, (err) => {
          setTimeout(()=>{
            this.props.navigation.navigate('Login',{logout:true});
          },1000);
      });
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' ,backgroundColor:'#2f3345' }}>
          <ActivityIndicator size="large" color="#ffffff" style={{marginBottom:20}} />
          <Text style={{color:'#fff'}}>登出中...</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  
});