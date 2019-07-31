import React, { Component } from 'react';
import {  Text,View,FlatList,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,Alert,ActionSheetIOS,ScrollView,ActivityIndicator,BackHandler } from 'react-native';
import { createDrawerNavigator, createAppContainer,NavigationActions } from 'react-navigation';
import { Card, ListItem,Header, Button,Image,SearchBar,ButtonGroup,Badge,Input } from 'react-native-elements'
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import '../global.js';
import Maintenance from './Maintenance'
import Violation from './Violation'
import Direction from './Direction'
import Controller from './Controller'
import ActionSheet from 'react-native-action-sheet';
const severe_title = global.severe_title;
const scootet_status = global.scootet_status;
const API = global.API;
const icon = (name: string) => <Icon key={name} name={name} size={24} />;
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
        direction_modal:false,
        controller_modal:false,
        sel_condition:[],
        top_other:"",
        medium_other:"",
        low_other:"",
        operator:"",
        operator_id:"",
        tasks:[],
        task:"",
        remark:null
      }
      this.newScooter=this.newScooter.bind(this);
      this.updateIndex = this.updateIndex.bind(this);
      this.showModal=this.showModal.bind(this);
      this.onClose=this.onClose.bind(this);
      this.onClickCondition=this.onClickCondition.bind(this);
      this.onChangeOther=this.onChangeOther.bind(this);
      this.getStorage=this.getStorage.bind(this);
      this.updateCondition=this.updateCondition.bind(this);
      this.onPressTask=this.onPressTask.bind(this);
      this.removeRemark=this.removeRemark.bind(this);
      this.confirm_controller=this.confirm_controller.bind(this);
      this.ViewViolationRecord=this.ViewViolationRecord.bind(this);
    }
    componentWillMount() {
        var sid = this.props.navigation.state.params.scooter;
        this.newScooter(sid);
        this.setState({sid:sid,condition:global.condition,show_loading:true});
    }
    componentDidMount(){
      this.getStorage().done();
      if (Platform.OS === 'android') {  
            BackHandler.addEventListener('hardwareBackPress', ()=>{return true;});
      } 
    }
    getStorage = async () => {
        try {
          const task = await AsyncStorage.getItem('@FoOps:task');
          if (task !== null) {
            global.task = task;
            this.setState({task:task});
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
              this.props.navigation.navigate('TimeOut');
            }
        })
        .then((json) => {
          if(json.code == 1){
            this.setState({scooter:json.data,show_loading:false});
            this.getScooterType(sid);
            this.getRemark(sid);
          }else{
             Alert.alert('⚠️ Warning',json.reason,[{text: '好的！',onPress: () => this.props.navigation.goBack()}],{ cancelable: false });           
          }
        });
    }
    getScooterType(sid){
      fetch(global.API+'/scooter/'+sid+'/status',{
        method: 'GET',
        credentials: 'include'
      })
      .then((response) => response.json())
      .then((json)=>{
          this.setState({
              acc:json.data['acc']
          });
      });
    }
    getRemark(sid){
      fetch(global.API+'/scooter/'+sid+'/remark',{
        method: 'GET',
        credentials: 'include'
      })
      .then((response) => response.json())
      .then((json)=>{
          if(json.code == 1){
            // console.warn(json.data);
            if(json.data != null){
              this.setState({remark:json.data.remark});
            }else{
              this.setState({remark:null});
            }
          }else{
            Alert.alert('⚠️ Warning',json.reason,[{text: '好的！'}]);           
          }
          
      });
      
    }
    get_status_type(type){
        var result = "";
        var scooter_color = ['#ff5722','#33CCFF','#00DD00','#ccc'];
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
        formData.append("operator", global.user_givenName);
        formData.append("operator_id", global.user_id);
        formData.append("zendesk", "");

        var sel_condition = this.state.sel_condition;
        sel_condition && sel_condition.map(function(m,i){
            formData.append("scooter_status[]", m);
        });

        formData.append("top_other", this.state.top_other);
        formData.append("medium_other", this.state.medium_other);
        formData.append("low_other", this.state.low_other);

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
            Alert.alert('⚠️ Warning',json.reason,[{text: '好的！'}]);
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
    showDirection(){
      this.showModal('direction_modal');
    }
    showController(){
      var Status = "車輛下線(維護)";
      var button_status = "MAINTENANCE";
      if(this.state.scooter.status == "MAINTENANCE"){
        var Status = '車輛上線(營運)';
        var button_status = "FREE";
      }

      var BUTTONS = [
        Status,
        '啟動(4G)',
        '熄火(4G)',
        '車廂(4G)',
        '響鈴(4G)',
        '取消',
      ];

      var DESTRUCTIVE_INDEX = parseInt(BUTTONS.length) - 2;
      var CANCEL_INDEX = parseInt(BUTTONS.length) - 1;
      ActionSheet.showActionSheetWithOptions({
        title:'車輛控制項',
        message:'目前只提供 4G 網路操作，無法提供藍芽選項',
        options: BUTTONS,
        cancelButtonIndex: CANCEL_INDEX,
        destructiveButtonIndex: DESTRUCTIVE_INDEX,
        tintColor: '#ff5722',
      },
      (buttonIndex) => {
        switch(buttonIndex){
          case 0:
            this.confirm_controller(button_status,BUTTONS[buttonIndex]);
          break;
          case 1:
            this.confirm_controller('unlock',BUTTONS[buttonIndex]);
          break;
          case 2:
            this.confirm_controller('lock',BUTTONS[buttonIndex]);
          break;
          case 3:
            this.confirm_controller('trunk',BUTTONS[buttonIndex]);
          break;
          case 4:
            this.confirm_controller('whistle',BUTTONS[buttonIndex]);
          break;
        }
      });
      
      // this.showModal('controller_modal');
    }
    confirm_controller(type,msg){
      Alert.alert(
        '🤔 三思而後行',
        '確定執行【'+msg+'】?',
        [
          {text: 'Yes', onPress: () => this.controller(type)},
          {text: 'No'},
        ],
        {cancelable: false},
      );
    }


    controller(type){
      this.setState({show_loading:true});
      var formData  = new FormData();    
      formData.append("value", type);  
      formData.append("operator", global.user_givenName);
      var request_option = '/scooter/'+this.state.scooter.id+'/type';
      if(type == "MAINTENANCE" || type == "FREE"){
        request_option = '/scooter/'+this.state.scooter.id+'/status';
      }
      fetch(global.API+request_option,{
        method: 'PUT',
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
          var msg = "";
          switch(type){
            case "FREE":
              msg = "車輛已上線";
            break;
            case "MAINTENANCE":
              msg = "車輛已下線";
            break;
            case "unlock":
              msg = "車輛已啟動";
            break;
            case "lock":
              msg = "車輛已熄火";
            break;
            case "trunk":
              msg = "車廂已開啟";
            break;
            case "whistle":
              msg = "喇叭已響起";
            break;
          }
          setTimeout(
            ()=>{
              this.setState({show_loading:false});
              this.newScooter(this.state.scooter.id);
              Alert.alert('🛵 車輛訊息',msg,[{text: '好的！'}]);
            }
          ,3000);
        }else{
          this.props.navigation.navigate('TimeOut');        
        }
      });
    }

    setStorage = async () => {
      try {
        await AsyncStorage.setItem('@FoOps:task', this.state.task);
      } catch (error) {
        console.log(error);
      }
    }
    onPressTask(id){
      var tasks = global.task;
      var task = [];
      var show_msg = "";

      if(tasks != undefined && tasks.split(',').length > 0){
          task = tasks.split(',').map(function(m,i){
              return parseInt(m, 10);
          });
      }
      var index = task.indexOf(id);
      if (index != -1) {
          pushed = false;
          task.splice(index, 1);
          show_msg="已解除任務";
      }else{
          task.push(id);
          show_msg="已增加任務";
      }
      global.task=task.join(',');

      this.setState({task:task.join()},()=>{this.setStorage();Alert.alert('💪 Fighting',show_msg,[{text: '好的！'}])});           
    }
    addRemark(){
      var formData  = new FormData();    
      formData.append("remark", this.state.txt_remark);  
      formData.append("operator", global.user_givenName);

      fetch(global.API+'/scooter/'+this.state.scooter.id+'/remark',{
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
          this.getRemark(this.state.scooter.id);
          // console.warn(json.data); 
        }else{
          this.props.navigation.navigate('TimeOut');        
        }
      });
    }
    removeAlert(){
      Alert.alert(
        '⚠️ Warning',
        '確定要清除備註？',
        [
          {text: '確定!', onPress: () => this.removeRemark()},
          {text: '不要!'},
        ],
        {cancelable: false},
      );
    }
    removeRemark(){
      fetch(global.API+'/scooter/'+this.state.scooter.id+'/remark',{
        method: 'PUT',
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
        if(json.code == 1){
          this.getRemark(this.state.scooter.id);
          // console.warn(json.data); 
        }else{
          this.props.navigation.navigate('TimeOut');        
        }
      });
    }
    ViewViolationRecord(){
      this.props.navigation.navigate("ViolationRecord",{scooter:this.state.scooter});
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
        var acc = (this.state.acc == undefined) ? false : this.state.acc;
        var acc_icon = "lock";
        if(acc){
          var acc_status = <Text style={{color:'#f00'}}>啟動</Text>;
        }else{
          var acc_status = <Text style={{color:'#ccc'}}>熄火</Text>;
        }

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
        const direction_option={
          onClose:this.onClose,
          direction_modal:this.state.direction_modal,
          scooter:this.state.scooter,
        }
        const controller_option={
          onClose:this.onClose,
          controller_modal:this.state.controller_modal,
          scooter:this.state.scooter,
        }
        var tasks = this.state.task.split(',');
        var task = [];
        if(tasks.length > 0){
            task = tasks.map(function(m,i){
                return parseInt(m, 10);
            });
        }
        var sel_task = false;
        if(task.indexOf(scooter.id) != -1){
          sel_task = true;
        }
        switch(true){
            case scooter.power >= 50:
              var power_icon = "battery-full";
              var show_power = <Text style={{color:'#28a745',marginLeft:10}}>{scooter.power+"%"}</Text>
            break;
            case scooter.power >= 20 && scooter.power < 50:
              var power_icon = "battery-half";
              var show_power = <Text style={{color:'#FF8800',marginLeft:10}}>{scooter.power+"%"}</Text>
            break;
            case scooter.power > 0 && scooter.power < 20:
              var power_icon = "battery-quarter";
              var show_power = <Text style={{color:'#f00',marginLeft:10}}>{scooter.power+"%"}</Text>
            break;
            default:
              var power_icon = "battery-empty";
              var show_power = <Text style={{color:'#900',marginLeft:10}}>{scooter.power+"%"}</Text>
            break;
        }
        var backpage = (global.page != undefined) ? global.page : "Home" ;
        return (
        <SafeAreaView style={{flex: 1,width:'100%', backgroundColor: '#EFF1F4'  }}>
            <Header
              centerComponent={{ text: scooter.plate, style: { color: '#fff' } }}
              leftComponent={<TouchableHighlight style={{width:40}}><Icon name="angle-left" color='#fff' size={25} onPress={()=>this.props.navigation.navigate(backpage)}/></TouchableHighlight>}
              containerStyle={styles.header}
            />
            {this.state.show_loading &&(
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#ffffff" style={{marginBottom:5}} />
                <Text style={{color:'#fff'}}>Loading...</Text>
              </View>
            )}
            <Maintenance  maintain_option={maintain_option}/>
            <Violation  violation_option={violation_option}/>
            <Direction direction_option={direction_option} />
            <Controller controller_option={controller_option} />
            <ScrollView>
                <Card key={"card0"} title="車輛狀態" titleStyle={{fontSize:12,color:'#333'}} >
                  <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                    <View style={{flexDirection:'row',justifyContent:'space-around'}}>
                      <Icon name="motorcycle" size={19} style={{width:24}} />
                      <Text style={{marginLeft:10}}>車輛編號</Text>
                      <Text style={{marginLeft:10}}>{scooter.id}</Text>
                    </View>
                    <View style={{flexDirection:'row',justifyContent:'space-around'}}>
                      <Icon name={power_icon} size={19} style={{width:24}} />
                      <Text style={{marginLeft:10}}>電池電量</Text>
                      {show_power}
                    </View>
                  </View>

                  <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:20}}>
                    <View style={{flexDirection:'row',justifyContent:'space-around'}}>
                      <Icon name="history" size={19} style={{width:24}} />
                      <Text style={{marginLeft:10}}>未租用天數</Text>
                      <Text style={{marginLeft:10}}>{scooter.range_days+"天"}</Text>
                    </View>
                    <View style={{flexDirection:'row',justifyContent:'space-around'}}>
                      <Icon name="info-circle" size={19} style={{width:24,paddingLeft:5}} />
                      <Text style={{marginLeft:10}}>車輛狀態</Text>
                      <Text style={{marginLeft:10}}>{severe_lvl}</Text>
                    </View>
                  </View>

                  <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:20}}>
                    <View style={{flexDirection:'row',justifyContent:'space-around'}}>
                      <Icon name="exclamation" size={19} style={{width:24}} />
                      <Text style={{marginLeft:10}}>服務狀態</Text>
                      <Text style={{marginLeft:10}}>{stats_type}</Text>
                    </View>
                    <View style={{flexDirection:'row',justifyContent:'space-around'}}>
                      <Icon name={acc_icon} size={18} style={{width:24,paddingLeft:5}} />
                      <Text style={{marginLeft:10}}>是否啟動</Text>
                      <Text style={{marginLeft:10}}>{acc_status}</Text>
                    </View>
                  </View>
                  {this.state.remark == null ?(
                    <View style={{backgroundColor:'#fff',marginTop:10}}>
                        <Input placeholder='輸入車輛備註...' containerStyle={{backgroundColor:'#fff',paddingLeft:0}} inputStyle={{marginLeft:10,height:50}} leftIcon={
                        <Icon name='user-edit' color='black'  size={20}  /> } onChangeText={(text)=>this.setState({txt_remark:text})} rightIcon={<Button title="新增" buttonStyle={{height:30}} titleStyle={{fontSize:12}} onPress={()=>this.addRemark()}/>} />
                    </View>
                  ):(
                    <View style={{backgroundColor:'#fff',flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
                      <View style={{flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>
                        <Icon name='user-edit' color='black'  size={24} style={{width:24,marginLeft:12,marginRight:20}} />
                        <Text>{this.state.remark}</Text>
                      </View>
                      <Button title="清除" buttonStyle={{backgroundColor:'#ff0000',height:35,borderRadius:0}} titleStyle={{fontSize:13}}  onPress={()=>this.removeAlert()}/>
                    </View>
                  )}
                  <View style={{justifyContent:'center',marginTop:20}}>
                    <View style={{justifyContent:'center'}}>
                      <Button title="顯示違規紀錄" buttonStyle={{backgroundColor:'#FF8C00'}} titleStyle={{fontSize:12}} onPress={()=>{this.ViewViolationRecord()}} />
                    </View>
                  </View>

                </Card>

                {conditions &&(
                    <FlatList  
                      style={{marginTop:10}}
                      data={conditions}
                      renderItem={({item, index}) => <ListItem key={"fl_"+index} leftAvatar={<Icon name="wrench" />} title={item}  style={styles.listItem} />}
                      ListHeaderComponent={this.ListHeaderComponent}
                      
                    />
                )}
                
            </ScrollView>
              <View style={{flexDirection:'row',backgroundColor:'#fff',borderTopWidth:1,borderTopColor:'#ccc',paddingTop:10,paddingBottom:10,paddingLeft:20,paddingRight:20,justifyContent:'space-between',alignItems: "center"}}>
                {sel_task ? (
                  <View>
                  <Button key={"btn_0"}  icon={<Icon name="tasks" size={25} color="#6A7684"   />}  type="outline" buttonStyle={{borderWidth:0}} onPress={()=>this.onPressTask(scooter.id)} />
                  <Badge status="error" containerStyle={{position:'absolute',top:0,right:0}} />
                  </View>
                ):(
                  <Button  key={"btn_0"} icon={<Icon name="tasks" size={25} color="#6A7684"   />}  type="outline" buttonStyle={{borderWidth:0}} onPress={()=>this.onPressTask(scooter.id)} />
                )}
                
                <Button  key={"btn_1"} icon={<Icon name="directions" size={25} color="#6A7684"   />}  type="outline" buttonStyle={{borderWidth:0}} onPress={()=>this.showDirection()} />
                <Button  key={"btn_2"} icon={<Icon name="camera" size={50} color="#6A7684"   />}  type="outline" buttonStyle={{borderWidth:0}} onPress={()=>this.showViolation()} />
                <Button  key={"btn_3"} icon={<Icon name="motorcycle" size={25} color="#6A7684"   />}  type="outline" buttonStyle={{borderWidth:0}} onPress={()=>this.showController()}/>
                <Button  key={"btn_4"} icon={<Icon name="tools" size={25} color="#6A7684"   />}  type="outline" buttonStyle={{borderWidth:0}} onPress={()=>this.showMaintain()} />
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


