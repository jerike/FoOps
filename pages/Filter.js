import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight,ActivityIndicator } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { Card, ListItem,Header, Button,Image,SearchBar,ButtonGroup,CheckBox,Slider } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import shallowCompare from 'react-addons-shallow-compare';
const work_area = [] 
for(var i=0 ; i<6 ; i++){
    work_area.push({area:"區域"+(parseInt(i)+1),value:"KS_Zone"+(parseInt(i)+1)})
} 
const severe_title=["優先處理",null,"處理中"];

const scootet_status = [{"type":"FREE","title":"尚未服務"},{"type":"RESERVED","title":"預約中"},{"type":"RIDING","title":"使用中"},{"type":"MAINTENANCE","title":"暫停服務"}];
const delay = (s) => {
  return new Promise(function(resolve){ 
    setTimeout(resolve,s);               
  });
};
export default class Filter extends React.Component {
    constructor () {
      super()
      this.state = {
        selectedIndex: 2,
        value:100,
        show_loading:false,
        power_min:0,
        power_max:100,
        day_min:0,
        day_max:500,
        sel_work_area:null,
        sel_severe_data:null,
        sel_scooter_status:null,
        all_work_area:[],
        rangeSlide:false,
        powerSliderValue: null,
        daysSliderValue:0,
        task:"",
        sel_task:false,
        sel_FOCP:false,
        scooter:[],
        labels:[],
        condition:[]
      }
      this.updateIndex = this.updateIndex.bind(this);
      this.show_loading = this.show_loading.bind(this);
      this.onChangeWorkArea=this.onChangeWorkArea.bind(this);
      this.onChangeTask=this.onChangeTask.bind(this);
      this.onChangeScooterStatus=this.onChangeScooterStatus.bind(this);
      this.onChangeCondition=this.onChangeCondition.bind(this);
      this.onChangeSevere=this.onChangeSevere.bind(this);
      this.onChangeLabels=this.onChangeLabels.bind(this);
      this.set_power_change=this.set_power_change.bind(this);
      this.set_days_change=this.set_days_change.bind(this);
      this.get_scooter_in_work_area=this.get_scooter_in_work_area.bind(this);
      this.get_scooter_by_severe=this.get_scooter_by_severe.bind(this);
      this.get_scooter_by_status=this.get_scooter_by_status.bind(this);
      this.filter_scooter_by_power=this.filter_scooter_by_power.bind(this);
      this.filter_scooter_by_rent_days=this.filter_scooter_by_rent_days.bind(this);
      this.get_scooter_by_labels=this.get_scooter_by_labels.bind(this);
      this.after_reload_scooter=this.after_reload_scooter.bind(this);
      this.get_labels=this.get_labels.bind(this);
    }
    componentWillMount(){
      if(global.select_severe != undefined){
        this.onChangeSevere(global.select_severe);
      }
      this.props.onRefilter(this);
      this.get_labels();
      
    }
    componentDidMount(){
      // this.getStorage();
      if(global.condition != undefined){
        this.setState({condition:global.condition});
      }
      this.setState({scooter:global.scooters},()=>{this.after_reload_scooter()});
    }
    updateIndex (selectedIndex) {
      this.setState({selectedIndex})
    }
    show_loading(){
      this.setState({show_loading:true});
    }
    get_labels(){
      fetch(global.API+'/scooter/labels',{
        method: 'GET'
      })
      .then((response) => response.json())
      .then((json)=>{
          var data = [];
          json.data.map(function(m,i){
            data.push(m[0]);
          })
          this.setState({labels:data});
          // sessionStorage.setItem('labels',JSON.stringify(json.data));
      });
    }
    // componentWillUpdate(nextProps,nextState){
    //   if(nextProps.filter_option.scooter != this.props.filter_option.scooter){
    //       this.setState({scooter:nextProps.filter_option.scooter});
    //   }
    //   if(nextProps.filter_option.modalVisible == true){
    //     setTimeout(()=>{
    //       this.setState({rangeSlide:true});
    //     },1000)
    //   }
    // }
    onChangeTask(index){
      this.show_loading();
      global.sel_task = index;
      this.setState({sel_task:index}, () => {
          this.after_reload_scooter();
      });
    }
    onFilterOnlyChgPower(index){
      this.show_loading();
      global.sel_FOCP = index;
      var promise1 = new Promise((resolve,reject)=>{this.setState({sel_FOCP:index});resolve(0);});
      promise1.then(value=>new Promise((resolve,reject)=>{this.after_reload_scooter();}))
    }
    // getStorage = async () => {
    //     try {
    //       const task = await AsyncStorage.getItem('@FoOps:task');
    //       console.warn(task);
    //       if (task !== null) {
    //         this.setState({task:task});
    //       }
    //     } catch (error) {
    //       console.warn(error);
    //     }
    // }
    filter_scooter_for_only_change_power(){
        if(global.sel_FOCP != undefined && global.sel_FOCP){
            var scooter = [];

            this.state.scooter.map(function(m,i){
              if(m.ticket){
                if(m.ticket.scooter_conditions){
                  if(m.ticket.scooter_conditions.length == 1 && m.ticket.scooter_conditions.indexOf(601) != -1){
                    scooter.push(m);
                  }
                }
              }
            });
            this.setState({scooter:scooter});
        }
    }
    filter_scooter_by_task(){
        if(global.sel_task != undefined && global.sel_task){

            var local_task = global.task;
            var task = [];
            if(local_task != null){
                task = local_task.split(',').map(function(m,i){
                    return parseInt(m, 10);
                });
            }
            var scooter = [];

            this.state.scooter.map(function(m,i){
                if (task.indexOf(m.id) != -1) {
                    scooter.push(m);
                }
            });
            this.setState({scooter:scooter});
        }
    }
    set_power_change(value){
        this.show_loading();
        if(global.powerSliderValue !=null && global.powerSliderValue == value){
          global.powerSliderValue = null;
          value = null;
        }else{
          global.powerSliderValue = value;  
        }
        var min = 0;
        var max = 100;
        switch(value){
          case 0:
            min = 0;
            max = 15;
          break;
          case 1:
            min = 16;
            max = 35;
          break;
          case 2:
            min = 36;
            max = 40;
          break;
          case 3:
            min = 41;
            max = 45;
          break;
          case 4:
            min = 46;
            max = 50;
          break;
          default:
            min = 0;
            max = 100;
          break;
        }
        global.power_min = min;
        global.power_max = max;

        var promise1 = new Promise((resolve,reject)=>{this.setState({powerSliderValue:value,power_min:min,power_max:max});resolve(0);});
        promise1.then(value=>new Promise((resolve,reject)=>{this.after_reload_scooter();}))
    }
    filter_scooter_by_power(){
        var result = new Array();
        if(this.state.power_min == 0 && this.state.power_max == 100){
          return true;
        }
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
    set_days_change(value){
        this.show_loading();
        if(global.daysSliderValue !=null && global.daysSliderValue == value){
          global.daysSliderValue = null;
          value = null;
        }else{
          global.daysSliderValue = value;  
        }
        var min = 0;
        var max = 500;
        switch(value){
          case 0:
            min = 1;
            max = 3;
          break;
          case 1:
            min = 4;
            max = 5;
          break;
          case 2:
            min = 6;
            max = 10;
          break;
          case 3:
            min = 11;
            max = 500;
          break;
        }
        global.day_min = min;
        global.day_max = max;
        var promise1 = new Promise((resolve,reject)=>{this.setState({day_min:min,day_max:max});resolve(0);});
        promise1.then(value=>new Promise((resolve,reject)=>{this.after_reload_scooter();}))
    }
    filter_scooter_by_rent_days(){
        var result = new Array();
        if(this.state.day_min == 0 && this.state.day_max == 500){
          return true;
        }
        this.state.scooter.map(function(m, i){
            var pushed = true;
            if(m.range_days >= global.day_min && m.range_days <= global.day_max){
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
    // 選擇工作區域
    onChangeWorkArea(area){
        this.show_loading();
        // 帶入區域內經緯度資料
        area = (global.sel_work_area == area) ? null : area;
        global.sel_work_area = area;
        var promise1 = new Promise((resolve,reject)=>{this.setState({sel_work_area:area});resolve(0);});
        promise1.then(value=>new Promise((resolve,reject)=>{this.after_reload_scooter();}))

    }
    get_scooter_in_work_area(){
        var area = global.sel_work_area;
        var result = [];
        if(area != undefined && area != null){
            fetch(global.API+'/scooter/work_area/'+area,{
                  method: 'GET'
              })
            .then((response) => response.json())
            .then((json) => {
                var zone = [];
                this.state.scooter.map(function(m, i){
                  if(Array.isArray(json[0])){
                    json.map(function(d,k){
                      var zone = [];
                      zone.push(d);
                      var istrue = this.checkzone('in',zone,m.location);
                      if(istrue){
                        result.push(m);
                      }
                    }.bind(this));
                  }else{
                    var zone = [];
                    zone.push(json);
                    var istrue = this.checkzone('in',zone,m.location);
                    if(istrue){
                      result.push(m);
                    }
                  }
                    
                }.bind(this));
                this.setState({ scooter:result });
            }).catch( err => {
              alert('API 更新中，請稍後再試！');
              return false;
            });
        }
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
    // 選擇車輛狀況
    onChangeSevere(e){
        this.show_loading();
        e = (global.sel_severe_data == e) ? null : e;
        global.select_severe = undefined;
        global.sel_severe_data = e;
        var promise1 = new Promise((resolve,reject)=>{this.setState({sel_severe_data:e});resolve(0);});
        promise1.then(value=>new Promise((resolve,reject)=>{this.after_reload_scooter();}))
    }
    get_scooter_by_severe(){
        var severe =  global.sel_severe_data;
        var result = [];
        if(severe != null){
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
        this.show_loading();
        type = (global.sel_scooter_status == type) ? null : type;
        global.sel_scooter_status = type;
        var promise1 = new Promise((resolve,reject)=>{this.setState({sel_scooter_status:type});resolve(0);});
        promise1.then(value=>new Promise((resolve,reject)=>{this.after_reload_scooter();}))
    }
    get_scooter_by_status(){
        var status = global.sel_scooter_status;
        var result = [];
        if(status != undefined && status != null){
            this.state.scooter.map(function(m, i){
                if(m.status == status){
                  result.push(m);
                }
            }.bind(this));
            this.setState({ scooter:result });
        }
    }
    onChangeCondition(id){
        this.show_loading();
        var select = global.sel_scooter_condition;
        if(select.indexOf(id) > -1){
          select.splice(select.indexOf(id), 1);
        }else{
          select.push(id);
        }
        global.sel_scooter_condition = select;
        var promise1 = new Promise((resolve,reject)=>{resolve(0);});
        promise1.then(value=>new Promise((resolve,reject)=>{this.after_reload_scooter();}))
    }
    get_scooter_by_condition(){
        var status = global.sel_scooter_condition;
        var result = [];
        if(status.length > 0){
            this.state.scooter.map(function(m, i){
                if(m.ticket.scooter_conditions){
                  var intersection = status.filter(value => -1 !== m.ticket.scooter_conditions.indexOf(value));
                  if(intersection.length == status.length){
                    result.push(m);
                  }
                  
                }
            }.bind(this));
            this.setState({ scooter:result });
        }
    }

    // 選擇標籤 label
    onChangeLabels(label){
        this.show_loading();
        label = (global.sel_scooter_label == label) ? null : label;
        global.sel_scooter_label = label;
        var promise1 = new Promise((resolve,reject)=>{this.setState({sel_scooter_label:label});resolve(0);});
        promise1.then(value=>new Promise((resolve,reject)=>{this.after_reload_scooter();}))
    }
    get_scooter_by_labels(){
        var label = global.sel_scooter_label;
        var result = [];
        if(label != undefined && label != null){
            this.state.scooter.map(function(m, i){
                if(m.labels != undefined && m.labels.indexOf(label) != -1){
                  result.push(m);
                }
            }.bind(this));
            this.setState({ scooter:result });
        }
    }

    set_scooter_data(all_scooters){

        this.setState({ 
            all:all_scooters,
            scooter:all_scooters,
            save_scooter:all_scooters,
            open:true
        },()=>{
            this.after_reload_scooter();
        });
    }
    after_reload_scooter = async () => {
        try {
            await this.setState({scooter:global.scooters});
            await this.get_scooter_in_work_area();
            await delay(5);
            await this.get_scooter_by_severe();
            await delay(5);
            await this.get_scooter_by_status();
            await delay(5);
            await this.filter_scooter_by_power();
            await delay(5);
            await this.filter_scooter_by_rent_days();
            await delay(5);
            await this.get_scooter_by_labels();
            await delay(5);
            await this.filter_scooter_for_only_change_power();
            await delay(5);
            await this.get_scooter_by_condition();
            await delay(5);
            
            await new Promise((resolve,reject)=>{
                this.setState({show_loading:false});
                this.props.filter_option.filter_scooter(this.state.scooter);
            });
           
           
        } catch (error) {
          console.warn(error);
        }
    }
    // after_reload_scooter(){
    //   var promise1 = new Promise((resolve,reject)=>{
    //     this.setState({scooter:global.scooters});
    //     resolve(0);
    //     console.warn('filter 0');
    //   });
    //   promise1.then(value=>new Promise((resolve,reject)=>{this.get_scooter_in_work_area();setTimeout(()=>{resolve(2);},50)}))
    //           .then(value=>new Promise((resolve,reject)=>{this.get_scooter_by_severe();setTimeout(()=>{resolve(3);},50)}))
    //           .then(value=>new Promise((resolve,reject)=>{this.get_scooter_by_status();setTimeout(()=>{resolve(4);},50)}))
    //           .then(value=>new Promise((resolve,reject)=>{this.filter_scooter_by_power();setTimeout(()=>{resolve(5);},50)}))
    //           .then(value=>new Promise((resolve,reject)=>{this.filter_scooter_by_rent_days();setTimeout(()=>{resolve(6);},50)}))
    //           .then(value=>new Promise((resolve,reject)=>{this.get_scooter_by_labels();setTimeout(()=>{resolve(7);},50)}))
    //           .then(value=>new Promise((resolve,reject)=>{this.filter_scooter_for_only_change_power();setTimeout(()=>{resolve(8);},50)}))
    //           .then(value=>new Promise((resolve,reject)=>{console.warn('filter 9');this.setState({show_loading:false});this.props.filter_option.filter_scooter(this.state.scooter);resolve(7);}));
        

    // }
    
    // get_scooter(){
    //   var all_scooters = global.scooters;
    //   this.setState({scooter:all_scooters});
    //   this.props.filter_option.filter_scooter(all_scooters);
    //   this.setState({show_loading:false});
    // }
    render() {
        const {filter_option} = this.props;
        const { selectedIndex,labels,condition} = this.state;
        const { show_loading } = this;
        var total = (global.scooter == undefined) ? 0 : global.scooter.length;
        var all = global.scooters.length;
        // 工作區域選項按鈕
        var work_area_btns = []
        work_area.map(function(m,i){
            var btn = <Button
              key={i}
              title={m.area}
              type="outline"
              style={styles.work_area_btn}
              buttonStyle={styles.Wa_buttonStyle}
              titleStyle={styles.titleStyle}
              onPress={()=>{ this.onChangeWorkArea(m.value)  }}
            />
            if (global.sel_work_area == m.value) {
              btn = <Button
                key={i}
                title={m.area}
                style={styles.work_area_btn}
                icon={<Icon name="check-circle" size={15}  color="white" />}
                buttonStyle={styles.Wa_buttonStyleActive}
                titleStyle={styles.titleStyleActive}
                onPress={()=>this.onChangeWorkArea(m.value)}
              />
            }
            work_area_btns.push(btn);
        }.bind(this));
        // 車輛狀況選項按鈕
        var severe_btns = []
        severe_title.map(function(m,i){
          if(m == null){
            return true;
          }
            var index = parseInt(i) + 1; 
            var btn = <Button
              key={i}
              title={m}
              type="outline"
              style={styles.work_area_btn}
              buttonStyle={{borderColor:'rgb(255, 204, 34)',}}
              titleStyle={styles.titleStyle}
              onPress={()=>this.onChangeSevere(index)}
            />
            if(global.sel_severe_data === index) {
              btn = <Button
                key={i}
                title={m}
                style={styles.work_area_btn}
                icon={<Icon name="check-circle" size={15}  color="white" />}
                buttonStyle={{borderColor:'rgb(255, 204, 34)',backgroundColor:'rgb(255, 204, 34)'}}
                titleStyle={styles.titleStyleActive}
                onPress={()=>this.onChangeSevere(index)}
              />
            }
            severe_btns.push(btn);
        }.bind(this));
        // 車輛服務狀態選項按鈕
        var scooter_status_btns = []
        scootet_status.map(function(m,i){
            var btn = <Button
              key={i}
              title={m.title}
              type="outline"
              style={styles.work_area_btn}
              buttonStyle={{ borderColor:'#f00'}}
              titleStyle={styles.titleStyle}
              onPress={()=>this.onChangeScooterStatus(m.type)}
            />
            if(global.sel_scooter_status === m.type) {
              btn = <Button
                key={i}
                title={m.title}
                style={styles.work_area_btn}
                icon={<Icon name="check-circle" size={15}  color="white" />}
                buttonStyle={{ borderColor:'#f00',backgroundColor:'#f00',color:'#fff'}}
                titleStyle={styles.titleStyleActive}
                onPress={()=>this.onChangeScooterStatus(m.type)}
              />
            }
            scooter_status_btns.push(btn);
            
        }.bind(this));
        var condition_btns = [];
        // console.warn(global.sel_scooter_condition);
        condition.map(function(m,i){
          var btn = <Button
              key={i}
              title={m.description}
              type="outline"
              style={styles.work_area_btn}
              buttonStyle={{ borderColor:'#EE7700',marginRight: 10,marginBottom: 10}}
              titleStyle={styles.titleStyle}
              onPress={()=>this.onChangeCondition(m.id)}
            />
            if(global.sel_scooter_condition.indexOf(m.id) != -1) {
              btn = <Button
                key={i}
                title={m.description}
                style={styles.work_area_btn}
                icon={<Icon name="check-circle" size={15}  color="white" />}
                buttonStyle={{ borderColor:'#EE7700',backgroundColor:'#EE7700'}}
                titleStyle={styles.titleStyleActive}
                onPress={()=>this.onChangeCondition(m.id)}
              />
            }
            condition_btns.push(btn);
        }.bind(this));
        var power_btns = [];
        var power_types = ['<15%','~35%','~40%','~45%','~50%'];
        power_types.map(function(m,i){
            var btn = <Button
              key={"power_btn"+i}
              title={m}
              type="outline"
              buttonStyle={{ borderColor:'#00DD00'}}
              titleStyle={styles.titleStyle}
              onPress={()=>this.set_power_change(i)}
            />
            if(global.powerSliderValue == i){
                btn = <Button
                  key={"power_btn"+i}
                  title={m}
                  icon={<Icon name="check-circle" size={15}  color="white" />}
                  buttonStyle={{ borderColor:'#00DD00',backgroundColor:'#00DD00',color:'#fff'}}
                  titleStyle={styles.titleStyleActive}
                  onPress={()=>this.set_power_change(i)}
                />
            }
            power_btns.push(btn);
        }.bind(this));
        var days_btns = [];
        var days_types = ['~3天','~5天','~10天','Long Time'];
        days_types.map(function(m,i){
            var btn = <Button
              key={"days_btn"+i}
              title={m}
              type="outline"
              buttonStyle={{ borderColor:'#5500FF'}}
              titleStyle={styles.titleStyle}
              onPress={()=>this.set_days_change(i)}
            />
            if(global.daysSliderValue == i){
                btn = <Button
                  key={"days_btn"+i}
                  title={m}
                  icon={<Icon name="check-circle" size={15}  color="white" />}
                  buttonStyle={{ borderColor:'#5500FF',backgroundColor:'#5500FF',color:'#fff'}}
                  titleStyle={styles.titleStyleActive}
                  onPress={()=>this.set_days_change(i)}
                />
            }
            days_btns.push(btn);
        }.bind(this));

        var labels_btns = [];
        labels.map(function(m,i){
            var btn = <Button
              key={"labels_btns"+i}
              title={m}
              type="outline"
              buttonStyle={{ borderColor:'#444444'}}
              titleStyle={styles.titleStyle}
              onPress={()=>this.onChangeLabels(m)}
            />
            if(global.sel_scooter_label === m) {
              btn = <Button
                key={"labels_btns"+i}
                title={m}
                icon={<Icon name="check-circle" size={15}  color="white" />}
                buttonStyle={{ borderColor:'#444444',backgroundColor:'#444444',color:'#fff'}}
                titleStyle={styles.titleStyleActive}
                onPress={()=>this.onChangeLabels(m)}
              />
            }
            labels_btns.push(btn);
        }.bind(this));

        return (
            <Modal
              animationType="slide"
              transparent={false}
              visible={filter_option.modalVisible}
              presentationStyle="fullScreen"
              onRequestClose={()=>filter_option.setModalVisible(false)}
              >
              <SafeAreaView style={{position:'relative',flex: 1,justifyContent: "center", alignItems: "center", backgroundColor: '#fff'}}>
                  <View style={{position:'absolute',top:5,right:5,zIndex:1001 }}>
                     <Icon name='close' size={30}  onPress={() => {
                        filter_option.setModalVisible(false);
                      }} />
                  </View>
                  
                  <ScrollView style={{flexDirection:'column', }}>
                    <View style={styles.row_view}>
                        <Text h1>篩選</Text>
                    </View>
                    <View style={{paddingBottom:10,marginLeft:20,marginRight:20,borderBottomColor: '#eeeeee',borderBottomWidth: 1,}}>
                        {global.sel_FOCP ?(
                          <Button
                            title="只需更換電池車輛"
                            style={styles.work_area_btn}
                            buttonStyle={styles.task_buttonStyleActive}
                            titleStyle={styles.titleStyleActive}
                            icon={<Icon name="check-circle" size={15}  color="white" />}
                            onPress={()=>this.onFilterOnlyChgPower(false)}
                          />
                        ) : (
                          <Button
                            title="只需更換電池車輛"
                            style={styles.work_area_btn}
                            buttonStyle={styles.task_buttonStyle}
                            titleStyle={styles.titleStyleActive}
                            onPress={()=>this.onFilterOnlyChgPower(true)}
                          />
                        )}
                        

                    </View>
                    <View style={styles.row_view}>
                        {work_area_btns}
                    </View>
                    <View style={styles.row_view}>
                        {severe_btns}
                    </View>
                    <View style={styles.row_view}>
                        {scooter_status_btns}
                    </View>
                    <View style={styles.row_view}>
                      <View style={{width:'100%',marginBottom:5}}><Text>電量</Text></View>
                      {power_btns}
                    </View>
                    <View style={styles.row_view}>
                      <View style={{width:'100%',marginBottom:5}}><Text>車況</Text></View>
                      {condition_btns}
                    </View>
                    <View style={styles.row_view}>
                      <View style={{width:'100%',marginBottom:5}}><Text>未租用天數</Text></View>
                      {days_btns}
                    </View>
                    <View style={styles.row_view}>
                      <View style={{width:'100%',marginBottom:5}}><Text>標籤</Text></View>
                      {labels_btns}
                    </View>
                    
                  </ScrollView>
                  <View style={styles.footer_view}>
                    {this.state.show_loading ? 
                      (
                        <View style={{flexDirection:'row'}}>
                          <Text>篩選結果：</Text>
                          <ActivityIndicator color="#ccc"  />
                        </View>
                      ):(
                        <Text style={{marginRight:20}}>篩選結果：{total} / {all}</Text>
                      )
                    }
                    
                    <Button
                      title="顯示結果"
                      titleStyle={styles.view_titleStyle}
                      onPress={() => {
                        filter_option.setModalVisible(!filter_option.modalVisible);
                      }}
                    />
                  </View>
                </SafeAreaView>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
  work_area_btn: {
    marginBottom:10,
    marginTop:10,
    marginRight:10,
    
  },
  task_buttonStyle:{
    borderColor:'#5599FF',

  },
  task_buttonStyleActive:{
    borderColor:'#5599FF',
    backgroundColor:'#5599FF',
    color:'#ffffff'

  },
  Wa_buttonStyle:{
    borderColor:'#AA0000',

  },
  Wa_buttonStyleActive:{
    borderColor:'#AA0000',
    backgroundColor:'#AA0000',
  },
  ss_buttonStyle:{
    borderColor:'rgb(255, 204, 34)',
  },
  service_buttonStyle:{
    borderColor:'#ff0000'
  },
  slider_view:{
    flexDirection:'row', alignItems: 'center', justifyContent: 'flex-start',paddingLeft:20,
    paddingRight:20,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  row_view:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'flex-start',
    flexWrap:'wrap',
    paddingLeft:20,
    paddingRight:20,
    paddingBottom:10,
    paddingTop:10,
    borderBottomColor: '#eeeeee',
    borderBottomWidth: 1,
    marginBottom:10,
    marginRight:10,
  },
  buttonStyle:{
    fontSize:11
  },
  titleStyle:{
    fontSize:11,
    color:'#000'
  },
  titleStyleActive:{
    fontSize:11,
    color:'#ffffff',
    paddingLeft:5
  },
  footer_view:{
    width:'100%',
    padding:5,
    backgroundColor:'#f5f5f5',
    flexDirection:'row', alignItems: 'center', justifyContent: 'space-around'
  },
  view_titleStyle:{
    fontSize:15,
    color:'#ffffff'
  },
  loading:{
        position:'absolute',
        zIndex:101,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:'rgba(1,1,1,0.8)',
        padding:20,
        borderBottomLeftRadius:5,
        borderBottomRightRadius:5,
        borderTopLeftRadius:5,
        borderTopRightRadius:5
    },
});

var customStyles = StyleSheet.create({
  thumb: {
    width: 30,
    height: 30,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 1,
  }
});