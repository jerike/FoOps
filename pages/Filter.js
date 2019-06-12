import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { Card, ListItem,Header, Button,Image,SearchBar,ButtonGroup,CheckBox,Slider } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import RangeSlider from 'react-native-range-slider'

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
        value:100
      }
      this.updateIndex = this.updateIndex.bind(this)
    }
    updateIndex (selectedIndex) {
      this.setState({selectedIndex})
    }
    render() {
        const {filter_option} = this.props;
        const { selectedIndex } = this.state
        var total = filter_option.scooter.length;
        var work_area_btns = []
        work_area.map(function(m,i){
            var btn = <Button
              title={m.area}
              type="outline"
              style={styles.work_area_btn}
              buttonStyle={styles.Wa_buttonStyle}
              titleStyle={styles.titleStyle}
              onPress={()=>filter_option.onChangeWorkArea(m.value)}
            />
            if (filter_option.sel_work_area == m.value) {
              btn = <Button
                title={m.area}
                style={styles.work_area_btn}
                icon={<Icon name="check-circle" size={15}  color="white" />}
                buttonStyle={styles.Wa_buttonStyleActive}
                titleStyle={styles.titleStyleActive}
                onPress={()=>filter_option.onChangeWorkArea(m.value)}
              />
            }
            work_area_btns.push(btn);
        });
        var severe_btns = []
        severe_title.map(function(m,i){
            var index = parseInt(i) + 1;
            var btn = <Button
              title={m}
              type="outline"
              style={styles.work_area_btn}
              buttonStyle={{borderColor:'rgb(255, 204, 34)',}}
              titleStyle={styles.titleStyle}
              onPress={()=>filter_option.onChangeSever(index)}
            />
            if(filter_option.sel_severe_data === index) {
              btn = <Button
                title={m}
                style={styles.work_area_btn}
                icon={<Icon name="check-circle" size={15}  color="white" />}
                buttonStyle={{borderColor:'rgb(255, 204, 34)',backgroundColor:'rgb(255, 204, 34)',color:'#fff'}}
                titleStyle={styles.titleStyleActive}
                onPress={()=>filter_option.onChangeSever(index)}
              />
            }
            severe_btns.push(btn);
        });
        var scooter_status_btns = []
        scootet_status.map(function(m,i){
            var btn = <Button
              title={m.title}
              type="outline"
              style={styles.work_area_btn}
              buttonStyle={{ borderColor:'#f00'}}
              titleStyle={styles.titleStyle}
              onPress={()=>filter_option.onChangeScooterStatus(m.type)}
            />
            if(filter_option.sel_scooter_status === m.type) {
              btn = <Button
                title={m.title}
                style={styles.work_area_btn}
                icon={<Icon name="check-circle" size={15}  color="white" />}
                buttonStyle={{ borderColor:'#f00',backgroundColor:'#f00',color:'#fff'}}
                titleStyle={styles.titleStyleActive}
                onPress={()=>filter_option.onChangeScooterStatus(m.type)}
              />
            }
            scooter_status_btns.push(btn);
            
        });


        return (
            <Modal
              animationType="slide"
              transparent={false}
              visible={filter_option.modalVisible}
              presentationStyle="fullScreen"
              >
              <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
                  <View style={{  justifyContent: "flex-start", alignItems: "flex-end",marginRight:10 }}>
                     <Icon name='close' size={30}  onPress={() => {
                        filter_option.setModalVisible(!filter_option.modalVisible);
                      }} />
                  </View>
                  <ScrollView style={{flexDirection:'column' }}>
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
                      <Text>電量</Text>
                      <RangeSlider
                        minValue={0}
                        maxValue={100}
                        tintColor="#999999"
                        handleBorderWidth={1}
                        handleBorderColor="#ff5722"
                        tintColorBetweenHandles="#ff5722"
                        minLabelColour="#666666"
                        maxLabelColour="#ff0000"
                        handleColor="#ff5722"
                        selectedMinimum={0}
                        selectedMaximum={100}
                        style={{ flex: 1, height: 70, padding: 10, }}
                        onChange={ (data)=>{ filter_option.power_change(data)} }
                      />
                   
                    </View>
                    <View style={styles.slider_view}>
                      <Text>天數</Text>
                      <RangeSlider
                        minValue={0}
                        maxValue={100}
                        tintColor="#999999"
                        handleBorderWidth={1}
                        handleBorderColor="#ff5722"
                        tintColorBetweenHandles="#ff5722"
                        minLabelColour="#666666"
                        maxLabelColour="#ff0000"
                        handleColor="#ff5722"
                        selectedMinimum={0}
                        selectedMaximum={100}
                        style={{ flex: 1, height: 70, padding: 10, }}
                        onChange={ (data)=>{ filter_option.days_change(data)} }
                      />
                   
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
    color:'#fff'
  },
  ss_buttonStyle:{
    borderColor:'rgb(255, 204, 34)',
  },
  service_buttonStyle:{
    borderColor:'#f00'
  },
  slider_view:{
    flexDirection:'row', alignItems: 'center', justifyContent: 'center',paddingLeft:20,
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
    borderBottomColor: '#eee',
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
    color:'#fff',
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
    color:'#fff'
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