import React, { Component } from 'react';
import {  Text,View,FlatList,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,Alert } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import { Card, ListItem,Header, Button,Image,SearchBar,ButtonGroup } from 'react-native-elements'
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import '../global.js';
import Maintenance from './Maintenance'
import Violation from './Violation'
const severe_title = global.severe_title;
const scootet_status = global.scootet_status;
const API = global.API;

var t = 0;
export default class ScooterDetail extends React.Component {
    constructor () {
      super()
      this.state = {
        scooter:{},
        condition:[],
        selectedIndex: 0,
        maintain_modal:false,
        violation_modal:false,
        sel_condition:[],
        top_other:"",
        medium_other:"",
        low_other:"",
        operator:"",
        operator_id:"",
      }
      this.newScooter=this.newScooter.bind(this);
      this.updateIndex = this.updateIndex.bind(this);
      this.showModal=this.showModal.bind(this);
      this.onClose=this.onClose.bind(this);
      this.onClickCondition=this.onClickCondition.bind(this);
      this.onChangeOther=this.onChangeOther.bind(this);
      this.getStorage=this.getStorage.bind(this);
      this.updateCondition=this.updateCondition.bind(this);
    }
    componentWillMount() {
        var sid = this.props.navigation.state.params.scooter;
        this.newScooter(sid);
        this.setState({sid:sid,condition:JSON.parse(global.condition)});
    }
    componentDidMount(){
      this.getStorage().done();
    }
    getStorage = async () => {
        try {
          const operator = await AsyncStorage.getItem('@FoOps:user_givenName');
          if (operator !== null) {
            this.setState({operator:operator});
          }
          const operator_id = await AsyncStorage.getItem('@FoOps:user_id');
          if (operator_id !== null) {
            this.setState({operator_id:operator_id});
          }
        } catch (error) {
          console.warn(error);
        }
    }
    pad(number){ return (number < 10 ? '0' : '') + number }
    dateFormat(date){
      var format_date = new Date(date);
      var create_date = this.pad(format_date.getMonth()+1)+'/'+this.pad(format_date.getDate())+' '+this.pad(format_date.getHours())+':'+this.pad(format_date.getMinutes());
      return create_date;
    }
    newScooter(sid){
        this.setState({sid:sid});
        fetch(global.API+'/scooter/'+sid,{
          method: 'GET',
          credentials: 'include'
        })
        .then((response) => {
            if(response.status == 200){
              return response.json();
            }else{
              this.props.navigation.navigate('Login',{msg:"登入逾時，請重新登入"});
            }
        })
        .then((json) => {
          if(json.code == 1){
            this.setState({scooter:json.data});
          }else{
             Alert.alert('⚠️ Warning',json.reason,[{text: '好的！',onPress: () => this.props.navigation.goBack()}]);           
          }
        });
    }

    
    get_status_type(type){
        var result = "";
        var scooter_color = ['#c2c0c2','#8cb162','#4a90e2','#d63246'];
        scootet_status.map(function(m,i){
            if(m.type == type){
                result = <Text style={{color:scooter_color[i]}} key={i}>{m.title}</Text>;
            }
        })
        return result;
    }
    get_severe_lvl(severe,output){
        var result = "";
        var color=['#FF3333','#ff5722','#f5a623','#7ed321'];

        if(output == "text"){
            result = severe_title[severe-1];
        }else{
            result = <Text style={{color:color[severe-1]}}>{severe_title[severe-1]}</Text>;
        }

        return result;
    }
    getConditions(id){
        var result = "";
        this.state.condition.map(function(m, i){
            if(parseInt(m.id) == parseInt(id)){
              var description = m.description;
              result = description;
            }
        });
        return result;
    }
    
