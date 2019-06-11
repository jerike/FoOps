import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { Card, ListItem,Header, Button,Image,SearchBar,ButtonGroup,CheckBox,Slider } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import RangeSlider from 'react-native-range-slider'

export default class Filter extends React.Component {
    constructor () {
      super()
      this.state = {
        selectedIndex: 2,
        value:100,
        wab1:false
      }
      this.updateIndex = this.updateIndex.bind(this)
    }
    updateIndex (selectedIndex) {
      this.setState({selectedIndex})
    }
    render() {
        const {filter_option} = this.props;
        const buttons = ['Hello', 'World', 'Buttons','Hello', 'World', 'Buttons']
        const { selectedIndex } = this.state
        var total = filter_option.scooter.length;
        return (
            <Modal
              animationType="slide"
              transparent={false}
              visible={filter_option.modalVisible}
              presentationStyle="fullScreen"
              >
              <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
                  <View style={{  justifyContent: "flex-start", alignItems: "flex-end" }}>
<<<<<<< HEAD
                     <Icon name='close'  onPress={() => {
=======
                     <Icon name='close' size={20}  onPress={() => {
>>>>>>> 457f7b19d706ca011a3a787b5ceccac00b6fd854
                        filter_option.setModalVisible(!filter_option.modalVisible);
                      }} />
                  </View>
                  <ScrollView style={{flexDirection:'column' }}>
<<<<<<< HEAD
                  {
                    filter_option.condition.map((l, i) => (
                    <ListItem
                      key={i}
                      title={l.description}
                      
                    />
                    ))
                  }                    
                  </ScrollView>
=======
                    <View style={styles.row_view}>
                        <Button
                          title="區域 1"
                          type="outline"
                          style={styles.work_area_btn}
                          icon={
                                
                                  this.state.wab1 && (<Icon
                                        name="check-circle"
                                        size={15}
                                        color="white"
                                      />)
                                
                              }
                          buttonStyle={[
                                        !this.state.wab1 && styles.Wa_buttonStyle,
                                        this.state.wab1 && styles.Wa_buttonStyleActive,
                                      ]}
                          titleStyle={[
                                        !this.state.wab1 && styles.titleStyle,
                                        this.state.wab1 && styles.titleStyleActive,
                                      ]}
                          onPress={()=>this.setState({wab1:!this.state.wab1})}
                        />
                         <Button
                          title="區域 2"
                          type="outline"
                          style={styles.work_area_btn}
                          buttonStyle={styles.Wa_buttonStyle}
                          titleStyle={styles.titleStyle}
                        />
                         <Button
                          title="區域 3"
                          type="outline"
                          style={styles.work_area_btn}
                          buttonStyle={styles.Wa_buttonStyle}
                          titleStyle={styles.titleStyle}
                        />
                         <Button
                          title="區域 4"
                          type="outline"
                          style={styles.work_area_btn}
                          buttonStyle={styles.Wa_buttonStyle}
                          titleStyle={styles.titleStyle}
                        />
                         <Button
                          title="區域 5"
                          type="outline"
                          style={styles.work_area_btn}
                          buttonStyle={styles.Wa_buttonStyle}
                          titleStyle={styles.titleStyle}
                        />
                         <Button
                          title="區域 6"
                          type="outline"
                          style={styles.work_area_btn}
                          buttonStyle={styles.Wa_buttonStyle}
                          titleStyle={styles.titleStyle}
                        />
                    </View>
                    <View style={styles.row_view}>
                        <Button
                          title="優先處理"
                          type="outline"
                          style={styles.work_area_btn}
                          buttonStyle={styles.ss_buttonStyle}
                          titleStyle={styles.titleStyle}
                        />
                         <Button
                          title="次要處理"
                          type="outline"
                          style={styles.work_area_btn}
                          buttonStyle={styles.ss_buttonStyle}
                          titleStyle={styles.titleStyle}
                        />
                         <Button
                          title="待處理"
                          type="outline"
                          style={styles.work_area_btn}
                          buttonStyle={styles.ss_buttonStyle}
                          titleStyle={styles.titleStyle}
                        />
                         <Button
                          title="正常"
                          type="outline"
                          style={styles.work_area_btn}
                          buttonStyle={styles.ss_buttonStyle}
                          titleStyle={styles.titleStyle}
                        />
                    </View>
                    <View style={styles.row_view}>
                        <Button
                          title="尚未服務"
                          type="outline"
                          style={styles.work_area_btn}
                          buttonStyle={styles.service_buttonStyle}
                          titleStyle={styles.titleStyle}
                        />
                         <Button
                          title="預約中"
                          type="outline"
                          style={styles.work_area_btn}
                          buttonStyle={styles.service_buttonStyle}
                          titleStyle={styles.titleStyle}
                        />
                         <Button
                          title="使用中"
                          type="outline"
                          style={styles.work_area_btn}
                          buttonStyle={styles.service_buttonStyle}
                          titleStyle={styles.titleStyle}
                        />
                         <Button
                          title="暫停服務"
                          type="outline"
                          style={styles.work_area_btn}
                          buttonStyle={styles.service_buttonStyle}
                          titleStyle={styles.titleStyle}
                        />
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
                        onChange={ (data)=>{ console.log(data);} }
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
>>>>>>> 457f7b19d706ca011a3a787b5ceccac00b6fd854
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
    color:'#fff'
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