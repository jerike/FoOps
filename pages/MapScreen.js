import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { Card, ListItem,Header, Button, Icon,Image,SearchBar,ButtonGroup } from 'react-native-elements'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Filter from './Filter';


const severe_title=["優先處理","次要處理","待處理","正常"];
const scootet_status = [{"type":"FREE","title":"尚未服務"},{"type":"RESERVED","title":"預約中"},{"type":"RIDING","title":"使用中"},{"type":"MAINTENANCE","title":"暫停服務"}];

export default class MapScreen extends React.Component {
    constructor () {
      super()
      this.state = {
        selectedIndex: null
      }
      this.updateIndex = this.updateIndex.bind(this)
    }
    componentWillMount() {
        var API = this.props.navigation.state.params.API;
        this.setState({ API: API,search:'',modalVisible: false,scooter:[],condition:[] });
        this.get_scooter_status(API);
        fetch(API+'/scooter',{
            method: 'GET',
            credentials: 'include'
          })
          .then((response) => {
                return response.json();
          })
          .then((json) => {
              this.setState({scooter:json.data});
          }); 
    }

    pad(number){ return (number < 10 ? '0' : '') + number }
    dateFormat(date){
      var format_date = new Date(date);
      var create_date = this.pad(format_date.getMonth()+1)+'/'+this.pad(format_date.getDate())+' '+this.pad(format_date.getHours())+':'+this.pad(format_date.getMinutes());
      return create_date;
    }
    updateIndex (selectedIndex) {
        if(selectedIndex == 0){
            this.setModalVisible(true);
        }else{
            if(selectedIndex == 1){
                this.props.navigation.navigate("列表");
            }else{
                this.props.navigation.navigate("地圖");
            }
            this.setState({selectedIndex});
        }
    }
    updateSearch = search => {
      this.setState({ search });
    }
    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }
    //取得車況
    get_scooter_status =(API)=>{
        fetch(API+'/scooter/status',{
          method: 'GET'
        })
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          if(json.code == 1){
            this.setState({ condition:json.data });
          }else{
            alert(json.reason);
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
    render() {
        const component1 = () => <Text>篩選</Text>
        const component2 = () => <Text>列表</Text>
        const component3 = () => <Text>地圖</Text>
        const buttons = [{ element: component1 }, { element: component2 }]
        const {search,selectedIndex,scooter} = this.state;
        const filter_option = {
            modalVisible:this.state.modalVisible,
            setModalVisible:this.setModalVisible
        }
        var items = scooter.map(function(m,i){
            var stats_type = this.get_status_type(m.status);
            var severe_lvl = this.get_severe_lvl(m.severe);
            var card_header = <div>{severe_lvl}</div>;
            // var local_task = localStorage.getItem('task');
            // var task = [];
            // if(local_task){
            //     task = $.map(local_task.split(','), function(value){
            //         return parseInt(value, 10);
            //     });
            // }
            // if (task.indexOf(m.id) != -1) {
            //     card_header = <div>{severe_lvl}<div className={styles.task_icon}><Icon name="thumbtack" /></div></div>
            // }
            
            var show_power = "";
            var power_type = "";
            var power = m.power;
            var ticket_id = "";
            var conditions = [];
            var scooter_status = "";
            switch(true){
                case power >= 50:
                    show_power = <Text style={{color:'#28a745'}}>電量：{power}%</Text>
                break;
                case power >= 20 && power < 50:
                    show_power = <Text style={{color:'#FF8800'}}>電量：{power}%</Text>
                break;
                case power < 20:
                    show_power = <Text style={{color:'#f00'}}>電量：{power}%</Text>
                break;
            }
            if(m.ticket){
              if(m.ticket.scooter_conditions){
                m.ticket.scooter_conditions.map(function(d,k){
                  var description = this.getConditions(d);
                    if(description == "其他"){
                        // console.log(m.ticket.other_conditions);
                        m.ticket.other_conditions.map(function(s,i){
                            if(s.id == d){

                                conditions.push(s.summary);
                            }
                        });
                    }else{
                        conditions.push(description);
                    }
                }.bind(this));
                
              }

              if(m.ticket.id != undefined){
                scooter_status = <Text>車況：【{conditions.join(" 、 ")}】</Text>;
              }
            }
            var last_rental_day = (m.last_rental == "") ? "無" : this.dateFormat(m.last_rental);
            var card_thumb = (m.severe != 4) ? "https://i.imgur.com/N0jlChK.png" : ""; 
            var power_msg = show_power
            return (
                <Card
                  title={m.plate}
                  featuredTitle="xxx"
                >
                    <View style={{flex: 1, flexDirection: 'row',marginBottom: 10,}}>
                        <View style={{width: '50%'}} ><Text>{stats_type}</Text></View>
                        <View style={{width: '50%'}} ><Text>{power_msg}</Text></View>
                    </View>
                    <Text style={{marginBottom: 10}}>{scooter_status}</Text>
                    <Text style={{marginBottom: 10,color:'#f00',fontWeight:'bold'}}>﹝{m.range_days}﹞天未租用</Text>
                    
                </Card>

            )
        }.bind(this))


        return (
        <View style={{flex: 1, backgroundColor: '#ccc'}}>
            <Header
              
              centerComponent={<SearchBar
                                placeholder="搜尋..."
                                onChangeText={this.updateSearch}
                                value={search}
                                containerStyle={styles.search_container}
                                inputContainerStyle={styles.search_input}
                                inputStyle={styles.input}
                                lightTheme={true}
                              />}
              rightComponent={{ icon: 'menu', color: '#fff' }}
              containerStyle={{
                backgroundColor: '#ff5722',
                justifyContent: 'space-around',
              }}
            />
            <ButtonGroup
              onPress={this.updateIndex}
              selectedIndex={selectedIndex}
              buttons={buttons}
              containerStyle={styles.btn_containerStyle}
              buttonStyle={styles.btn_buttonStyle}
              selectedButtonStyle={styles.btn_selectedButtonStyle}
            />
             <MapView
             provider={PROVIDER_GOOGLE}
                initialRegion={{
                  latitude: 37.78825,
                  longitude: -122.4324,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              />
        </View>
         
        );
    }
}


const styles = StyleSheet.create({
  search_container: {
    backgroundColor:'#ff5722',
    paddingTop:-50,
    
    borderWidth:0,
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent'
  },
  search_input: {
    width:'100%',
    marginTop:-10,
    backgroundColor:'#fff',
    borderWidth: 0,
    height:15,
    borderBottomLeftRadius:20,
    borderBottomRightRadius:20,
    borderTopLeftRadius:20,
    borderTopRightRadius:20
  },
  input:{
    fontSize:12,
    borderWidth: 0,
  },
  containerStyle:{
    margin:0,
    padding:0,

  },
    btn_containerStyle: {
        height: 30,
        width: '100%',
        // borderTopRightRadius: 20,
        borderWidth: 0,
        backgroundColor: '#fff',
        marginTop: 0,
        borderRadius: 0,
        paddingLeft:0,
        marginLeft:0,
        marginBottom:0,
    },
    btn_buttonStyle: {
        backgroundColor: '#fff',

        borderWidth: 0,
    },
    btn_selectedButtonStyle: {
        backgroundColor: '#fff'
    }
});

