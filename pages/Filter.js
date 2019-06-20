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
const severe_title=["優先處理","次要處理","待處理","正常"];

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
        daysSliderValue:[0,100]
      }
      this.updateIndex = this.updateIndex.bind(this);
      this.show_loading = this.show_loading.bind(this);
      this.onChangeWorkArea=this.onChangeWorkArea.bind(this);
      this.onChangeScooterStatus=this.onChangeScooterStatus.bind(this);
      this.onChangeSever=this.onChangeSever.bind(this);
      this.get_power_change=this.get_power_change.bind(this);
      this.get_days_change=this.get_days_change.bind(this);
      this.get_scooter_in_work_area=this.get_scooter_in_work_area.bind(this);
      this.get_scooter_by_severe=this.get_scooter_by_severe.bind(this);
      this.get_scooter_by_status=this.get_scooter_by_status.bind(this);
      this.filter_scooter_by_power=this.filter_scooter_by_power.bind(this);
      this.filter_scooter_by_rent_days=this.filter_scooter_by_rent_days.bind(this);
    }
    componentWillMount(){
      this.setState({scooter:this.props.filter_option.scooter});
    }

    updateIndex (selectedIndex) {
      this.setState({selectedIndex})
    }
    show_loading(){
      this.setState({show_loading:true});
    }

    componentWillUpdate(nextProps,nextState){
      if(nextProps.filter_option.scooter != this.props.filter_option.scooter){
          this.setState({scooter:nextProps.filter_option.scooter});
      }
      if(nextProps.filter_option.modalVisible == true){
        setTimeout(()=>{
          this.setState({rangeSlide:true});
        },1000)
      }
    }
    get_power_change(value){
        this.show_loading();
        this.setState({power_min:value[0],power_max:value[1]});
        this.setState({powerSliderValue:value});
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
        this.filter_scooters(result);
    }
    get_days_change(value){
        this.show_loading();
        this.setState({day_min:value[0],day_max:value[1]});
        this.setState({daysSliderValue:value});
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
        this.filter_scooters(result);
    }
    // 選擇工作區域
    onChangeWorkArea(area){
        this.show_loading();
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
                this.filter_scooters(result);
                
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
    onChangeSever(e){
        this.show_loading();
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
            this.filter_scooters(result);
        }
    }
    // 選擇服務狀態
    onChangeScooterStatus(type){
        this.show_loading();
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
            this.filter_scooters(result);
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
            this.setState({reload_now:false});
        });
    }
    after_reload_scooter(){
        this.get_scooter_in_work_area();
        this.get_scooter_by_severe();
        this.get_scooter_by_status();
        this.filter_scooter_by_power();
        this.filter_scooter_by_rent_days();

    }
    filter_scooters(result){
      this.setState({ scooter:result });
      this.props.filter_option.filter_scooter(result);
      this.setState({show_loading:false});
    }
    get_scooter(){
      var all_scooters = this.props.filter_option.all;
      this.setState({scooter:all_scooters});
      this.props.filter_option.filter_scooter(all_scooters);
      this.setState({show_loading:false});
    }
    render() {
        const {filter_option} = this.props;
        const { selectedIndex } = this.state;
        const { show_loading } = this;
        var total = (filter_option.scooter == undefined) ? 0 : filter_option.scooter.length;
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
            var index = parseInt(i) + 1;
            var btn = <Button
              key={i}
              title={m}
              type="outline"
              style={styles.work_area_btn}
              buttonStyle={{borderColor:'rgb(255, 204, 34)',}}
              titleStyle={styles.titleStyle}
              onPress={()=>this.onChangeSever(index)}
            />
            if(this.state.sel_severe_data === index) {
              btn = <Button
                key={i}
                title={m}
                style={styles.work_area_btn}
                icon={<Icon name="check-circle" size={15}  color="white" />}
                buttonStyle={{borderColor:'rgb(255, 204, 34)',backgroundColor:'rgb(255, 204, 34)',color:'#fff'}}
                titleStyle={styles.titleStyleActive}
                onPress={()=>this.onChangeSever(index)}
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
                        filter_option.setModalVisible(!filter_option.modalVisible);
                      }} />
                  </View>
                  {this.state.show_loading &&(
                    <View style={styles.loading}>
                      <ActivityIndicator size="large" color="#ffffff" style={{marginBottom:5}} />
                      <Text style={{color:'#fff'}}>Loading...</Text>
                    </View>
                  )}
                  <ScrollView style={{flexDirection:'column', }}>
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
                      <View  style={{width:'70%'}}>
                      <MultiSlider
                        values={this.state.powerSliderValue}
                        min={0}
                        max={100}
                        step={1}
                        allowOverlap
                        snapped
                        onValuesChangeFinish={this.get_power_change}
                        style={{width:'100%'}}
                      />
                      </View>
                     
                   
                    </View>
                    <View style={styles.slider_view}>
                      <View style={{width:'20%'}}><Text>天數</Text></View>
                      <View  style={{width:'70%'}}>
                      <MultiSlider
                        values={this.state.daysSliderValue}
                        min={0}
                        max={100}
                        step={1}
                        allowOverlap
                        snapped
                        onValuesChangeFinish={this.get_days_change}
                        style={{width:'100%'}}
                      />
                      </View>
                   
                    </View>
                  </ScrollView>
                  <View style={styles.footer_view}>
                    <Text style={{marginRight:20}}>篩選結果：{total}</Text>
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
  Wa_buttonStyle:{
    borderColor:'rgb(0, 221, 0)',

  },
  Wa_buttonStyleActive:{
    borderColor:'rgb(0, 221, 0)',
    backgroundColor:'rgb(0, 221, 0)',
    color:'#ffffff'
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
    justifyContent:'flex-start',
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
    flex:0.3,flexDirection:'row', alignItems: 'center', justifyContent: 'center',
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