    get_status_type(type){
        var result = "";
        var scooter_color = ['#c2c0c2','#8cb162','#4a90e2','#d63246'];
        scootet_status.map(function(m,i){
            if(m.type == type){
                result = <Text style={{color:scooter_color[i]}} key={i}>{m.title}</Text>;
            }
        })
        return result;
    }
    get_severe_lvl(severe,output){
        var result = "";
        var color=['#FF3333','#ff5722','#f5a623','#7ed321'];

        if(output == "text"){
            result = severe_title[severe-1];
        }else{
            result = <Text style={{color:color[severe-1]}}>{severe_title[severe-1]}</Text>;
        }

        return result;
    }
    getConditions(id){
        var result = "";
        this.state.condition.map(function(m, i){
            if(parseInt(m.id) == parseInt(id)){
              var description = m.description;
              result = description;
            }
        });
        return result;
    }
    ListHeaderComponent(){
      return(
         <View style={{height:40,backgroundColor:'#fff',justifyContent: 'center',borderBottomWidth:1,borderBottomColor:'#f5f5f5'}}>
           <Text style={{textAlign:'center',fontSize:16,fontWeight:'bold'}}>- 車輛狀況 -</Text>
         </View>
      );
    }
    ListFooterComponent(){
      return(
         <View>
           <Button buttonStyle={{backgroundColor:'#f00'}} icon={<Icon name="calendar" size={15} color="white" style={{marginRight:10}} type="outline" />} title="維護工單"  />
         </View>
      );
    }
    onChangeOther(key,value){
      this.setState({[key]:value});
    }
    updateCondition(id){
        var formData  = new FormData();
        formData.append("scooter_id", id);
        formData.append("ticket_status_id", 0);
        formData.append("operator", this.state.operator);
        formData.append("operator_id", this.state.operator_id);
        formData.append("zendesk", "");

        var sel_condition = this.state.sel_condition;
        sel_condition.map(function(m,i){
            formData.append("scooter_status[]", m);
        });

        formData.append("top_other", this.state.top_other);
        formData.append("medium_other", this.state.medium_other);
        formData.append("low_other", this.state.low_other);

        console.warn(formData);
        fetch(API+'/ticket',{
            method: 'POST',
            mode: 'cors',
            body: formData,
            credentials: 'include'
        })
        .then((response) => response.json())
        .then((data) => {
          if(data.code == 1){
            this.onClose('maintain_modal');
            this.newScooter(id);

          }else{
            alert(data.reason);
          }
        });
    }
    updateIndex (selectedIndex) {
      this.setState({selectedIndex})
    }
    onClickCondition(id){
        var sel_condition = [];
        if(this.state.sel_condition != undefined){
            sel_condition = this.state.sel_condition;
        }
        var index = sel_condition.indexOf(id);
        if (index == -1) {
            sel_condition.push(id);
            this.setState({sel_condition: sel_condition});
        }else{
            sel_condition.splice(index, 1);
            this.setState({sel_condition: sel_condition});
        }
        
        
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
    showMaintain(){
      if(this.state.scooter.ticket != undefined){
          const scooter_conditions = this.state.scooter.ticket.scooter_conditions;
          this.setState({sel_condition:scooter_conditions});
      }
      this.showModal('maintain_modal');
    }
    showViolation(){
      this.showModal('violation_modal');
    }
    render() {
        
        const {search,selectedIndex,toSearch,scooter} = this.state;

        var get_props_sid = this.props.navigation.getParam('scooter');
        if(this.state.sid != get_props_sid){
          this.newScooter(get_props_sid);
        }
        var conditions = [];
        var other_conditions = [];
        var scooter_conditions = [];
        var severe_lvl = this.get_severe_lvl(scooter.severe);
        var stats_type = this.get_status_type(scooter.status);
        SCooter_ticket = scooter.ticket;
        if(SCooter_ticket != undefined){
          other_conditions = SCooter_ticket.other_conditions;
          scooter_conditions = SCooter_ticket.scooter_conditions;
        }
        if(scooter.ticket){
          if(scooter.ticket.scooter_conditions){
            scooter.ticket.scooter_conditions.map(function(d,k){
              var description = this.getConditions(d);
                if(description == "其他"){
                    var other_summary = "";
                    other_summary += description;
                    scooter.ticket.other_conditions.map(function(s,i){
                        if(s.id == d){
                            other_summary += ":"+s.summary;
                            
                        }
                    });
                    conditions.push(other_summary);
                }else{
                    conditions.push(description);
                }
            }.bind(this));
            
          }
        }
        
        const maintain_option={
          onClose:this.onClose,
          maintain_modal:this.state.maintain_modal,
          scooter:this.state.scooter,
          onClickCondition:this.onClickCondition,
          sel_condition:this.state.sel_condition,
          onChangeOther:this.onChangeOther,
          updateCondition:this.updateCondition
        }
        const violation_option={
          onClose:this.onClose,
          violation_modal:this.state.violation_modal,
          scooter:this.state.scooter,
        }

        return (
        <View style={{flex: 1, backgroundColor: '#EFF1F4'}}>
            <Header
              centerComponent={<Text color='#fff'>{scooter.plate}</Text>}
              rightComponent={{ icon: 'menu', color: '#fff' }}
              leftComponent={<TouchableHighlight style={{width:40}}><Icon name="angle-left" color='#fff' size={25} onPress={()=>this.props.navigation.goBack()}/></TouchableHighlight>}
              containerStyle={{
                backgroundColor: '#ff5722',
                justifyContent: 'space-around',
              }}
            />
            <Maintenance  maintain_option={maintain_option}/>
            <Violation  violation_option={violation_option}/>

            <ListItem key={"li_0"} leftAvatar={<Icon name="motorcycle" />} title="車輛編號" subtitle={scooter.id+""} style={styles.listItem} />
            <ListItem key={"li_1"} leftAvatar={<Icon name="battery-full" />} title="電量" subtitle={scooter.power+"%"} style={styles.listItem} />
            <ListItem key={"li_2"} leftAvatar={<Icon name="history" />} title="未租用天數" subtitle={scooter.range_days+"天"} style={styles.listItem} />
            <ListItem key={"li_3"} leftAvatar={<Icon name="info" />} title="車輛狀態" subtitle={severe_lvl} style={styles.listItem} />
            <ListItem key={"li_4"} leftAvatar={<Icon name="unlock-alt" />} title="服務狀態" subtitle={stats_type} style={styles.listItem} />
            
            {conditions &&(
                <FlatList  
                  style={{marginTop:20}}
                  data={conditions}
                  renderItem={({item, index}) => <ListItem key={"fl_"+index} leftAvatar={<Icon name="wrench" />} title={item}  style={styles.listItem} />}
                  ListHeaderComponent={this.ListHeaderComponent}
                  
                />
            )}
            <View style={{flexDirection:'row',backgroundColor:'#fff',borderTopWidth:1,borderTopColor:'#ccc',paddingTop:10,paddingBottom:10,paddingLeft:20,paddingRight:20,justifyContent:'space-between',alignItems: "center"}}>
              <Button  icon={<Icon name="tasks" size={25} color="#6A7684"   />}  type="outline" buttonStyle={{borderWidth:0}} />
              <Button  icon={<Icon name="directions" size={25} color="#6A7684"   />}  type="outline" buttonStyle={{borderWidth:0}} />
              <Button  icon={<Icon name="exclamation-circle" size={50} color="#6A7684"   />}  type="outline" buttonStyle={{borderWidth:0}} onPress={()=>this.showViolation()} />
              <Button  icon={<Icon name="motorcycle" size={25} color="#6A7684"   />}  type="outline" buttonStyle={{borderWidth:0}} />
              <Button  icon={<Icon name="tools" size={25} color="#6A7684"   />}  type="outline" buttonStyle={{borderWidth:0}} onPress={()=>this.showMaintain()} />
            </View>
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
  listItem:{
    borderBottomWidth:1,borderBottomColor:'#EFF1F4'
  }
});


