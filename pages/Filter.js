import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight,ActivityIndicator } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { Card, ListItem,Header, Button,Image,SearchBar,ButtonGroup,CheckBox,Slider } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import MultiSlider from '@ptomasroos/react-native-multi-slider'
const work_area = [] 
for(var i=0 ; i<6 ; i++){
    work_area.push({area:"區域"+(parseInt(i)+1),value:"KS_Zone"+(parseInt(i)+1)})
} 
const severe_title=["優先處理",null,"處理中","正常"];

const scootet_status = [{"type":"FREE","title":"尚未服務"},{"type":"RESERVED","title":"預約中"},{"type":"RIDING","title":"使用中"},{"type":"MAINTENANCE","title":"暫停服務"}];

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
        day_max:100,
        sel_work_area:null,
        sel_severe_data:null,
        sel_scooter_status:null,
        all_work_area:[],
        rangeSlide:false,
        powerSliderValue: [0, 100],
        daysSliderValue:[0,100],
        task:"",
        sel_task:false,
        scooter:[]
      }
      this.updateIndex = this.updateIndex.bind(this);
      this.show_loading = this.show_loading.bind(this);
      this.onChangeWorkArea=this.onChangeWorkArea.bind(this);
      this.onChangeTask=this.onChangeTask.bind(this);
      this.onChangeScooterStatus=this.onChangeScooterStatus.bind(this);
      this.onChangeSevere=this.onChangeSevere.bind(this);
      this.get_power_change=this.get_power_change.bind(this);
      this.get_days_change=this.get_days_change.bind(this);
      this.get_scooter_in_work_area=this.get_scooter_in_work_area.bind(this);
      this.get_scooter_by_severe=this.get_scooter_by_severe.bind(this);
      this.get_scooter_by_status=this.get_scooter_by_status.bind(this);
      this.filter_scooter_by_power=this.filter_scooter_by_power.bind(this);
      this.filter_scooter_by_rent_days=this.filter_scooter_by_rent_days.bind(this);
      this.after_reload_scooter=this.after_reload_scooter.bind(this);
    }
    componentWillMount(){
      // this.setState({scooter:global.scooters});
      if(global.select_severe != undefined){
        this.onChangeSevere(global.select_severe);
      }
    }
    componentDidMount(){
      // this.getStorage();
      this.setState({scooter:global.scooters});
    }
    updateIndex (selectedIndex) {
      this.setState({selectedIndex})
    }
    show_loading(){
      this.setState({show_loading:true});
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
        this.setState({sel_task:index}, () => {
            this.after_reload_scooter();
        });
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

    filter_scooter_by_task(){
        if(this.state.sel_task){

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
    get_power_change(value){
        this.show_loading();
        this.setState({powerSliderValue:value});
        this.setState({power_min:value[0],power_max:value[1]},()=>{
          this.after_reload_scooter();
        });
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
        this.show_loading();
        this.setState({daysSliderValue:value});
        this.setState({day_min:value[0],day_max:value[1]},()=>{
          this.after_reload_scooter();
        });
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
        this.show_loading();
        // 帶入區域內經緯度資料
        area = (this.state.sel_work_area == area) ? null : area;
        this.setState({sel_work_area:area}, () => {
            this.after_reload_scooter();
        });

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
        e = (this.state.sel_severe_data == e) ? null : e;
        global.select_severe = undefined;
        this.setState({sel_severe_data:e}, () => {
            this.after_reload_scooter();
        });
    }
    get_scooter_by_severe(){
        var severe = this.state.sel_severe_data;
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
        type = (this.state.sel_scooter_status == type) ? null : type;
        this.setState({sel_scooter_status:type}, () => {
            this.after_reload_scooter();
        });
    }
    get_scooter_by_status(){
        var status = this.state.sel_scooter_status;
        var result = [];
        if(status != null){
            this.state.scooter.map(function(m, i){
                if(m.status == status){
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
    after_reload_scooter(){
      console.warn('load after_reload_scooter');
      var promise1 = new Promise((resolve,reject)=>{
        this.setState({scooter:global.scooters});
        resolve(0);
      });
      promise1.then(value=>new Promise((resolve,reject)=>{this.filter_scooter_by_task();setTimeout(()=>{resolve(1);},50)}))
              .then(value=>new Promise((resolve,reject)=>{this.get_scooter_in_work_area();setTimeout(()=>{resolve(2);},50)}))
              .then(value=>new Promise((resolve,reject)=>{this.get_scooter_by_severe();setTimeout(()=>{resolve(3);},50)}))
              .then(value=>new Promise((resolve,reject)=>{this.get_scooter_by_status();setTimeout(()=>{resolve(4);},50)}))
              .then(value=>new Promise((resolve,reject)=>{this.filter_scooter_by_power();setTimeout(()=>{resolve(5);},50)}))
              .then(value=>new Promise((resolve,reject)=>{this.filter_scooter_by_rent_days();setTimeout(()=>{resolve(6);},50)}))
              .then(value=>new Promise((resolve,reject)=>{this.setState({show_loading:false});this.props.filter_option.filter_scooter(this.state.scooter);resolve(7);}));
        

    }
    
    get_scooter(){
      var all_scooters = global.scooters;
      this.setState({scooter:all_scooters});
      this.props.filter_option.filter_scooter(all_scooters);
      this.setState({show_loading:false});
    }
    render() {
        const {filter_option} = this.props;
        const { selectedIndex } = this.state;
        const { show_loading } = this;
        var total = (this.state.scooter == undefined) ? 0 : this.state.scooter.length;
        var all = global.scooters.length;
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
            if (this.state.sel_work_area == m.value) {
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
            if(this.state.sel_severe_data === index) {
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
            if(this.state.sel_scooter_status === m.type) {
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

        return (
            <Modal
              animationType="slide"
              transparent={false}
              visible={filter_option.modalVisible}
              presentationStyle="fullScreen"
              >
              <SafeAreaView style={{position:'relative',flex: 1,justifyContent: "center", alignItems: "center", backgroundColor: '#fff'}}>
                  <View style={{width:'100%',justifyContent: "flex-start", alignItems: "flex-end",marginRight:10 }}>
                     <Icon name='close' size={30}  onPress={() => {
                        filter_option.setModalVisible(false);
                      }} />
                  </View>
                  
                  <ScrollView style={{flexDirection:'column', }}>
                    <View style={{paddingBottom:10,marginLeft:20,marginRight:20,borderBottomColor: '#eeeeee',borderBottomWidth: 1,}}>
                        {this.state.sel_task ?(
                          <Button
                            title="我的任務清單"
                            style={styles.work_area_btn}
                            buttonStyle={styles.task_buttonStyleActive}
                            titleStyle={styles.titleStyleActive}
                            icon={<Icon name="check-circle" size={15}  color="white" />}
                            onPress={()=>this.onChangeTask(false)}
                          />
                        ) : (
                          <Button
                            title="我的任務清單"
                            type="outline"
                            style={styles.work_area_btn}
                            buttonStyle={styles.task_buttonStyle}
                            titleStyle={styles.titleStyle}
                            onPress={()=>this.onChangeTask(true)}
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
                    <View style={styles.slider_view}>
                      <View style={{width:'20%'}}><Text>電量</Text></View>
                      <View  style={{flexDirection:'row',justifyContent:'space-around',alignItems:'center',width:'80%'}}>
                        <View style={{marginRight:30}}><Text>{this.state.power_min}</Text></View>
                        <View>
                          <MultiSlider
                            values={this.state.powerSliderValue}
                            min={0}
                            max={100}
                            step={1}
                            allowOverlap
                            snapped
                            onValuesChangeFinish={this.get_power_change}
                            sliderLength={180}
                            selectedStyle={{borderWidth:1,borderColor:'#00AA00'}}
                          />
                        </View>
                        <View style={{marginLeft:30}}><Text>{this.state.power_max}</Text></View>
                      </View>
                     
                   
                    </View>
                    <View style={styles.slider_view}>
                      <View style={{width:'20%'}}><Text>天數</Text></View>
                      <View  style={{flexDirection:'row',justifyContent:'space-around',alignItems:'center',width:'80%'}}>
                        <View style={{marginRight:30}}><Text>{this.state.day_min}</Text></View>
                        <View>
                          <MultiSlider
                            values={this.state.daysSliderValue}
                            min={0}
                            max={100}
                            step={1}
                            allowOverlap
                            snapped
                            onValuesChangeFinish={this.get_days_change}
                            sliderLength={180}
                            selectedStyle={{borderWidth:1,borderColor:'#FF5511'}}
                          />
                        </View>
                        <View style={{marginLeft:30}}><Text>{this.state.day_max}</Text></View>
                      </View>

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
    borderColor:'#0000FF',

  },
  task_buttonStyleActive:{
    borderColor:'#0000FF',
    backgroundColor:'#0000FF',
    color:'#ffffff'

  },
  Wa_buttonStyle:{
    borderColor:'rgb(0, 221, 0)',

  },
  Wa_buttonStyleActive:{
    borderColor:'rgb(0, 221, 0)',
    backgroundColor:'rgb(0, 221, 0)',
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
    justifyContent:'space-around',
    alignItems:'flex-start',
    flexWrap:'wrap',
    paddingLeft:20,
    paddingRight:20,
    paddingBottom:10,
    paddingTop:10,
    borderBottomColor: '#eeeeee',
    borderBottomWidth: 1,
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
    flex:0.3,flexDirection:'row', alignItems: 'center', justifyContent: 'space-around',
    borderTopWidth:1,
    borderTopColor:'rgba(224, 224, 224,0.5)',
    paddingTop:5,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
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