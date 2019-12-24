import React, { Component } from 'react';
import {  Text,View,FlatList,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,Alert,ActionSheetIOS,ScrollView,ActivityIndicator,BackHandler } from 'react-native';
import { createDrawerNavigator, createAppContainer,NavigationActions } from 'react-navigation';
import { Card, ListItem,Header, Button,Image,SearchBar,ButtonGroup,Badge,Input,Divider } from 'react-native-elements'
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import '../global.js';
import Maintenance from './Maintenance'
import FastRecord from './FastRecord'
import Violation from './Violation'
import Direction from './Direction'
import Controller from './Controller'
import ActionTools from './ActionTools'
import ActionSheet from 'react-native-action-sheet';
const severe_title = global.severe_title;
const scootet_status = global.scootet_status;
const API = global.API;
const icon = (name: string) => <Icon key={name} name={name} size={24} />;
var t = 0;
var backpage = (global.page != undefined) ? global.page : "Home" ;
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
        fastrecord_modal:false,
        action_tools_modal:false,
        sel_condition:[],
        top_other:"",
        medium_other:"",
        low_other:"",
        operator:"",
        operator_id:"",
        tasks:[],
        task:"",
        remark:null,
        other_summaries:[]
      }
      this.newScooter=this.newScooter.bind(this);
      this.updateIndex = this.updateIndex.bind(this);
      this.showModal=this.showModal.bind(this);
      this.onClose=this.onClose.bind(this);
      this.getStorage=this.getStorage.bind(this);
      this.onPressTask=this.onPressTask.bind(this);
      this.removeRemark=this.removeRemark.bind(this);
      this.confirm_controller=this.confirm_controller.bind(this);
      this.ViewViolationRecord=this.ViewViolationRecord.bind(this);
      this.selectWork=this.selectWork.bind(this);
    }
    componentWillMount() {
        var sid = this.props.navigation.state.params.scooter;
        this.newScooter(sid);
        this.setState({sid:sid,condition:global.condition,show_loading:true});
    }
    componentDidMount(){
      this.getStorage().done();
      if (Platform.OS === 'android') {  
        BackHandler.addEventListener('hardwareBackPress', ()=>{this.back2page();});
      } 
    }
    componentWillUnmount() {
        if (Platform.OS === 'android') {
           BackHandler.removeEventListener('hardwareBackPress',()=>{});
        }
    }
    onRef1 = (e) => {
      this.modal1 = e
    }

    back2page(){
      var backpage = (global.page != undefined) ? global.page : "Home" ;
      this.props.navigation.navigate(backpage);
      this.props.navigation.navigate(backpage,{
          newScooter: this.newScooter,
      });
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
        // console.warn(sid);
        this.setState({sid:sid,show_loading:true});
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
    ClearDate(){
      this.setState({
        scooter:{}

      });
    }
    getScooterType(sid){
      fetch(global.API+'/scooter/'+sid+'/status',{
        method: 'GET',
        credentials: 'include'
      })
      .then((response) => response.json())
      .then((json)=>{
        if(json.code == 1){
          this.setState({
              acc:json.data['acc']
          });
        }
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


    updateIndex (selectedIndex) {
      this.setState({selectedIndex})
    }
    
    showModal(key){
        this.setState({
          [key]: true,
        });
    }
    onClose(key){
        this.setState({
          [key]: false,
        },()=>{this.newScooter(this.state.sid)});
    }
    showMaintain(){
      if(this.state.scooter.ticket != undefined){
          const scooter_conditions = this.state.scooter.ticket.scooter_conditions;
          // this.setState({sel_condition:scooter_conditions});
      }
      this.modal1.get_data();
      this.showModal('maintain_modal');
    }
    showFastRecord(){
      this.showModal('fastrecord_modal');
    }
    showViolation(){
      this.showModal('violation_modal');
    }
    showDirection(){
      // console.warn('open direction');
      this.showModal('direction_modal');
    }
    showActionTools(){
      this.showModal('action_tools_modal');
    }
    showController(){
      var Status = "⛔ 車輛下線(維護)";
      var button_status = "MAINTENANCE";
      if(this.state.scooter.status == "MAINTENANCE"){
        var Status = '🆙 車輛上線(營運)';
        var button_status = "FREE";
      }

      var BUTTONS = [
        Status,
        '🔓 啟動',
        '🔒 熄火',
        '🔑 車廂',
        '🔊 響鈴',
        '❌ 取消',
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
      this.controller(type);
      // Alert.alert(
      //   '🤔 三思而後行',
      //   '確定執行【'+msg+'】?',
      //   [
      //     {text: 'Yes', onPress: () => this.controller(type)},
      //     {text: 'No'},
      //   ],
      //   {cancelable: false},
      // );
    }


    controller(type){
      this.setState({show_loading:true});
      var formData  = new FormData();    
      formData.append("value", type);  
      formData.append("operator", global.user_givenName);
      var request_option = '/scooter/'+this.state.scooter.id+'/status?type='+type;
      var method = "PUT";
      if(type == "MAINTENANCE" || type == "FREE"){
        request_option = '/scooter/'+this.state.scooter.id+'/status?value='+type;
        method = "PATCH";  
      }

      // var request_option = '/scooter/'+this.state.scooter.id+'/type';
      // if(type == "MAINTENANCE" || type == "FREE"){
      //   request_option = '/scooter/'+this.state.scooter.id+'/status';
      // }
      // fetch(global.API+request_option,{
      fetch(global.ServiceAPI+request_option,{
        method: method,
        credentials: 'include',
        body: formData
      })
      .then((response) => {
          if(response.status == 401){
            this.props.navigation.navigate('TimeOut');
          }else{
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
      this.onClose('action_tools_modal');
    }
    selectWork(selectedIndex){
        switch(selectWork){
          case 1:
            this.props.navigation.navigate("ChargingBattery",{scooter:this.state.scooter});
          break;
          case 2:
            this.props.navigation.navigate("MoveScooter",{scooter:this.state.scooter});
          break;
          case 3:
            this.props.navigation.navigate("TirePump",{scooter:this.state.scooter});
          break;

        }
        this.onClose('action_tools_modal');
    }
    BrokenTrack(){
      this.props.navigation.navigate("BrokenTrack",{scooter:this.state.scooter});
      this.onClose('action_tools_modal');
    }
    render() {
        const {search,selectedIndex,toSearch,scooter} = this.state;

        var get_props_sid = this.props.navigation.getParam('scooter');
        global.page = this.props.navigation.getParam('screen');
        // if(this.state.sid != get_props_sid){
        //   this.newScooter(get_props_sid);
        // }

        var conditions = [];
        var other_conditions = [];
        var scooter_conditions = [];
        var severe_lvl = this.get_severe_lvl(scooter.severe);
        var stats_type = this.get_status_type(scooter.status);
        var acc = (this.state.acc == undefined) ? "-" : this.state.acc;
        switch(acc){
          case true:
            var acc_status = <Text style={{color:'#f00'}}>啟動</Text>;
          break;
          case false:
            var acc_status = <Text style={{color:'#ccc'}}>熄火</Text>;
          break;
          default:
            var acc_status = <Text style={{color:'#66009D'}}>無法取得狀態</Text>;
          break;
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
              var other_summary = "";
              other_summary += description;
              scooter.ticket.other_conditions.map(function(s,i){
                  if(s.id == d){
                      other_summary += ":"+s.summary;
                      
                  }
              });
              conditions.push(other_summary);

            }.bind(this));
            
          }
        }
        
        const maintain_option={
          onClose:this.onClose,
          maintain_modal:this.state.maintain_modal,
          scooter:this.state.scooter,
          newScooter:this.newScooter
        }
        const fastrecord_option={
          onClose:this.onClose,
          fastrecord_modal:this.state.fastrecord_modal,
          scooter:this.state.scooter,
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
        const action_tools_option={
          onClose:this.onClose,
          action_tools_modal:this.state.action_tools_modal,
          ViewViolationRecord:this.ViewViolationRecord,
          BrokenTrack:this.BrokenTrack,
          showMaintain:this.showMaintain,
          selectWork:this.selectWork

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
        var scooter_power = 0;
        if(scooter.power != undefined){
            scooter_power = scooter.power;
        }
        switch(true){
            case scooter_power >= 50:
              var power_icon = "battery-full";
              var show_power = <Text style={{color:'#28a745',marginLeft:10}}>{scooter_power+"%"}</Text>
            break;
            case scooter_power >= 20 && scooter_power < 50:
              var power_icon = "battery-half";
              var show_power = <Text style={{color:'#FF8800',marginLeft:10}}>{scooter_power+"%"}</Text>
            break;
            case scooter_power > 0 && scooter_power < 20:
              var power_icon = "battery-quarter";
              var show_power = <Text style={{color:'#f00',marginLeft:10}}>{scooter_power+"%"}</Text>
            break;
            default:
              var power_icon = "battery-empty";
              var show_power = <Text style={{color:'#900',marginLeft:10}}>{scooter_power+"%"}</Text>
            break;
        }

        var no_rental_days = (scooter.range_days != undefined) ? scooter.range_days+"天" : "...";
        var labels = (scooter.labels != undefined) ? scooter.labels.join(",") : "";
        return (
        <SafeAreaView style={{flex: 1,width:'100%',backgroundColor: '#ff5722'  }}>
            <Header
              centerComponent={{ text: scooter.plate, style: { color: '#fff' } }}
              leftComponent={<TouchableHighlight onPress={()=>this.back2page()}><View style={{flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}><Icon name="angle-left" color='#fff' size={25} /><Text style={{paddingLeft:10,color:'#fff',fontWeight:'bold',fontSize:13}}>返回</Text></View></TouchableHighlight>}
              containerStyle={styles.header}
            />
            {this.state.show_loading &&(
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#ffffff" style={{marginBottom:5}} />
                <Text style={{color:'#fff'}}>Loading...</Text>
              </View>
            )}
            <Maintenance  maintain_option={maintain_option} onRef1={this.onRef1}/>
            <FastRecord fastrecord_option={fastrecord_option} />
            <Violation  violation_option={violation_option}/>
            <Direction direction_option={direction_option} />
            <Controller controller_option={controller_option} />
            <ActionTools action_tools_option={action_tools_option} />
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} style={{width:'100%',backgroundColor: '#EFF1F4'}}>
                <ListItem
                  key={"list_0"}
                  title="車輛編號"
                  leftIcon={<Icon name="motorcycle"  size={20} style={{marginRight:10}}/>}     
                  badge={{ value: scooter.id, textStyle: { color: '#900',fontSize:17 },badgeStyle:{backgroundColor:'#fff'}, containerStyle: { marginTop: 0 } }}
                  bottomDivider={true}
                  titleStyle={{fontSize:13}}
                />
                <ListItem
                  key={"list_1"}
                  title="電池電量"
                  leftIcon={<Icon name={power_icon}  size={20} style={{marginRight:10}}/>}     
                  badge={{ value: show_power, textStyle: { color: '#fff',fontSize:15 },badgeStyle:{backgroundColor:'#fff'}, containerStyle: { marginTop: 0 } }}
                  bottomDivider={true}
                  titleStyle={{fontSize:13}}
                />
                <ListItem
                  key={"list_3"}
                  title="未租用天數"
                  leftIcon={<Icon name="history"  size={20} style={{marginRight:10}}/>}     
                  badge={{ value: no_rental_days, textStyle: { color: '#333',fontSize:15 },badgeStyle:{backgroundColor:'#fff'}, containerStyle: { marginTop: 0 } }}
                  bottomDivider={true}
                  titleStyle={{fontSize:13}}
                />
                <ListItem
                  key={"list_4"}
                  title="車輛狀態"
                  leftIcon={<Icon name="info-circle"  size={20} style={{marginRight:10}}/>}     
                  badge={{ value: severe_lvl, textStyle: { color: '#fff',fontSize:15 },badgeStyle:{backgroundColor:'#fff'}, containerStyle: { marginTop: 0 } }}
                  bottomDivider={true}
                  titleStyle={{fontSize:13}}
                />
                <ListItem
                  key={"list_5"}
                  title="服務狀態"
                  leftIcon={<Icon name="exclamation"  size={20} style={{paddingLeft:7,marginRight:10}}/>}     
                  badge={{ value: stats_type, textStyle: { color: '#fff',fontSize:15 },badgeStyle:{backgroundColor:'#fff'}, containerStyle: { marginTop: 0 } }}
                  bottomDivider={true}
                  titleStyle={{fontSize:13}}
                />
                <ListItem
                  key={"list_6"}
                  title="是否啟動"
                  leftIcon={<Icon name="lock"  size={20} style={{marginRight:10}}/>}     
                  badge={{ value: acc_status, textStyle: { color: '#fff',fontSize:15 },badgeStyle:{backgroundColor:'#fff'}, containerStyle: { marginTop: 0 } }}
                  bottomDivider={true}
                  titleStyle={{fontSize:13}}
                />
                {this.state.remark == null ?(
                    <ListItem
                      key={"list_7"}
                      title={<View style={{backgroundColor:'#fff'}}>
                              <Input placeholder='輸入車輛備註...' containerStyle={{backgroundColor:'#fff',paddingLeft:0}} inputStyle={{marginLeft:10,fontSize:15}}  onChangeText={(text)=>this.setState({txt_remark:text})} rightIcon={<Button title="新增" buttonStyle={{height:25}} titleStyle={{fontSize:12}} onPress={()=>this.addRemark()}/>} />
                             </View>}
                      leftIcon={<Icon name="user-edit"  size={20} style={{marginRight:10}}/>}     
                      bottomDivider={true}
                      titleStyle={{fontSize:13}}
                    />
                ):(
                    <ListItem
                      key={"list_7"}
                      title={<View style={{backgroundColor:'#fff',flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                              <View style={{flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>
                              <Text>{this.state.remark}</Text>
                            </View>
                            <Button title="清除" buttonStyle={{backgroundColor:'#ff0000',height:30,borderRadius:5}} titleStyle={{fontSize:13}}  onPress={()=>this.removeAlert()}/></View>}
                      leftIcon={<Icon name="user-edit"  size={20} style={{marginRight:10}}/>}     
                      bottomDivider={true}
                      titleStyle={{fontSize:13}}
                    />
                )}
                <ListItem
                  key={"list_8"}
                  title="標籤"
                  subtitle={labels}
                  leftIcon={<Icon name="tags"  size={20} style={{marginRight:10}}/>}     
                  bottomDivider={true}
                  titleStyle={{fontSize:13}}
                  subtitleStyle={{fontSize:12,color:'#900'}}
                />
                <ListItem
                  key={"list_9"}
                  title="車況紀錄"
                  bottomDivider={true}
                  titleStyle={{fontSize:13,textAlign:'center'}}
                />
                {conditions &&(
                   
                      conditions.map((item, index) => (
                        <ListItem
                          key={"fl_"+index}
                          leftAvatar={<Icon name="wrench"  size={20} style={{marginRight:10}} />}
                          title={item}
                          style={styles.listItem}
                          bottomDivider
                        />
                      ))
                      
                )}

            </ScrollView>
              <View style={{width:'100%',position:'absolute',bottom:0,flexDirection:'row',backgroundColor:'#fff',borderTopWidth:1,borderTopColor:'#ccc',paddingTop:10,paddingBottom:10,paddingLeft:20,paddingRight:20,justifyContent:'space-between',alignItems: "center"}}>

                
                <Button  key={"btn_1"} icon={<Icon name="motorcycle" size={25} color="#6A7684"   />}  type="outline" buttonStyle={{borderWidth:0}} onPress={()=>this.showController()}/>
                <Button  key={"btn_2"} icon={<Icon name="fighter-jet" size={25} color="#6A7684"  />}  type="outline" buttonStyle={{borderWidth:0}} onPress={()=>this.showFastRecord()}/>
                
                <Button  key={"btn_3"} icon={<Icon name="camera" size={50} color="#6A7684"   />}  type="outline" buttonStyle={{borderWidth:0,borderRadius:50}} raised={true} onPress={()=>this.showViolation()} />
                <Button  key={"btn_4"} icon={<Icon name="tools" size={25} color="#6A7684"   />}  type="outline" buttonStyle={{borderWidth:0}} onPress={()=>this.showMaintain()} />
                <Button  key={"btn_5"} icon={<Icon name="bars" size={25} color="#6A7684"   />}  type="outline" buttonStyle={{borderWidth:0}} onPress={()=>this.showActionTools()} />
                

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
    zIndex:10001,
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


