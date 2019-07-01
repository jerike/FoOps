import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight,RefreshControl,ActivityIndicator,TouchableOpacity } from 'react-native';
import { createDrawerNavigator, createAppContainer,NavigationActions } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { Card, ListItem,Header, Button,Image,SearchBar,ButtonGroup,Avatar } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
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
        avatar:global.avatar
      }
      this.updateIndex = this.updateIndex.bind(this);
      this.setModalVisible=this.setModalVisible.bind(this);
      this.changeScreen=this.changeScreen.bind(this);
      this.showDetail=this.showDetail.bind(this);
      this.onClear=this.onClear.bind(this);
      this.updateSearch=this.updateSearch.bind(this);
      this.filter_scooter=this.filter_scooter.bind(this);
      this.getStorage=this.getStorage.bind(this);
    }
    componentWillMount() {
        global.page = 'home';
        var scooter = [];
        this.setState({ search:'',condition:[]});
        if(this.props.navigation.state.params != undefined){
            scooter = this.props.navigation.state.params.scooter;
            this.setState({ scooter:scooter});
        }else{
            this.setState({ scooter:[]},()=>{this.get_scooter();});
        }
        this.get_scooter_status();
    }
    shouldComponentUpdate(nextProps, nextState){
        return shallowCompare(this, nextProps, nextState);
    }   
    componentWillUpdate(nextProps,nextState){
        if(this.state.scooter.length > 0 && nextState.scooter != this.state.scooter){
            const navigateAction = NavigationActions.navigate({
              routeName: this.state.screen,
              params: {scooter:nextState.scooter,changed:true},
              action: NavigationActions.navigate({ routeName: this.state.screen})
            })
            this.props.navigation.dispatch(navigateAction);
        }
        
        if(nextProps.navigation.state.params != undefined){
            if(nextProps.navigation.state.params.jump2map !=undefined){
                jump2map = nextProps.navigation.state.params.jump2map;
                if(jump2map){
                    this.updateIndex(1);
                }
            }
        }
    }
    componentDidMount(){
        this.getStorage();


    }
    getStorage = async () => {
        try {
          const avatar = await AsyncStorage.getItem('@FoOps:avatar');
          if (avatar !== null) {
            this.setState({avatar:avatar});
          }
          const task = await AsyncStorage.getItem('@FoOps:task');
          if (task !== null) {
            global.task = task;
          }
        } catch (error) {
          console.warn(error);
        }
    }
    filter_scooter(scooter){
        this.setState({scooter:scooter});
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
        this.setState({ 
            all:all_scooters,
            scooter:all_scooters,
            save_scooter:all_scooters,
            open:true
        },()=>{
            this.after_reload_scooter();
            this.setState({reload_now:false});
        });
    }
    after_reload_scooter(){
        
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
        this.setState({show_loading:false});
    }
    changeScreen(screen){
        this.setState({screen:screen});
    }
    updateIndex (selectedIndex) {

        if(selectedIndex == 0){
            global.page = "home";
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
            
        }
    }
    onClear(){
        this.setState({search:""});
    }
    updateSearch(search){  
        this.setState({search:search,show_loading:true});
        setTimeout(()=>{
          this.filter_scooter_by_search();
        },100);

        const navigateAction = NavigationActions.navigate({
          routeName: this.state.screen,
          params: {search:search},
          action: NavigationActions.navigate({ routeName: this.state.screen})
        });
        this.props.navigation.dispatch(navigateAction);

    }
    setModalVisible(visible) {
        if(global.page=="map"){
            this.updateIndex (1);
        }
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
            global.condition = JSON.stringify(json.data);
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
    showDetail(sid){
        this.props.navigation.navigate('ScooterDetail',{scooter:sid});
    }
    render() {
        const component1 = () => <View style={{flexDirection: 'row',justifyContent: "center", alignItems: "center"}}><Icon name="filter" style={{marginRight:10}} /><Text>篩選</Text></View>
        const component2 = () => <View style={{flexDirection: 'row',justifyContent: "center", alignItems: "center"}}><Icon name="map" style={{marginRight:10}} /><Text>地圖</Text></View>
        const buttons = [{ element: component1 }, { element: component2 }]
        const {search,selectedIndex,scooter,open} = this.state;
        var filter_option = {
            all:this.state.all,
            scooter:this.state.scooter,
            modalVisible:this.state.modalVisible,
            setModalVisible:this.setModalVisible,
            filter_scooter:this.filter_scooter
        }
        var show_loading = this.state.show_loading;
        if(!open){
            show_loading = true;
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
                <TouchableOpacity key={i} onPress={() =>this.showDetail(m.id)}> 
                    <Card containerStyle={styles.cardContainerStyle} key={i} >
                        <View>{card_header}</View>
                        <View style={{flexDirection: 'row',marginBottom: 10,justifyContent:'space-between'}}>
                            <Text>{stats_type}</Text>
                            <Text>{power_msg}</Text>
                        </View>
                        <View>{status_content}</View>
                        <Text style={{marginBottom: 10,color:'#f00',fontWeight:'bold'}}>{m.range_days} 天未租用</Text>
                    </Card>
                </TouchableOpacity>
            )
        }.bind(this))
        return (
        <View style={{flex: 1,justifyContent: 'center',
        alignItems: 'center', backgroundColor: '#F5F5F5'}}>
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
            {show_loading &&(
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#ffffff" style={{marginBottom:5}} />
                <Text style={{color:'#fff'}}>讀取中，請稍候...</Text>
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
        </View>
         
        );
    }
}

