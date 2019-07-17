import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,Alert } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import { Card, ListItem,Header,Input, Button,Image,SearchBar,ButtonGroup,CheckBox } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import '../global.js';

const severe_title = global.severe_title;
const scootet_status = global.scootet_status;

var t = 0;
export default class Maintenance extends React.Component {
    constructor () {
        super()
        this.state = {
            scooter:{},
            condition:[],
            sel_condition:[]

        }
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
    
    render() {
        const {maintain_option} = this.props;
        const {condition} = this.state;
        var other_conditions = [];
        var scooter_conditions = [];
        SCooter_ticket = maintain_option.scooter.ticket;
        if(SCooter_ticket != undefined){
          other_conditions = SCooter_ticket.other_conditions;
          scooter_conditions = SCooter_ticket.scooter_conditions;
        }
        var condition_list = condition.map(function(m,i){
            var description = m.description
            var other_input = <View></View>;
            if(description == "其他"){
              var summary = "";
              if(other_conditions != undefined){
                other_conditions.map(function(s,k){
                    if(parseInt(s.id) == parseInt(m.id)){
                        summary = s.summary;
                    }
                });
              }
              switch(m.severe_id){
                case 1:
                  other_input = <Input defaultValue={summary} placeholder="請輸入原因" name="top_other" containerStyle={{width:200}} onChangeText={(text) => maintain_option.onChangeOther('top_other',text)}  inputStyle={{fontSize:13,height:15}}/>
                break;
                case 2:
                  other_input = <Input defaultValue={summary} placeholder="請輸入原因" name="medium_other" containerStyle={{width:200}} onChangeText={(text) => maintain_option.onChangeOther('medium_other',text)} inputStyle={{fontSize:13,height:15}}/>
                break;
                case 3:
                  other_input = <Input defaultValue={summary} placeholder="請輸入原因" name="low_other" containerStyle={{width:200}} onChangeText={(text) => maintain_option.onChangeOther('low_other',text)} inputStyle={{fontSize:13,height:15}}/>
                break;
              }
            }
            var checked = (maintain_option.sel_condition != undefined && maintain_option.sel_condition.indexOf(m.id) != -1) ? true : false;

            return <View key={"view"+i}><CheckBox key={"condition"+m.id}  onPress={()=>maintain_option.onClickCondition(m.id)} checked={checked} title={<View style={{flexDirection:'row',justifyContent: "center", alignItems: "center"}}><Text >{description}</Text>{other_input}</View>}  /></View>
        });
        return (
            <Modal
              animationType="slide"
              transparent={false}
              visible={maintain_option.maintain_modal}
              presentationStyle="fullScreen"
              >
              <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
                  <View style={{  justifyContent: "flex-start", alignItems: "flex-end",marginRight:10 }}>
                     <Icon name='close' size={30}  onPress={() => {
                        maintain_option.onClose('maintain_modal');
                      }} />
                  </View>
                  <ScrollView style={{flexDirection:'column' }}>
                    {condition_list}
                  </ScrollView>
                    <Button
                      title="送出"
                      titleStyle={styles.view_titleStyle}
                      onPress={() => {
                        maintain_option.updateCondition(maintain_option.scooter.id);
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


