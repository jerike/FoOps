import React, { Component } from 'react';
import { Text,TextInput, View,Button,Image,StyleSheet,TouchableOpacity,Alert,ProgressViewIOS,Animated,Easing,ActivityIndicator,Vibration } from 'react-native';
import { CheckBox } from 'react-native-elements'
import AsyncStorage from '@react-native-community/async-storage';
import '../global.js';
import shallowCompare from 'react-addons-shallow-compare';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from 'react-native-chart-kit'
export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = { show_loading:false,scooter:[] };
    }
    componentWillMount() {
        this.getStorage().done();

    }
    componentDidMount() {

    }
    //取得電動車資訊
    get_scooter(){
        var theTime = new Date();
        var reload_time = this.pad(theTime.getMonth()+1)+'/'+this.pad(theTime.getDate())+' '+this.pad(theTime.getHours())+':'+this.pad(theTime.getMinutes())+':'+this.pad(theTime.getSeconds());
        this.setState({reload_time:reload_time});

        if (global.scooters.length == 0) {
            this.fetch_scooters();
        }else{
            this.setState({scooter:global.scooters});
        }
    }
    fetch_scooters(){
        var result = []
        fetch(global.API+'/scooter',{
          method: 'GET',
          credentials: 'include'
        })
        .then((response) => {
            if(response.status == 200){
              return response.json();
            }else{
              this.props.navigation.navigate('TimeOut');
            }
        })
        .then((json) => {
            global.scooters = json.data;
            this.setState({scooter:json.data});
            this.setStorage.done();            
        });
    }
    getStorage = async () => {
      try {
        const value = await AsyncStorage.getItem('@FoOps:scooters');
        if (value !== null) {
          global.scooters = JSON.parse(value);
        }
      } catch (error) {
        console.warn(error);
      }
    }
    setStorage = async () => {
    try {
      await AsyncStorage.setItem('@FoOps:scooters', JSON.stringify(global.scooters));
    } catch (error) {
      console.warn(error);
    }
  }
    render() {
        return (
          <ScrollView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' ,backgroundColor:'#2f3345' }}>
            <View>

            </View>
           
          </ScrollView>
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