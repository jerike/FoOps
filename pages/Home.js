import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { Card, ListItem,Header, Button, Icon,Image,SearchBar,ButtonGroup } from 'react-native-elements'
import MapScreen from './MapScreen';
import Filter from './Filter';

const severe_title=["優先處理","次要處理","待處理","正常"];
const scootet_status = [{"type":"FREE","title":"尚未服務"},{"type":"RESERVED","title":"預約中"},{"type":"RIDING","title":"使用中"},{"type":"MAINTENANCE","title":"暫停服務"}];

class Home extends React.Component {
    constructor () {
      super()
      this.state = {
        selectedIndex: 1,
        sel_work_area:null,
        power_min:0,
        power_max:100,
        day_min:0,
        day_max:100,
        sel_work_area:null,
        sel_severe_data:null,
        sel_scooter_status:null,
        all_work_area:[],
        sel_scooter:{},
        sel_condition:[],
      }
      this.updateIndex = this.updateIndex.bind(this);
      this.setModalVisible=this.setModalVisible.bind(this);
      this.onChangeWorkArea=this.onChangeWorkArea.bind(this);
      this.onChangeScooterStatus=this.onChangeScooterStatus.bind(this);
      this.get_power_change=this.get_power_change.bind(this);
    }
    componentWillMount() {
        var API = this.props.navigation.state.params.API;
        this.setState({ API: API,search:'',modalVisible: false,scooter:[],condition:[] });
        this.get_scooter(API);
        this.get_scooter_status(API);
        
    }
    //取得電動車資訊
    get_scooter(API){
        var theTime = new Date();
        var reload_time = this.pad(theTime.getMonth()+1)+'/'+this.pad(theTime.getDate())+' '+this.pad(theTime.getHours())+':'+this.pad(theTime.getMinutes())+':'+this.pad(theTime.getSeconds());
        this.setState({reload_time:reload_time});
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
    get_power_change(value){
        this.setState({power_min:value.selectedMinimum,power_max:value.selectedMaximum});
        setTimeout(()=>{
          this.filter_scooter_by_power();
        },10);
    }
    filter_scooter_by_power(){
        var result = new Array();
        this.state.scooter.map(function(m, i){
            var pushed = true;
            //判斷狀態
            if(m.power >= this.state.power_min && m.power <= this.state.power_max){
              pushed = true;
            }else{
              pushed = false;
            }
            if(pushed){
              result.push(m);
            }
        }.bind(this));
        this.setState({ scooter:result });
    }
    get_days_change(value){
        this.setState({day_min:value.selectedMinimum,day_max:value.selectedMaximum});
        setTimeout(()=>{
          this.filter_scooter_by_rent_days();
        },10);
    }
    filter_scooter_by_rent_days(){
        var result = new Array();
        this.state.scooter.map(function(m, i){
            var pushed = true;
            if(this.state.day_max == 100){
                if(m.range_days >= this.state.day_min){
                  pushed = true;
                }else{
                  pushed = false;
                }
            }else{
                if(m.range_days >= this.state.day_min && m.range_days <= this.state.day_max){
                    pushed = true;
                }else{
                  pushed = false;
                }
            }
            if(pushed){
              result.push(m);
            }
        }.bind(this));
        this.setState({ scooter:result });
    }
    // 選擇工作區域
    onChangeWorkArea(area){
        // 帶入區域內經緯度資料
        if(this.state.sel_work_area == null){
            this.setState({sel_work_area:area}, () => {
                this.get_scooter_in_work_area();
            });
        }else{
            this.setState({sel_work_area:null}, () => {
                this.get_scooter();
            });
        }
    }
    get_scooter_in_work_area(API){
        // console.log(this.state.sel_work_area);
        var area = this.state.sel_work_area;
        var result = [];
        if(area != null){
            fetch(API+'/scooter/work_area/'+area,{
                  method: 'GET'
              })
            .then((response) => response.json())
            .then((json) => {
                var zone = [];
                zone.push(json);
                this.state.scooter.map(function(m, i){
                    var istrue = this.checkzone('in',zone,m.location);
                    if(istrue){
                      result.push(m);
                    }
                }.bind(this));
                this.setState({ scooter:result });
            });
        }
    }

    // 選擇車輛狀況
    onChangeSever(e){
        if(this.state.sel_severe_data == null){
            this.setState({sel_severe_data:e}, () => {
                this.get_scooter_by_severe();
            });
        }else{
            this.setState({sel_severe_data:null}, () => {
                this.get_scooter();
            });
        }
    }
    get_scooter_by_severe(){
        var severe = this.state.sel_severe_data;
        var result = [];
        if(severe != ""){
            this.state.scooter.map(function(m, i){
                if(m.severe == severe){
                  result.push(m);
                }
            }.bind(this));
            this.setState({ scooter:result });
        }
    }
    // 選擇服務狀態
    onChangeScooterStatus(e){
        if(this.state.sel_scooter_status == null){
            this.setState({sel_scooter_status:e.type}, () => {
                this.get_scooter_by_status();
            });
        }else{
            this.setState({sel_scooter_status:null}, () => {
                this.get_scooter();
            });
        }
    }
    get_scooter_by_status(){
        var status = this.state.sel_scooter_status;
        var result = [];
        if(status != ""){
            this.state.scooter.map(function(m, i){
                if(m.status == status){
                  result.push(m);
                }
            }.bind(this));
            this.setState({ scooter:result });
        }
    }

    render() {
        const component1 = () => <Text>篩選</Text>
        const component2 = () => <Text>列表</Text>
        const component3 = () => <Text>地圖</Text>
        const buttons = [{ element: component1 }, { element: component2 }, { element: component3 }]
        const {search,selectedIndex,scooter} = this.state;
        var filter_option = {
            power_min:this.state.power_min,
            power_max:this.state.power_max,
            day_min:this.state.day_min,
            day_max:this.state.day_max,
            sel_work_area:this.state.sel_work_area,
            sel_severe_data:this.state.sel_severe_data,
            sel_scooter_status:this.state.sel_scooter_status,
            work_area:this.state.work_area,
            severe_title:this.state.severe_title,
            scootet_status:this.state.scootet_status,
            onChangeWorkArea:this.onChangeWorkArea,
            onChangeScooterStatus:this.onChangeScooterStatus,
            onChangeSever:this.onChangeSever,
            power_change:this.get_power_change,
            days_change:this.days_change,
            scooter:this.state.scooter,
            sel_task:this.state.sel_task,
            onChangeTask:this.onChangeTask,
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
            <Filter filter_option={filter_option}/>
            <ButtonGroup
              onPress={this.updateIndex}
              selectedIndex={selectedIndex}
              buttons={buttons}
              containerStyle={styles.btn_containerStyle}
              buttonStyle={styles.btn_buttonStyle}
              selectedButtonStyle={styles.btn_selectedButtonStyle}
            />
            <ScrollView style={{flexDirection:'column' }}>
                 {items}
            </ScrollView>
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
const TabNavigator = createDrawerNavigator({
  "篩選": { screen: Home },
  "列表": { screen: Home },
  "地圖": { screen: MapScreen },
});

export default createAppContainer(TabNavigator);
