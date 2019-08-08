import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight,RefreshControl,ActivityIndicator,TouchableOpacity,BackHandler,Platform } from 'react-native';
import { createDrawerNavigator, createAppContainer,NavigationActions } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { Card, ListItem,Header, Button,Image,SearchBar,ButtonGroup,Avatar,Badge } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome5';
import Filter from './Filter';
import '../global.js';
import styles from '../styles/home.style';
import shallowCompare from 'react-addons-shallow-compare';
const severe_title = global.severe_title;
const scootet_status = global.scootet_status;

export default class Home extends React.Component {
    constructor () {
      super()
      this.state = {
        selectedIndex: 1,
        selectedIndex2: null,
        selectedIndex2_sort:"asc",
        sel_scooter:{},
        sel_condition:[],
        scooter:[],
        all:[],
        open:false,
        refreshing: false,
        screen:'Home',
        search:'',
        show_loading:false,
        modalVisible:false,
        jump2map:false,
        toSearch:false,
        hit_sort:false,
        select_sort:null
      }
      this.updateIndex = this.updateIndex.bind(this);
      this.selectSort=this.selectSort.bind(this);
      this.setModalVisible=this.setModalVisible.bind(this);
      this.changeScreen=this.changeScreen.bind(this);
      this.showDetail=this.showDetail.bind(this);
      this.onClear=this.onClear.bind(this);
      this.updateSearch=this.updateSearch.bind(this);
      this.filter_scooter=this.filter_scooter.bind(this);
      this.getStorage=this.getStorage.bind(this);
      this.filter_scooter_by_search=this.filter_scooter_by_search.bind(this);
      this.SortType=this.SortType.bind(this);
    }
    componentWillMount() {
        global.page = 'Home';
        var select_severe = global.select_severe;
        this.setState({scooter:[],select_severe:select_severe, search:'',condition:[],avatar:global.avatar});
        this.get_geofence();
        this.get_work_area();
        this.get_scooter_status();
    }
    componentDidMount(){
        this.getStorage();
        setTimeout(()=>{this.get_scooter()},10);
        if (Platform.OS === 'android') {
           BackHandler.addEventListener('hardwareBackPress',()=>{this.props.navigation.goBack()});
        }
    }
    shouldComponentUpdate(nextProps, nextState){
        return shallowCompare(this, nextProps, nextState);
    }   
    componentWillUpdate(nextProps,nextState){
        // if(this.state.scooter.length > 0 && nextState.scooter != this.state.scooter){
        //     const navigateAction = NavigationActions.navigate({
        //       routeName: global.page,
        //       params: {scooter:nextState.scooter,changed:true},
        //       action: NavigationActions.navigate({ routeName: global.page})
        //     })
        //     this.props.navigation.dispatch(navigateAction);
        // }
        
        // if(nextProps.navigation.state.params != undefined){
        //     if(nextProps.navigation.state.params.jump2map !=undefined){
        //         jump2map = nextProps.navigation.state.params.jump2map;
        //         if(jump2map){
        //             this.updateIndex(1);
        //         }
        //     }
        // }
    }
    getScooterStorage = async () => {
        try {
            const value = await AsyncStorage.getItem('@FoOps:scooters');
            if (value !== null) {
                global.scooters = JSON.parse(value);
                this.setState({scooter:global.scooters,open:true});
            }
           
        } catch (error) {
          console.warn(error);
        }
    }
    getStorage = async () => {
        try {
            const task = await AsyncStorage.getItem('@FoOps:task');
                if (task !== null) {
                global.task = task;
            }
        } catch (error) {
          console.warn(error);
        }
    }
    filter_scooter(scooter){
        global.scooter = scooter;
        this.setState({scooter:scooter});
    }
    get_work_area = () =>{
        //取得工作區域
        fetch(global.API+'/scooter/get_all_work_zone',{
            method: 'GET',
          credentials: 'include'
        })
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            if(json.code == 1){
              global.all_work_area = json.data;
            }
        });
    }
    get_geofence =()=>{
        //取得電子柵欄
        fetch(global.API+'/tools/get_geofence',{
           method: 'GET',
           credentials: 'include'
        })
        .then((response) => response.json())
        .then((json)=> {
          global.geofence = json.data;
        });
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
              global.condition = json.data;
              this.setState({ condition:json.data });
            }else{
              alert(json.reason);
            }
        });
    }
    get_timestamp(){
        var theTime = new Date();
        var reload_time = this.pad(theTime.getMonth()+1)+'/'+this.pad(theTime.getDate())+' '+this.pad(theTime.getHours())+':'+this.pad(theTime.getMinutes())+':'+this.pad(theTime.getSeconds());
        return reload_time;
    }
    //取得電動車資訊
    get_scooter(){
        var reload_time = this.get_timestamp();
        this.setState({reload_time:reload_time});
        global.reload_time = reload_time;
        if (global.scooters == undefined) {
            this.getScooterStorage();
        }else{
            this.setState({scooter:global.scooter,open:true});
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
              this.props.navigation.navigate('TimeOut');
            }
        })
        .then((json) => {
          if(json.data.length == 0){
            this.props.navigation.navigate('TimeOut');
          }else{
            this.set_scooter_data(json.data);            
          }
        }).then(() => {
          this.setState({refreshing: false});
        });
    }
    set_scooter_data(all_scooters){
        var reload_time = this.get_timestamp();
        this.setState({reload_time:reload_time});
        global.reload_time = reload_time;
        global.scooters = all_scooters;
        global.scooter = all_scooters;
        this.setState({ 
            scooter:all_scooters,
            save_scooter:all_scooters,
            open:true
        },()=>{
            this.after_reload_scooter();
            this.setState({reload_now:false});
        });
    }
    after_reload_scooter(){
        if(this.state.select_sort != null){
            this.setState({selectedIndex2:null},()=>{this.SortType(this.state.select_sort)});
        }
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
            
            global.scooter.map(function(m, i){
                if(m.plate.indexOf(this.state.search) != -1){
                  result.push(m);
                }
                
            }.bind(this));
            this.setState({ scooter:result });
        }else{
            this.setState({scooter : global.scooter});
        }
        this.setState({show_loading:false});
    }
    changeScreen(screen){
        this.setState({screen:screen});
    }
    updateIndex (selectedIndex) {

        if(selectedIndex == 0){
            global.page = "Home";
            this.setModalVisible(true);
        }else{
            this.setState({screen:'Map'});
            this.props.navigation.navigate("Map");
            
        }
    }
    selectSort(selectedIndex){
        if(!this.state.hit_sort){
            this.setState({show_loading:true,hit_sort:true,select_sort:selectedIndex});
            setTimeout(()=>{this.SortType(selectedIndex)},10);
        }
    }
    SortType(selectedIndex){
        var scooter = this.state.scooter;
        var sort = this.state.selectedIndex2_sort;
        if(parseInt(selectedIndex) === this.state.selectedIndex2){
            sort = (sort == "asc") ? "desc" : "asc";
            this.setState({selectedIndex2_sort:sort});
        }else{
            this.setState({selectedIndex2_sort:"asc"});
        }
        switch(selectedIndex){
            case 0:
                scooter = scooter.sort(function (a, b) {
                    if(sort == "asc"){
                        return a.plate > b.plate ? 1 : -1;       
                    }else{
                        return a.plate < b.plate ? 1 : -1;
                    }
                });
            break;
            case 1:
                scooter = scooter.sort(function (a, b) {
                    if(sort == "asc"){
                        return a.power > b.power ? 1 : -1;       
                    }else{
                        return a.power < b.power ? 1 : -1;
                    }
                });
            break;
            case 2:
                scooter = scooter.sort(function (a, b) {
                    if(sort == "asc"){
                        return a.status > b.status ? 1 : -1;       
                    }else{
                        return a.status < b.status ? 1 : -1;
                    }
                });
            break;
            case 3:
                scooter = scooter.sort(function (a, b) {
                    if(sort == "asc"){
                        return a.severe > b.severe ? 1 : -1;       
                    }else{
                        return a.severe < b.severe ? 1 : -1;
                    }
                });
            break;
        }
        setTimeout(()=>{this.setState({show_loading:false,hit_sort:false})},100);
        this.setState({scooter:scooter,selectedIndex2:selectedIndex});
    }

    onClear(){
        global.search = "";
        this.setState({search:"",toSearch:false});
    }
    updateSearch(search){  
        this.setState({search:search,show_loading:true,toSearch:true});
        setTimeout(()=>{
            this.filter_scooter_by_search();
        },10);
        global.search = search;
        

    }
    setModalVisible(visible) {
        if(global.page=="Map"){
            this.updateIndex (1);
        }
        this.setState({modalVisible: visible});
    }
   
    get_status_type(type){
        var result = "";
        var scooter_color = ['error','primary','success','warning'];
        scootet_status.map(function(m,i){
            if(m.type == type){
                result = <Badge status={scooter_color[i]} value={<Text style={{fontSize:11,padding:5,color:'#fff'}}>{m.title}</Text>} />;
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
        var condition = this.state.condition;
        condition.map(function(m, i){
            if(parseInt(m.id) == parseInt(id)){
                var description = m.description;
                if(m.name.indexOf('(option)') != -1){
                    description = m.description + "_option";
                }
              
                result = description;
            }
        });
        return result;
    }
    
    
    
    _onRefresh = () => {
        this.setState({refreshing: true});
        fetch(global.API+'/tools/clear_cache_key/all_scooter',{
            method: 'GET',
            credentials: 'include'
        }).then((response) => {
          this.setState({all: []});
          this.fetch_scooters();
        });
    }
    showDetail(sid){
        this.props.navigation.navigate('ScooterDetail',{scooter:sid});
    }
    render() {
        const component1 = () => <View style={{flexDirection: 'row',justifyContent: "center", alignItems: "center"}}><Icon name="filter" style={{marginRight:10}} /><Text>篩選</Text></View>
        const component2 = () => <View style={{flexDirection: 'row',justifyContent: "center", alignItems: "center"}}><Icon name="map" style={{marginRight:10}} /><Text>地圖</Text></View>
        const buttons = [{ element: component1 }, { element: component2 }]
        var c1 = (this.state.selectedIndex2 === 0) ? ((this.state.selectedIndex2_sort == "asc") ? "🔺車牌" : "🔻車牌") : "車牌" ;
        var c2 = (this.state.selectedIndex2 === 1) ? ((this.state.selectedIndex2_sort == "asc") ? "🔺電量" : "🔻電量") : "電量" ;
        var c3 = (this.state.selectedIndex2 === 2) ? ((this.state.selectedIndex2_sort == "asc") ? "🔺服務" : "🔻服務") : "服務" ;
        var c4 = (this.state.selectedIndex2 === 3) ? ((this.state.selectedIndex2_sort == "asc") ? "🔺狀態" : "🔻狀態") : "狀態" ;
        const buttons2 = [c1, c2,c3,c4];
        // const buttons2 = [{ element: c1 }, { element: c2 }, { element: c3 }, { element: c4 }]
        const {selectedIndex,open,toSearch,selectedIndex2} = this.state;
        var scooter = this.state.scooter;
        var search = global.search;
        if(search != undefined && this.state.search != search){
            this.updateSearch(search);
        }
        var filter_option = {
            modalVisible:this.state.modalVisible,
            setModalVisible:this.setModalVisible,
            filter_scooter:this.filter_scooter
        }
        var show_loading = this.state.show_loading;
        if(!open){
            show_loading = true;
        }
        
        var items = scooter.map(function(m,i){
            if(global.select_severe != undefined){
                if(m.severe != global.select_severe){
                    return;
                }
            }
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
                    if(description.indexOf("_option") != -1){
                        // console.log(m.ticket.other_conditions);
                        m.ticket.other_conditions.map(function(s,i){
                            if(s.id == d){

                                conditions.push(description.replace("_option",":")+s.summary);
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
            var power_msg = show_power;
            var status_content = (scooter_status != "") ? <Text style={{marginBottom: 10}}>{scooter_status}</Text> : [];
            return (
                <TouchableOpacity key={i} onPress={() =>this.showDetail(m.id)}> 
                    <Card containerStyle={styles.cardContainerStyle} key={i} >
                        <View>{card_header}</View>
                        <View style={{flexDirection: 'row',marginBottom: 10,justifyContent:'space-between'}}>
                            {stats_type}
                            <Text>{power_msg}</Text>
                        </View>
                        <View>{status_content}</View>
                        <Text style={{marginBottom: 10,color:'#f00',fontWeight:'bold'}}>{m.range_days} 天未租用</Text>
                    </Card>
                </TouchableOpacity>
            )
        }.bind(this));
        return (
        <SafeAreaView style={{flex: 1,justifyContent: 'center',
        alignItems: 'center',backgroundColor: '#ff5722'}}>
            <Header
              leftComponent={<Avatar rounded source={{uri:'https://gokube.com/images/logo.png'}} overlayContainerStyle={{backgroundColor:'transparent'}} />}
              centerComponent={<SearchBar
                                placeholder="搜尋..."
                                onChangeText={text => this.updateSearch(text)}
                                onClear={this.onClear}
                                value={search}
                                round
                                containerStyle={styles.search_container}
                                inputContainerStyle={styles.search_input}
                                inputStyle={styles.input}
                                lightTheme={true}
                                autoCorrect={true}  
                              />}
              rightComponent={<Avatar rounded source={{uri:this.state.avatar}} onPress={()=>this.props.navigation.toggleDrawer()} />}
              containerStyle={styles.header}
            />
            <View style={{flex: 1,justifyContent: 'center',
        alignItems: 'center',backgroundColor:'#F5F5F5'}}>
                <Filter filter_option={filter_option}/>
                <ButtonGroup
                  onPress={this.updateIndex}
                  selectedIndex={selectedIndex}
                  buttons={buttons}
                  containerStyle={styles.btn_containerStyle}
                  buttonStyle={styles.btn_buttonStyle}
                  selectedButtonStyle={styles.btn_selectedButtonStyle}
                />
                <ButtonGroup
                  onPress={this.selectSort}
                  selectedIndex={selectedIndex2}
                  buttons={buttons2}
                  containerStyle={styles.btn2_containerStyle}
                  buttonStyle={styles.btn2_buttonStyle}
                  selectedButtonStyle={styles.btn2_selectedButtonStyle}
                  textStyle={styles.btn2_textStyle}
                  selectedTextStyle={styles.btn2_selectedTextStyle}
                />
                {show_loading &&(
                  <View style={styles.loading}>
                    <ActivityIndicator size="large" color="#ffffff" style={{marginBottom:5}} />
                    <Text style={{color:'#fff'}}>資料獲取中...</Text>
                  </View>
                )}



                <ScrollView style={{width:'100%'}}  refreshControl={
                  <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this._onRefresh}
                  />
                }>
                    {open ? items : []
                    }
                </ScrollView>
                <View style={{position:'absolute',bottom:0,right:0,padding:2,backgroundColor:'rgba(0,0,0,0.6)'}}>
                   <Text style={{fontSize:11,color:'#fff'}}>最後更新時間：{global.reload_time}</Text>
                </View>
            </View>
        </SafeAreaView>
         
        );
    }
}

