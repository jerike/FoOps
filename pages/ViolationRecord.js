import React, { Component } from 'react';
import {  Text,View,FlatList,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,Alert,ActionSheetIOS,ScrollView,ActivityIndicator,BackHandler } from 'react-native';
import { createDrawerNavigator, createAppContainer,NavigationActions } from 'react-navigation';
import { Card, ListItem,Header, Button,Image,SearchBar,ButtonGroup,Badge,Input } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome5';
import '../global.js';
import ViolationView from './ViolationView';
const API = global.API;

export default class ViolationRecord extends React.Component {
    constructor () {
      super()
      this.state = {
        show_loading:true,
        list:[],
        violation_modal:false,
        select_data:{}
      }
      this.onClose=this.onClose.bind(this);
      this.showDetail=this.showDetail.bind(this);
      this.showModal=this.showModal.bind(this);
    }
    componentWillMount() {
      if(this.props.navigation.getParam('scooter') != undefined){
        this.setState({scooter:this.props.navigation.getParam('scooter')},()=>{this.getRecord()});
      }else{
        this.props.navigation.goBack();
      }
    }
    componentDidMount(){
      if (Platform.OS === 'android') {  
        BackHandler.addEventListener('hardwareBackPress', ()=>{return true;});
      } 
    }
    getRecord(){
      var sid = this.state.scooter.id;
      fetch(global.API+'/scooter/'+sid+'/violation',{
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
          this.setState({list:json.data,show_loading:false});
      });
    }
    pad(number){ return (number < 10 ? '0' : '') + number }
    dateFormat(date){
      var format_date = new Date(date);
      var create_date = this.pad(format_date.getMonth()+1)+'/'+this.pad(format_date.getDate())+' '+this.pad(format_date.getHours())+':'+this.pad(format_date.getMinutes());
      return create_date;
    }
    showModal(key){
        this.setState({
          [key]: true,
        });
    }
    onClose(key){
        this.setState({
          [key]: false,
        });
    }

    showDetail(data){
      this.setState({select_data:data},()=>{setTimeout(()=>{this.showModal('violation_modal')},100)});
    }

    
    render() {
        const {scooter,list} = this.state;
        var header_title = scooter.plate+" 違規紀錄";
        var violation_option={
          onClose:this.onClose,
          violation_modal:this.state.violation_modal,
          scooter:this.state.scooter,
          data:this.state.select_data
        }
        return (
        <SafeAreaView style={{flex: 1,width:'100%', backgroundColor: '#EFF1F4'  }}>
            <Header
              centerComponent={{ text: header_title, style: { color: '#fff' } }}
              leftComponent={<TouchableHighlight onPress={()=>this.props.navigation.goBack()}><View style={{flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}><Icon name="angle-left" color='#fff' size={25} /><Text style={{paddingLeft:10,color:'#fff',fontWeight:'bold',fontSize:13}}>回詳細頁</Text></View></TouchableHighlight>}
              containerStyle={styles.header}
            />
            {this.state.show_loading &&(
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#ffffff" style={{marginBottom:5}} />
                <Text style={{color:'#fff'}}>Loading...</Text>
              </View>
            )}
            <ViolationView  violation_option={violation_option}/>
            <ScrollView>
              {
                list.map((l, i) => (
                  <ListItem
                    key={i}
                    title={l.type}
                    subtitle={l.subtype}
                    badge={{ value: this.dateFormat(l.created_at), textStyle: { color: '#fff' },badgeStyle:{backgroundColor:'#FF8800'}, containerStyle: { marginTop: -20 } }}
                    chevron
                    bottomDivider={true}
                    titleStyle={{fontSize:13}}
                    subtitleStyle={{fontSize:10,color:'#ccc'}}
                    onPress={()=>{this.showDetail(l)}}
                  />
                ))
              }
                
            </ScrollView>

        </SafeAreaView>
         
        );
    }
}

const styles = StyleSheet.create({
  loading:{
    position:'absolute',
    zIndex:101,
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
  }
});


