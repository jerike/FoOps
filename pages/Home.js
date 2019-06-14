import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight,RefreshControl } from 'react-native';
import { createDrawerNavigator, createAppContainer,NavigationActions } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { Card, ListItem,Header, Button,Image,SearchBar,ButtonGroup } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import Filter from './Filter';
import '../global.js';
import styles from '../styles/home.style';

const severe_title = global.severe_title;
const scootet_status = global.scootet_status;

export default class Home extends React.Component {
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
        scooter:[],
        all:[],
        open:false,
        refreshing: false,
        screen:'Home',
        search:''
      }
      this.updateIndex = this.updateIndex.bind(this);
      this.setModalVisible=this.setModalVisible.bind(this);
      this.onChangeWorkArea=this.onChangeWorkArea.bind(this);
      this.onChangeScooterStatus=this.onChangeScooterStatus.bind(this);
      this.onChangeSever=this.onChangeSever.bind(this);
      this.get_power_change=this.get_power_change.bind(this);
      this.get_days_change=this.get_days_change.bind(this);
      this.changeScreen=this.changeScreen.bind(this);
    }
    componentWillMount() {
        var scooter = [];
        this.setState({ search:'',modalVisible: false,condition:[]});
        if(this.props.navigation.state.params != undefined){
            scooter = this.props.navigation.state.params.scooter;
            this.setState({ scooter:scooter});
        }else{
            this.setState({ scooter:[]},()=>{this.get_scooter();});
        }
        this.get_scooter_status();
    }
    componentWillUpdate(nextProps,nextState){
        if(this.state.scooter.length > 0 && nextState.scooter != this.state.scooter){
            const navigateAction = NavigationActions.navigate({
              routeName: this.state.screen,
              params: {scooter:nextState.scooter},
              action: NavigationActions.navigate({ routeName: this.state.screen})
            })
            this.props.navigation.dispatch(navigateAction);
        }

        
    }
    //取得電動車資訊
    get_scooter(){
        var theTime = new Date();
        var reload_time = this.pad(theTime.getMonth()+1)+'/'+this.pad(theTime.getDate())+' '+this.pad(theTime.getHours())+':'+this.pad(theTime.getMinutes())+':'+this.pad(theTime.getSeconds());
        this.setState({reload_time:reload_time});
        if (this.state.all.length == 0) {
            this.fetch_scooters();
        }else{
            this.setState({scooter:this.state.all});
        }
    }
    fetch_scooters(){
        var result = []
        fetch(global.API+'/scooter',{
          method: 'GET',
          credentials: 'include'
        })
        .then((response) => {
            if(response.status == 200){
              return response.json();
            }else{
              this.props.navigation.navigate('Login');
            }
        })
        .then((json) => {
          if(json.data.length == 0){
            this.props.navigation.navigate('Login');
          }else{
            this.set_scooter_data(json.data);            
          }
        }).then(() => {
          this.setState({refreshing: false});
        });
    }
    set_scooter_data(all_scooters){

        this.setState({ 
            all:all_scooters,
            scooter:all_scooters,
            save_scooter:all_scooters,
            open:true
        },()=>{
            // this.after_reload_scooter();
            this.setState({reload_now:false});
        });
    }
    after_reload_scooter(){
        this.get_scooter_in_work_area();
        this.get_scooter_by_severe();
        this.get_scooter_by_status();
        this.filter_scooter_by_power();
        this.filter_scooter_by_rent_days();
        // this.filter_scooter_by_task();
        this.filter_scooter_by_search();
    }
    pad(number){ return (number < 10 ? '0' : '') + number }
    dateFormat(date){
      var format_date = new Date(date);
      var create_date = this.pad(format_date.getMonth()+1)+'/'+this.pad(format_date.getDate())+' '+this.pad(format_date.getHours())+':'+this.pad(format_date.getMinutes());
      return create_date;
    }
    filter_scooter_by_search(){
        if(this.state.search !=""){
            var result = [];
            
            this.state.scooter.map(function(m, i){
                if(m.plate.indexOf(this.state.search) != -1){
                  result.push(m);
                }
                
            }.bind(this));
            this.setState({ scooter:result });
        }else{
            this.setState({scooter : this.state.save_scooter});
        }
    }
    changeScreen(screen){
        this.setState({screen:screen});
    }
    updateIndex (selectedIndex) {
        if(selectedIndex == 0){
            this.setModalVisible(true);
        }else{
            this.setState({screen:'Map'});
            var filter_option = {
                setModalVisible:this.setModalVisible,
                screen:this.state.screen,
                changeScreen:this.changeScreen,
                search:this.state.search,
                updateSearch:this.updateSearch,
                save_scooter:this.state.save_scooter
            }
            this.props.navigation.navigate("Map",{scooter:this.state.scooter,filter_option});
            
            this.setState({selectedIndex});
        }
    }
    updateSearch = search => {  
        if(search != ""){
            console.warn("home:"+search);
            console.warn(this.state.screen);
            const navigateAction = NavigationActions.navigate({
              routeName: this.state.screen,
              params: {search:search},
              action: NavigationActions.navigate({ routeName: this.state.screen})
            });
            // 傳遞參數。問題是太多次
            // this.props.navigation.dispatch(navigateAction);
        }
        this.setState({search:search},()=>this.filter_scooter_by_search());
        this.setState({ search });
    }
    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }
    //取得車況
    get_scooter_status =()=>{
        fetch(global.API+'/scooter/status',{
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
    //檢查區域區外
    checkzone =(option,zone,location)=>{
        var result = true;
        var check = zone.map(function(d,k){
            var position = this.isptinpoly(location.lng,location.lat,d);
            return position;
        }.bind(this));

        if(option == "out"){
          if(check.indexOf(true) != -1){
            result = false;
          }else{
            result = true;
          }
        }
        else{
          if(check.indexOf(true) != -1){
            result = true;
          }else{
            result = false;
          }
        }

        return result;
    }
    isptinpoly = (ALon, ALat, APoints) => {
        var iSum = 0,
          iCount;
        var dLon1, dLon2, dLat1, dLat2, dLon;
        if (APoints.length < 3) return false;
        iCount = APoints.length;
        for (var i = 0; i < iCount; i++) {
          if (i == iCount - 1) {
            dLon1 = APoints[i].lng;
            dLat1 = APoints[i].lat;
            dLon2 = APoints[0].lng;
            dLat2 = APoints[0].lat;
          } else {
            dLon1 = APoints[i].lng;
            dLat1 = APoints[i].lat;
            dLon2 = APoints[i + 1].lng;
            dLat2 = APoints[i + 1].lat;
          }
          //以下語句判斷A點是否在邊的兩端點的水平平行線之間，在則可能有交點，開始判斷交點是否在左射線上
          if (((ALat >= dLat1) && (ALat < dLat2)) || ((ALat >= dLat2) && (ALat < dLat1))) {
            if (Math.abs(dLat1 - dLat2) > 0) {
              //得到A點向左射線與邊的交點的x坐標：
              dLon = dLon1 - ((dLon1 - dLon2) * (dLat1 - ALat)) / (dLat1 - dLat2);
              if (dLon < ALon)
                iSum++;
            }
          }
        }
        if (iSum % 2 != 0)
          return true;
        return false;
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
    get_scooter_in_work_area(){
        var area = this.state.sel_work_area;
        var result = [];
        if(area != null){
            fetch(global.API+'/scooter/work_area/'+area,{
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
    onChangeScooterStatus(type){
        if(this.state.sel_scooter_status == null){
            this.setState({sel_scooter_status:type}, () => {
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
    _onRefresh = () => {
        this.setState({refreshing: true});
        fetch(global.API+'/tools/clear_cache_key/all_scooter',{
            method: 'GET',
            credentials: 'include'
        }).then((response) => {
          this.setState({all: []});
          this.get_scooter();
        });
    }
    render() {
        const component1 = () => <View style={{flexDirection: 'row',justifyContent: "center", alignItems: "center"}}><Icon name="filter" style={{marginRight:10}} /><Text>篩選</Text></View>
        const component2 = () => <View style={{flexDirection: 'row',justifyContent: "center", alignItems: "center"}}><Icon name="map" style={{marginRight:10}} /><Text>地圖</Text></View>
        const buttons = [{ element: component1 }, { element: component2 }]
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
            days_change:this.get_days_change,
            scooter:this.state.scooter,
            sel_task:this.state.sel_task,
            onChangeTask:this.onChangeTask,
            modalVisible:this.state.modalVisible,
            setModalVisible:this.setModalVisible
        }


        var items = scooter.map(function(m,i){
            var stats_type = this.get_status_type(m.status);
            var severe_lvl = this.get_severe_lvl(m.severe);
            var card_header = <View style={{flexDirection: 'row',justifyContent:'space-between',marginBottom:10}}><Icon name="motorcycle"  size={20} style={{marginRight:10}}/><Text>{m.plate}</Text><Text>{severe_lvl}</Text></View>;
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
            var status_content = (scooter_status != "") ? <Text style={{marginBottom: 10}}>{scooter_status}</Text> : [];
            return (
                <Card containerStyle={styles.cardContainerStyle} key={i} >
                    <View>{card_header}</View>
                    <View style={{flexDirection: 'row',marginBottom: 10,justifyContent:'space-between'}}>
                        <Text>{stats_type}</Text>
                        <Text>{power_msg}</Text>
                    </View>
                    <View>{status_content}</View>
                    <Text style={{marginBottom: 10,color:'#f00',fontWeight:'bold'}}>{m.range_days} 天未租用</Text>
                </Card>
            )
        }.bind(this))


        return (
        <View style={{flex: 1, backgroundColor: '#F5F5F5'}}>
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
            <ScrollView style={{flexDirection:'column' }} refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefresh}
              />
            }>
                {items}
            </ScrollView>
        </View>
         
        );
    }
}

