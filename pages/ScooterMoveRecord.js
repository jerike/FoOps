import React, { Component } from 'react';
import {  Text,View,FlatList,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,Alert,ActionSheetIOS,ScrollView,ActivityIndicator,BackHandler } from 'react-native';
import { createDrawerNavigator, createAppContainer,NavigationActions } from 'react-navigation';
import { Card, ListItem,Header, Button,Image,SearchBar,ButtonGroup,Badge,Input } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome5';
import '../global.js';
import MoveView from './MoveView';
const API = global.API;

export default class ScooterMoveRecord extends React.Component {
    constructor () {
      super()
      this.state = {
        show_loading:true,
        list:[],
        moveview_modal:false,
        select_data:{},
        scooter:{}
      }
      this.onClose=this.onClose.bind(this);
      this.showDetail=this.showDetail.bind(this);
      this.showModal=this.showModal.bind(this);
      this.clearData=this.clearData.bind(this);
      this.getRecord=this.getRecord.bind(this);
    }
    componentWillMount(){
      this.props.onRef(this);
    }
    onRef = (e) => {
      this.modal = e
    }
    getRecord(scooter){
      this.setState({show_loading:true,scooter:scooter});
      fetch(global.API+'/scooter/'+scooter.id+'/getMoveScooter_record_by_scooter/',{
        method: 'GET',
        credentials: 'include'
      })
      .then((response) => {
          return response.json();
      })
      .then((json) => {
        console.warn(json);
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
      this.setState({select_data:data},()=>{setTimeout(()=>{this.modal.get_position(1,data.before_location);this.modal.get_position(2,data.after_location);this.modal.getPhotos(data.id);this.showModal('moveview_modal')},100)});
      // this.setState({select_data:data},()=>{setTimeout(()=>{this.modal.getPhotos(data.id);this.showModal('moveview_modal')},100)});
    }
    clearData(){
      this.setState({list: []});
      this.props.move_record_option.onClose('move_modal');
    }
    
    render() {
        const {scooter,list,select_data,moveview_modal} = this.state;
        const {move_record_option} = this.props;
        var moveview_option={
          onClose:this.onClose,
          moveview_modal:moveview_modal,
          data:select_data
        }
        return (
        <Modal
          animationType="slide"
          transparent={false}
          visible={move_record_option.move_modal}
          presentationStyle="fullScreen"
          onRequestClose={()=>this.clearData()}
          >
          <SafeAreaView style={{flex: 1, backgroundColor: '#2F3345'}}>
            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                <View style={{justifyContent:'center',textAlign:'center',marginTop:5,marginLeft:10,marginBottom:10,width:120,borderBottomColor:'#ccc',borderBottomWidth:1}}>
                  <Text style={{ color: '#ff5722',fontSize:18,textAlign:'center' }}>{scooter.plate}</Text>
                </View>
                <View style={{  justifyContent: "flex-start", alignItems: "flex-end",marginRight:5,marginTop:5 }}>
                   <Icon name='times-circle' size={30} color="#fff"  onPress={() => {
                      this.clearData();
                    }} />
                </View>
            </View>
            <MoveView onRef={this.onRef} moveview_option={moveview_option}/>
            <ScrollView>
              {
                list.length == 0 ?(
                  <ListItem
                    key={"list_none"}
                    title="沒有任何違規移動紀錄"
                    chevron
                    bottomDivider={true}
                    titleStyle={{fontSize:13}}
                    subtitleStyle={{fontSize:10,color:'#ccc'}}
                  />
                ):(
                  list.map((l, i) => (
                    <ListItem
                      key={i}
                      title={this.dateFormat(l.created)}
                      badge={{ value: l.operator, textStyle: { color: '#fff' },badgeStyle:{backgroundColor:'#FF8800'} }}
                      chevron
                      bottomDivider={true}
                      titleStyle={{fontSize:13}}
                      subtitleStyle={{fontSize:12,color:'#666'}}
                      onPress={()=>{this.showDetail(l)}}
                    />
                  ))
                )
              }
                
            </ScrollView>

          </SafeAreaView>
        </Modal>
         
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


