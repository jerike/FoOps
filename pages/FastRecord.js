import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,Alert } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import { Card, ListItem,Header,Input, Button,Image,SearchBar,ButtonGroup,CheckBox } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import '../global.js';

const severe_title = global.severe_title;
const scootet_status = global.scootet_status;

var t = 0;
export default class FastRecord extends React.Component {
    constructor () {
        super()
        this.state = {
            scooter:{},
            condition:[],
            sel_condition:[],
            other_summaries:[]

        }
        this.onClickCondition=this.onClickCondition.bind(this);
        this.onChangeOther=this.onChangeOther.bind(this);
    }
    componentWillMount() {
        this.setState({condition:global.condition});
    }
    
    pad(number){ return (number < 10 ? '0' : '') + number }
    dateFormat(date){
      var format_date = new Date(date);
      var create_date = this.pad(format_date.getMonth()+1)+'/'+this.pad(format_date.getDate())+' '+this.pad(format_date.getHours())+':'+this.pad(format_date.getMinutes());
      return create_date;
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
    onChangeOther(key,value){
      var other_summaries = this.state.other_summaries;
      other_summaries[key] = value;
      this.setState({other_summaries:other_summaries});
    }
    submit(id){
        var formData  = new FormData();
        formData.append("scooter_id", id);
        formData.append("ticket_status_id", 0);
        formData.append("operator", global.user_givenName);
        formData.append("operator_id", global.user_id);
        formData.append("zendesk", "");

        var sel_condition = this.state.sel_condition;
        if(sel_condition.indexOf(700) != -1 && sel_condition.length == 1){
          Alert.alert('⚠️ Warning',"車輛下限需要勾選車況原因！",[{text: '好的！'}]);
          return false;
        }
        sel_condition && sel_condition.map(function(m,i){
            formData.append("scooter_status[]", m);
        });
        var other_summaries = this.state.other_summaries;
        other_summaries && other_summaries.map(function(m,i){
            if(m != null){
              formData.append("other_summary_id[]", i);
              formData.append("other_summary_value[]", m);
            }
        });

        fetch(API+'/ticket/addworkrecord',{
            method: 'POST',
            mode: 'cors',
            body: formData,
            credentials: 'include'
        })
        .then((response) => response.json())
        .then((data) => {
          if(data.code == 1){
            Alert.alert('⚠️ Warning',"紀錄完成",[{text: '好的！',onPress: () => fastrecord_option.onClose('fastrecord_modal')}]);
          }else{
            Alert.alert('⚠️ Warning',json.reason,[{text: '好的！'}]);
          }
        });
    }
    render() {
        const {fastrecord_option} = this.props;
        const {condition,sel_condition} = this.state;
        const {onClickCondition,onChangeOther,submit}=this;
        var other_conditions = [];
        var scooter_conditions = [];
        SCooter_ticket = fastrecord_option.scooter.ticket;
        if(SCooter_ticket != undefined){
          other_conditions = SCooter_ticket.other_conditions;
          scooter_conditions = SCooter_ticket.scooter_conditions;
        }
        var fase_conditions = [604,605,607,608,613,614,615,616,617]
        var condition_list = condition.map(function(m,i){
          if(fase_conditions.indexOf(m.id) == -1){
            return true;
          }

          var description = m.description
          var other_input = <View></View>;
          
          if(m.name.indexOf('(option)') != -1){
            var summary = "";
            if(other_conditions != undefined){
              other_conditions.map(function(s,k){
                  if(parseInt(s.id) == parseInt(m.id)){
                      summary = s.summary;
                  }
              });
            }
            other_input = <Input type="text" defaultValue={summary} placeholder="請輸入原因" name={"other_summary_"+m.id}  containerStyle={{width:200}}  onChangeText={(text) => onChangeOther(m.id,text)} inputStyle={{fontSize:13,height:15}} />
          }
          var checked = (sel_condition != undefined && sel_condition.indexOf(m.id) != -1) ? true : false;

          return <View key={"view"+i}><CheckBox key={"condition"+m.id}  onPress={()=>onClickCondition(m.id)} checked={checked} title={<View style={{flexDirection:'row',justifyContent: "center", alignItems: "center"}}><Text >{description}</Text>{other_input}</View>}  /></View>
        });
        return (
            <Modal
              animationType="slide"
              transparent={false}
              visible={fastrecord_option.fastrecord_modal}
              presentationStyle="fullScreen"
              >
              <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
                  <View style={{  justifyContent: "flex-start", alignItems: "flex-end",marginRight:10 }}>
                     <Icon name='close' size={30}  onPress={() => {
                        fastrecord_option.onClose('fastrecord_modal');
                      }} />
                  </View>
                  <ScrollView style={{flexDirection:'column' }}>
                    {condition_list}
                  </ScrollView>
                    <Button
                      title="送出"
                      titleStyle={styles.view_titleStyle}
                      onPress={() => {
                        submit(fastrecord_option.scooter.id);
                      }}
                    />
                </SafeAreaView>
            </Modal>
       
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
  }
});


