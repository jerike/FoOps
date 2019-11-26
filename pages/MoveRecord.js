import React, { Component } from 'react';
import {  Text,View,FlatList,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,Alert,ActionSheetIOS,ScrollView,ActivityIndicator,BackHandler } from 'react-native';
import { createDrawerNavigator, createAppContainer,NavigationActions } from 'react-navigation';
import { Card, ListItem,Header, Button,Image,SearchBar,ButtonGroup,Badge,Input } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome5';
import '../global.js';
const API = global.API;
import MoveView from './MoveView';

export default class MoveRecord extends React.Component {
    constructor () {
      super()
      this.state = {
        show_loading:true,
        list:[],
        moveview_modal:false,
        select_data:{}
      }
      this.onClose=this.onClose.bind(this);
      this.showDetail=this.showDetail.bind(this);
      this.showModal=this.showModal.bind(this);
    }
    componentWillMount() {
      this.getRecord();
    }
    componentDidMount(){
      if (Platform.OS === 'android') {  
        BackHandler.addEventListener('hardwareBackPress', ()=>{this.props.navigation.goBack();});
      } 
    }
    getRecord(){
      this.setState({show_loading:true});
      var uid = global.user_id;
      fetch(global.API+'/operator/'+uid+'/getMoveScooter_record/',{
        method: 'GET',
        credentials: 'include'
      })
      .then((response) => {
        console.warn(response);
            return response.json();
      })
      .then((json) => {
          if(json.data.length == 0){
            this.setState({list:[],show_loading:false});
          }else{
            this.setState({list:json.data,show_loading:false});
          }
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
      this.setState({select_data:data},()=>{setTimeout(()=>{this.showModal('moveview_modal')},100)});
    }

    
    render() {
        const {scooter,list,select_data,moveview_modal} = this.state;
        var moveview_option={
          onClose:this.onClose,
          moveview_modal:moveview_modal,
          scooter:scooter,
          data:select_data
        }
        return (
        <SafeAreaView style={{flex: 1,width:'100%', backgroundColor: '#EFF1F4'  }}>
            <Header
              centerComponent={{ text: "違規移車記錄", style: { color: '#fff' } }}
              leftComponent={<TouchableHighlight onPress={()=>this.props.navigation.navigate('Home')}><View style={{flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}><Icon name="angle-left" color='#fff' size={25} /><Text style={{paddingLeft:10,color:'#fff',fontWeight:'bold',fontSize:13}}>回列表頁</Text></View></TouchableHighlight>}
              containerStyle={styles.header}
              rightComponent={<TouchableHighlight onPress={()=>this.getRecord()}><Icon name="sync-alt" size={20} color="#ffffff"  /></TouchableHighlight>}
            />
            {this.state.show_loading &&(
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#ffffff" style={{marginBottom:5}} />
                <Text style={{color:'#fff'}}>Loading...</Text>
              </View>
            )}
            <MoveView  moveview_option={moveview_option}/>
            <ScrollView>
              {
                list.length == 0 ?(
                  <ListItem
                    key={"list_none"}
                    title="沒有任何違規移車記錄"
                    chevron
                    bottomDivider={true}
                    titleStyle={{fontSize:13}}
                    subtitleStyle={{fontSize:10,color:'#ccc'}}
                  />
                ):(
                  list.map((l, i) => (
                    <ListItem
                      key={i}
                      title={l.plate}
                      badge={{ value: this.dateFormat(l.created), textStyle: { color: '#fff' },badgeStyle:{backgroundColor:'#FF8800'}, containerStyle: { marginTop: -20 } }}
                      chevron
                      bottomDivider={true}
                      titleStyle={{fontSize:13}}
                      subtitleStyle={{fontSize:10,color:'#ccc'}}
                      onPress={()=>{this.showDetail(l)}}
                    />
                  )
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


