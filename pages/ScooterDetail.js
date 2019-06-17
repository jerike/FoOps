import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,Alert } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import { Card, ListItem,Header, Button,Image,SearchBar,ButtonGroup } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import '../global.js';

const severe_title = global.severe_title;
const scootet_status = global.scootet_status;

var t = 0;
export default class ScooterDetail extends React.Component {
    constructor () {
      super()
      this.state = {
        scooter:{},
        condition:[]
      }
      this.newScooter=this.newScooter.bind(this);
    }
    componentWillMount() {
        var sid = this.props.navigation.state.params.scooter;
        this.newScooter(sid);
        this.setState({sid:sid,condition:global.condition});
    }
    
    pad(number){ return (number < 10 ? '0' : '') + number }
    dateFormat(date){
      var format_date = new Date(date);
      var create_date = this.pad(format_date.getMonth()+1)+'/'+this.pad(format_date.getDate())+' '+this.pad(format_date.getHours())+':'+this.pad(format_date.getMinutes());
      return create_date;
    }
    newScooter(sid){
        this.setState({sid:sid});
        fetch(global.API+'/scooter/'+sid+'/realtime',{
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
    
     

    render() {
        
        const {search,selectedIndex,toSearch,scooter,condition} = this.state;
        var get_props_sid = this.props.navigation.getParam('scooter');
        console.warn(condition);
        if(this.state.sid != get_props_sid){
          this.newScooter(get_props_sid);
        }
        var other_conditions = [];
        var scooter_conditions = [];
        SCooter_ticket = scooter.ticket;
        if(SCooter_ticket != undefined){
          other_conditions = SCooter_ticket.other_conditions;
          scooter_conditions = SCooter_ticket.scooter_conditions;
        }
        var condition_list = [];
        // condition.map(function(m,i){
        //     var description = m.description
        //     var other_input = "";
        //     if(description == "其他"){
        //       var summary = "";
        //       if(other_conditions != undefined){
        //         other_conditions.map(function(s,k){
        //             if(parseInt(s.id) == parseInt(m.id)){
        //                 summary = s.summary;
        //             }
        //         });
        //       }
        //       switch(m.severe_id){
        //         case 1:
        //           other_input = <Input defaultValue={summary} placeholder="請輸入原因" name="top_other" ></Input>
        //         break;
        //         case 2:
        //           other_input = <Input defaultValue={summary} placeholder="請輸入原因" name="medium_other" ></Input>
        //         break;
        //         case 3:
        //           other_input = <Input defaultValue={summary} placeholder="請輸入原因" name="low_other" ></Input>
        //         break;
        //       }
        //     }
        //     if(scooter_conditions != undefined && scooter_conditions.indexOf(m.id) != -1){
        //       condition_list.push(<CheckBox key={i}  onPress={()=>this.onClickCondition(m.id)} checked={this.state.checked} title={description}  />);
        //     }else{
        //       condition_list.push(<CheckBox key={i}  onPress={()=>this.onClickCondition(m.id)}  title={description}  />);
        //     }
        // });
        return (
        <View style={{flex: 1, backgroundColor: '#ccc'}}>
            <Header
              centerComponent={<Text color='#fff'>{scooter.plate}</Text>}
              rightComponent={{ icon: 'menu', color: '#fff' }}
              leftComponent={<TouchableHighlight><Icon name="angle-left" color='#fff' size={25} onPress={()=>this.props.navigation.goBack()}/></TouchableHighlight>}
              containerStyle={{
                backgroundColor: '#ff5722',
                justifyContent: 'space-around',
              }}
            />
            <ScrollView>
              <ListItem key={0} leftAvatar={<Icon name="motorcycle" />} title="車輛編號" subtitle={scooter.id} />
              <ListItem key={1} leftAvatar={<Icon name="battery-full" />} title="電量" subtitle={scooter.power+"%"} />
              <ListItem key={2} leftAvatar={<Icon name="battery-full" />} title="未租用天數" subtitle={scooter.range_days+"天"} />
            
            </ScrollView>

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
  }
});


