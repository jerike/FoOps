import React, { Component } from 'react';
import { Text,TextInput, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,Alert,ActivityIndicator } from 'react-native';
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
            sel_condition:[],
            show_loading:false,
            other_conditions:[],
            other_summaries:[]

        }
        this.updateCondition=this.updateCondition.bind(this);
        this.onClickCondition=this.onClickCondition.bind(this);
        this.onChangeOther=this.onChangeOther.bind(this);
        
    }
    componentWillMount() {
        this.setState({condition:global.condition});
        this.props.onRef1(this);
    }
    
    pad(number){ return (number < 10 ? '0' : '') + number }
    dateFormat(date){
      var format_date = new Date(date);
      var create_date = this.pad(format_date.getMonth()+1)+'/'+this.pad(format_date.getDate())+' '+this.pad(format_date.getHours())+':'+this.pad(format_date.getMinutes());
      return create_date;
    }
    get_data(){
        SCooter_ticket = this.props.maintain_option.scooter.ticket;
        
        if(SCooter_ticket != undefined){
          other_conditions = (SCooter_ticket.other_conditions == undefined) ? [] : SCooter_ticket.other_conditions;
          sel_condition = SCooter_ticket.scooter_conditions;
          this.setState({sel_condition:sel_condition,other_conditions:other_conditions})
        }
    }
    onChangeOther(key,value){
      var other_conditions = this.state.other_conditions;
      other_conditions.push({id:key,summary:value});
      this.setState({other_conditions:other_conditions});
    }
    updateCondition(id){
        this.setState({show_loading:true});
        var formData  = new FormData();
        formData.append("scooter_id", id);
        formData.append("ticket_status_id", 0);
        formData.append("operator", global.user_givenName);
        formData.append("operator_id", global.user_id);
        formData.append("zendesk", "");

        var sel_condition = this.state.sel_condition;
        // console.log(sel_condition);

        if(sel_condition.indexOf(700) != -1 && sel_condition.length == 1){
          Alert.alert('⚠️ Warning',"車輛下限需要勾選車況原因！",[{text: '好的！'}]);
          return false;
        }
        sel_condition && sel_condition.map(function(m,i){
            formData.append("scooter_status[]", m);
        });
        var other_conditions = this.state.other_conditions;
        other_conditions && other_conditions.map(function(m,i){
              formData.append("other_summary_id[]", m.id);
              formData.append("other_summary_value[]", m.summary);
        });
        // console.warn(formData);
        // this.setState({show_loading:false});
        // return false;
        fetch(API+'/ticket',{
            method: 'POST',
            mode: 'cors',
            body: formData,
            credentials: 'include'
        })
        .then((response) => response.json())
        .then((json) => {
          if(json.code == 1){
            this.props.maintain_option.onClose('maintain_modal');
            this.props.maintain_option.fetch_scooters();
            // this.props.maintain_option.newScooter(id);
            this.setState({show_loading:false});
          }else{
            Alert.alert('⚠️ Warning',json.reason,[{text: '好的！'}]);
          }
        }).catch( err => {
          Alert.alert('System',"API 更新中，請稍後再試！",[{text: '好的！'}]);
          this.setState({show_loading:false});
          return false;
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

    
    onClickCondition(id){
        var sel_condition =  this.state.sel_condition;
        var index = -1;
        if(sel_condition != undefined){
          index = sel_condition.indexOf(id);
        }else{
          sel_condition = [];
        }
        if (index == -1) {
            sel_condition.push(id);
            this.setState({sel_condition: sel_condition});
        }else{
            sel_condition.splice(index, 1);
            this.setState({sel_condition: sel_condition});
        }
        
        
    }
    render() {
        const {maintain_option} = this.props;
        const {condition,sel_condition,other_conditions} = this.state;
        const {onClickCondition,updateCondition,onChangeOther} = this;
        var condition_list = condition.map(function(m,i){
          if(m.id < 600 || m.status != 1){
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
            other_input = <Input type="text" defaultValue={summary} leftIcon={<Icon name='edit' size={13} color='#999' />} placeholder="請輸入原因" name={"other_summary_"+m.id}  containerStyle={{width:200}}  inputContainerStyle={{height:30}}   onEndEditing={(e) => onChangeOther(m.id,e.nativeEvent.text)} inputStyle={{fontSize:13,height:15}} />
          }
          var checked = false;
          if(sel_condition != undefined){
              checked = (sel_condition.length > 0 && sel_condition.indexOf(m.id) != -1) ? true : false;
          }
          var label_color = "#990000"
          switch(m.severe_id){
            case 3:
              label_color = "#EE7700";
            break;
            case 5:
              label_color = "#00AA55";
            break;
          }

          return <View key={"view"+i}><CheckBox key={"condition"+m.id}  onPress={()=>onClickCondition(m.id)} checked={checked} title={<View style={{flexDirection:'row',justifyContent: "center", alignItems: "center"}}><Text style={{color:label_color}}>{description}</Text>{other_input}</View>}  /></View>
        });
        return (
            <Modal
              animationType="slide"
              transparent={false}
              visible={maintain_option.maintain_modal}
              presentationStyle="fullScreen"
              onRequestClose={()=>maintain_option.onClose('maintain_modal')}
            >
              <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
                  {this.state.show_loading &&(
                    <View style={styles.loading}>
                      <ActivityIndicator size="large" color="#ffffff" style={{marginBottom:5}} />
                      <Text style={{color:'#fff'}}>Loading...</Text>
                    </View>
                  )}
                  <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                    <View style={{justifyContent:'center',textAlign:'center',marginTop:5,marginLeft:10,width:120,borderBottomColor:'#ccc',borderBottomWidth:1}}>
                      <Text style={{ color: '#333',fontSize:18,textAlign:'center' }}>維護清單</Text>
                    </View>
                    <View style={{  justifyContent: "flex-start", alignItems: "flex-end",marginRight:5,marginTop:5 }}>
                       <Icon name='times-circle' size={30}  onPress={() => {
                          maintain_option.onClose('maintain_modal');
                        }} />
                    </View>
                  </View>
                  <ScrollView style={{flexDirection:'column',marginTop:10 }}>
                    {condition_list}
                  </ScrollView>
                    <Button
                      title="送出"
                      titleStyle={styles.view_titleStyle}
                      onPress={() => {
                        updateCondition(maintain_option.scooter.id);
                      }}
                    />
                </SafeAreaView>
            </Modal>
       
        );
    }
}

const styles = StyleSheet.create({
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


