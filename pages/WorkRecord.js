import React, { Component } from 'react';
import {  Text,View,FlatList,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,Alert,ActionSheetIOS,ScrollView,ActivityIndicator,BackHandler } from 'react-native';
import { createDrawerNavigator, createAppContainer,NavigationActions } from 'react-navigation';
import { Card, ListItem,Header, Button,Image,SearchBar,ButtonGroup,Badge,Input } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome5';
import '../global.js';
import ChBView from './ChBView';
const API = global.API;

export default class WorkRecord extends React.Component {
    constructor () {
      super()
      this.state = {
        show_loading:true,
        list:[],
        chbview_modal:false,
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
    onRef = (e) => {
      this.modal = e
    }
    getRecord(){
      this.setState({show_loading:true});
      var uid = global.user_id;
      fetch(global.API+'/operator/'+uid+'/getChgBettery_record/',{
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
      this.setState({select_data:data},()=>{setTimeout(()=>{this.modal.getPhotos(data.id);this.modal.getTirePumpRecord(data.id);this.showModal('chbview_modal')},100)});
    }

    
    render() {
        const {scooter,list,select_data,chbview_modal} = this.state;
        var chbview_option={
          onClose:this.onClose,
          chbview_modal:chbview_modal,
          scooter:scooter,
          data:select_data
        }
        return (
        <SafeAreaView style={{flex: 1,width:'100%', backgroundColor: '#EFF1F4'  }}>
            <Header
              centerComponent={{ text: "換電記錄", style: { color: '#fff' } }}
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
            <ChBView onRef={this.onRef} chbview_option={chbview_option}/>
            <ScrollView>
              {
                list.length == 0 ?(
                  <ListItem
                    key={"list_none"}
                    title="沒有任何換電記錄"
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
                      subtitle={l.before_power+" > "+l.after_power}
                      badge={{ value: this.dateFormat(l.created), textStyle: { color: '#fff' },badgeStyle:{backgroundColor:'#FF8800'}, containerStyle: { marginTop: -20 } }}
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


