import React, { Component } from 'react';
import { TextInput, View,StyleSheet,TouchableOpacity,Image,TouchableHighlight,Alert,Platform,ScrollView,Animated,Easing,Picker,ActivityIndicator,Dimensions,SafeAreaView,BackHandler,AppRegistry} from 'react-native';
import { Text,Card, ListItem,Header, Button,SearchBar,ButtonGroup,Avatar,Input,Divider   } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import '../global.js';
import ActionSheet from 'react-native-action-sheet';
import shallowCompare from 'react-addons-shallow-compare';
import {SingleImage} from 'react-native-zoom-lightbox';
let admin = ['huang','wlee','jerike'];
export default class MultipleController extends React.Component {
    constructor(props) {
        super(props);
        this.state={
          show_loading:false,
          show_msg:"Loading...",
          send_now:false,
          update_now:false,
          reload_now:false,
          idx:"KH",
          select_scooters:[],
          start_no:"",
          end_no:"",
        }
        this.back2page=this.back2page.bind(this);
    }


    back2page(){
      this.clearData();
      this.props.navigation.navigate('Home');
    }
    pad(num, n=2){
      var len = num.toString().length;
      while(len < n) {
        num = "0" +num;
        len++;
      }
      return num;
    }

    
    clearData(){
      this.setState({
        scooter:{},
        show_loading:false,
        show_msg:"Loading...",
        send_now:false
      });
    }
    updateVersion(){
      if(this.state.start_no == ""){
        Alert.alert('系統訊息',"請輸入開始號碼",[{text: '我知道了'}]);
        return false;
      }
      if(this.state.end_no == ""){
        Alert.alert('系統訊息',"請輸入結束號碼",[{text: '我知道了'}]);
        return false;
      }
      var idx = this.state.idx;
      var start_no = parseInt(this.state.start_no);
      var end_no = parseInt(this.state.end_no);
      var scooter_list = [];
      if (end_no == start_no){
        var no = parseInt(start_no);
        no = this.pad(no,4);
        scooter_list.push(idx+"-"+no);
      }else{
        for (var i = 0; i <= (end_no-start_no);i++) {
          var no = parseInt(start_no) + i;
          no = this.pad(no,4);
          scooter_list.push(idx+"-"+no);
        }
      }
      Alert.alert('系統訊息',"確定要將以下車輛更新版本？\n"+scooter_list.join(','),[{text: '不要！'},{text: '確定', onPress: () => {this.submit(scooter_list)}}]);
    }
    reloadScooter(){
      if(this.state.start_no == ""){
        Alert.alert('系統訊息',"請輸入開始號碼",[{text: '我知道了'}]);
        return false;
      }
      if(this.state.end_no == ""){
        Alert.alert('系統訊息',"請輸入結束號碼",[{text: '我知道了'}]);
        return false;
      }
      var idx = this.state.idx;
      var start_no = parseInt(this.state.start_no);
      var end_no = parseInt(this.state.end_no);
      var scooter_list = [];
      if (end_no == start_no){
        var no = parseInt(start_no);
        no = this.pad(no,4);
        scooter_list.push(idx+"-"+no);
      }else{
        for (var i = 0; i <= (end_no-start_no);i++) {
          var no = parseInt(start_no) + i;
          no = this.pad(no,4);
          scooter_list.push(idx+"-"+no);
        }
      }
      Alert.alert('系統訊息',"確定要將以下車輛重新啟動？\n"+scooter_list.join(','),[{text: '不要！'},{text: '確定', onPress: () => {this.reload(scooter_list)}}]);
    }
    updateVersion2(){
      var scooter_list = [];
      this.state.select_scooters.map(function(m,i){
        if (m!=null) {
          scooter_list.push(m);
        }
      });

      if(scooter_list.length==0){
        Alert.alert('系統訊息',"請輸入車號",[{text: '我知道了'}]);
        return false;
      }else{
        Alert.alert('系統訊息',"確定要將以下車輛更新版本？\n"+scooter_list.join(','),[{text: '不要！'},{text: '確定', onPress: () => {this.submit(scooter_list)}}]);
      }
    }
    reloadScooter2(){
      var scooter_list = [];
      this.state.select_scooters.map(function(m,i){
        if (m!=null) {
          scooter_list.push(m);
        }
      });
      
      if(scooter_list.length==0){
        Alert.alert('系統訊息',"請輸入車號",[{text: '我知道了'}]);
        return false;
      }else{
        Alert.alert('系統訊息',"確定要將以下車輛重新啟動？\n"+scooter_list.join(','),[{text: '不要！'},{text: '確定', onPress: () => {this.reload(scooter_list)}}]);
      }
    }
    submit(scooter_list){
      if(admin.indexOf(global.user_givenName.toLowerCase()) == -1){
          Alert.alert('系統訊息',"您沒有權限可以執行",[{text: 'ok',onPress:()=>{this.props.navigation.navigate('Home')}}]);
          return false;
      }
      this.setState({update_now:true});
      if(scooter_list.length == 0){
        Alert.alert('系統訊息',"無法取得車輛號碼",[{text: '我知道了'}]);
        return false;
      }else{
        var faild = [];
        var right = [];
        scooter_list.map(function(m,i){
          var plate = false;
          global.scooters.map(function(d,k){
            if(d['plate'] == m){
              plate = true;
              right.push(d['id']);
            }
          }.bind(this));
          if(!plate){
            faild.push(m);
          }

        }.bind(this));

        var formData  = new FormData();
        right.map(function(m,i){
          formData.append("sel_scooters[]", m);
        });
        formData.append("operator", global.user_givenName);
        fetch(global.API+'/scooter/controller/update',{
          method: 'POST',
          mode: 'cors',
          body: formData,
          credentials: 'include'
        })
        .then((response) => response.json())
        .then((json) => {
           this.setState({update_now:false});
           if (faild.length > 0) {
              Alert.alert('系統訊息',"所選車輛已更新，但以下車號不存在:\n"+faild.join(','),[{text: '我知道了'}]);
           }else{
              Alert.alert('系統訊息',"所選車輛已更新",[{text: '我知道了'}]);
           }
           
        });
      }
    }
    reload(scooter_list){
      if(admin.indexOf(global.user_givenName.toLowerCase()) == -1){
          Alert.alert('系統訊息',"您沒有權限可以執行",[{text: 'ok',onPress:()=>{this.props.navigation.navigate('Home')}}]);
          return false;
      }
      this.setState({reload_now:true});
      if(scooter_list.length == 0){
        Alert.alert('系統訊息',"無法取得車輛號碼",[{text: '我知道了'}]);
        return false;
      }else{
        var faild = [];
        var right = [];
        scooter_list.map(function(m,i){
          var plate = false;
          global.scooters.map(function(d,k){
            if(d['plate'] == m){
              plate = true;
              right.push(d['id']);
            }
          }.bind(this));
          if(!plate){
            faild.push(m);
          }

        }.bind(this));

        var formData  = new FormData();
        right.map(function(m,i){
          formData.append("sel_scooters[]", m);
        });
        formData.append("operator", global.user_givenName);
        fetch(global.API+'/scooter/controller/reload',{
          method: 'POST',
          mode: 'cors',
          body: formData,
          credentials: 'include'
        })
        .then((response) => response.json())
        .then((json) => {
          this.setState({reload_now:false});
           if (faild.length > 0) {
              Alert.alert('系統訊息',"所選車輛已重啟，但以下車號不存在:\n"+faild.join(','),[{text: '我知道了'}]);
           }else{
              Alert.alert('系統訊息',"所選車輛已重啟",[{text: '我知道了'}]);
           }
        });
      }
    }
    Sure(){
      if(this.state.plate_no == ""){
       Alert.alert('系統訊息',"請輸入號碼",[{text: '我知道了'}]);
      }else{
        var scooter = this.state.idx+"-"+this.state.plate_no;
        this.jump2ScooterInfo(scooter);
        this.setState({plate_no:""});
      }
    }
    jump2ScooterInfo(scooter){
      this.setState({show_loading:true});
      var select_scooters = this.state.select_scooters;
      select_scooters.push(scooter);
      this.setState({show_loading:false,select_scooters:select_scooters});
    }
    removeScooter(scooter){
      var select_scooters = this.state.select_scooters;
      var index = select_scooters.indexOf(scooter);
      delete select_scooters[index];
      this.setState({select_scooters:select_scooters});
    }
    onChangeText(value){
      this.setState({plate_no:value});
    }
    onChangeNo1(value){
      this.setState({start_no:value});
    }
    onChangeNo2(value){
      this.setState({end_no:value});
    }
    render() {
        const {scooter,show_msg,idx} = this.state;

        return (
            <SafeAreaView style={{flex: 1,justifyContent: 'center',alignItems: 'center',backgroundColor:'#2F3345',color:'#fff'}}>
                <Header
                  centerComponent={<View style={{justifyContent:'center',textAlign:'center',marginTop:10,paddingBottom:5,width:120,borderBottomColor:'#16B354',borderBottomWidth:1}}>
                                    <Text style={{ color: '#fff',fontSize:18,textAlign:'center' }}>批次控制車輛</Text>
                                  </View>}
                  leftComponent={<TouchableHighlight onPress={()=>this.props.navigation.goBack()}><View style={{flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}><Icon name="angle-left" color='#fff' size={25} /><Text style={{paddingLeft:10,color:'#fff',fontWeight:'bold',fontSize:13}}>回詳細頁</Text></View></TouchableHighlight>}
                  containerStyle={styles.header}
                />
                {this.state.show_loading &&(
                  <View style={styles.loading}>
                    <ActivityIndicator size="large" color="#ffffff" style={{marginBottom:5}} />
                    <Text style={{color:'#fff'}}>{show_msg}</Text>
                  </View>
                )}
                <ScrollView style={{width:'100%'}}>
                  <View style={{justifyContent:'center',alignItems: 'center'}}>
                    <View style={{justifyContent:'center'}}>
                        <View style={{width:'90%',justifyContent:'center'}}>
                            <View style={{justifyContent:'space-around',marginTop:10,paddingBottom:5,borderBottomColor:'#C67B38',borderBottomWidth:1}}>
                              <Text style={{ color: '#fff',fontSize:18 }}>輸入區間</Text>
                            </View>
                            <View style={{marginTop:10,justifyContent:'space-around',flexDirection:'row',alignItems:'center'}}>

                                  <Picker
                                    selectedValue={idx}
                                    style={{height: 20,width: 100,color:'#fff',borderWidth:1,borderColor:'#fff'}}
                                    onValueChange={(itemValue, itemIndex) =>
                                      this.setState({idx: itemValue})
                                    }>
                                    <Picker.Item key={"p1"} style={{color:'#fff'}} label="KH"  value="KH"  />
                                    <Picker.Item key={"p2"} style={{color:'#fff'}} label="TPA" value="TPA"  />
                                  </Picker>
                                  <TextInput
                                    key={'input-no1'}
                                    keyboardType={'phone-pad'}
                                    placeholder="開始號碼" placeholderTextColor={'#FFFACD'} 
                                    onChangeText={(text) => this.onChangeNo1(text)} 
                                    value={this.state.start_no}
                                    style={{borderWidth:1,borderColor:'#fff',height: 40, width: 100,fontSize:15,color:'#fff'}}
                                  />
                                  <Text style={{color:'#fff'}}>~</Text>
                                  <TextInput
                                    key={'input-no2'}
                                    keyboardType={'phone-pad'}
                                    placeholder="結束號碼" placeholderTextColor={'#FFFACD'} 
                                    onChangeText={(text) => this.onChangeNo2(text)} 
                                    value={this.state.end_no}
                                    style={{borderWidth:1,borderColor:'#fff',height: 40, width: 100,fontSize:15,color:'#fff'}}
                                  />

                               
                            </View>
                            <View style={{flexDirection:'row',justifyContent:'space-around',marginTop:20}}>
                              {this.state.update_now ? 
                                <Button title="執行中..."  raised={true} buttonStyle={{backgroundColor:'#FF3333',borderRadius:0}} disabled  disabledStyle={{backgroundColor:'#e0e0e0'}}/>
                              :
                                <Button
                                  title="更新版本"
                                  buttonStyle={{backgroundColor:'#FF3333',borderRadius:0}}
                                  raised={true}
                                  onPress={()=>this.updateVersion()}
                                  icon={<Icon
                                        name="cloud-upload-alt"
                                        size={15}
                                        color="white"
                                      />}
                                  titleStyle={{marginLeft:10}}
                                />
                              }
                              {this.state.reload_now ? 
                                <Button title="執行中..."  raised={true} buttonStyle={{backgroundColor:'#00AA00',borderRadius:0}} disabled  disabledStyle={{backgroundColor:'#e0e0e0'}}/>
                              :
                                <Button
                                  title="車輛重啟"
                                  buttonStyle={{backgroundColor:'#00AA00',borderRadius:0}}
                                  raised={true}
                                  onPress={()=>this.reloadScooter()}
                                  icon={<Icon
                                        name="sync-alt"
                                        size={15}
                                        color="white"
                                      />}
                                  titleStyle={{marginLeft:10}}
                                />
                              }
                            </View>
                          </View>

                          <View style={{width:'90%',justifyContent:'center'}}>
                            <View style={{justifyContent:'space-around',marginTop:10,paddingBottom:5,borderBottomColor:'#C67B38',borderBottomWidth:1}}>
                              <Text style={{ color: '#fff',fontSize:18 }}>填入車號</Text>
                            </View>
                                <View style={{marginTop:10,justifyContent:'space-around',flexDirection:'row',alignItems:'center'}}>
                                  <Picker
                                    selectedValue={idx}
                                    style={{height: 20,width: 100,color:'#fff'}}
                                    onValueChange={(itemValue, itemIndex) =>
                                      this.setState({idx: itemValue})
                                    }>
                                    <Picker.Item key={"p1"} style={{color:'#fff'}} label="KH"  value="KH"  />
                                    <Picker.Item key={"p2"} style={{color:'#fff'}} label="TPA" value="TPA"  />
                                  </Picker>
                                  <TextInput
                                    key={'input-no3'}
                                    keyboardType={'phone-pad'}
                                    placeholder="車輛號碼" placeholderTextColor={'#FFFACD'} 
                                    onChangeText={(text) => this.onChangeText(text)} 
                                    value={this.state.plate_no}
                                    style={{borderWidth:1,borderColor:'#fff',height: 40, width: 200,fontSize:15,color:'#fff'}} onSubmitEditing={(event) => { this.Sure()}}
                                  />

                                </View>
                               
                            <View style={{flexDirection: 'row',justifyContent:'space-around',alignItems:'flex-start',flexWrap:'wrap'}}>
                              {
                                this.state.select_scooters.map(function(m,i){
                                  return <Button key={"btn"+i} iconContainerStyle={{marginBottom:20}}  buttonStyle={{backgroundColor:'#FFFF33',borderRadius:0}} iconRight titleStyle={{color:'#333',marginRight:10}} containerStyle={{marginBottom:10}} title={m} onPress={()=>{this.removeScooter(m)}} icon={ <Icon name="times" size={10} color="black" /> } />
                                }.bind(this))
                              }
                            </View>
                            <View style={{flexDirection:'row',justifyContent:'space-around',marginTop:20}}>
                              {this.state.update_now ? 
                                <Button title="執行中..."  raised={true} buttonStyle={{backgroundColor:'#FF3333',borderRadius:0}} disabled  disabledStyle={{backgroundColor:'#e0e0e0'}}/>
                              :
                                <Button
                                  title="更新版本"
                                  buttonStyle={{backgroundColor:'#FF3333',borderRadius:0}}
                                  raised={true}
                                  onPress={()=>this.updateVersion2()}
                                  icon={<Icon
                                        name="cloud-upload-alt"
                                        size={15}
                                        color="white"
                                      />}
                                  titleStyle={{marginLeft:10}}
                                />
                              }
                              {this.state.reload_now ? 
                                <Button title="執行中..."  raised={true} buttonStyle={{backgroundColor:'#00AA00',borderRadius:0}} disabled  disabledStyle={{backgroundColor:'#e0e0e0'}}/>
                              :
                                <Button
                                  title="車輛重啟"
                                  buttonStyle={{backgroundColor:'#00AA00',borderRadius:0}}
                                  raised={true}
                                  onPress={()=>this.reloadScooter2()}
                                  icon={<Icon
                                        name="sync-alt"
                                        size={15}
                                        color="white"
                                      />}
                                  titleStyle={{marginLeft:10}}
                                />
                              }
                            </View>
                          </View>
                    </View>                  
                  </View>
                </ScrollView>
                
                
                

            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
  input: {
    width:'60%',
    backgroundColor:'#fff',
    borderTopLeftRadius:5,
    borderTopRightRadius:5,
    borderBottomRightRadius:5,
    borderBottomLeftRadius:5,
    height: 40, 
    borderColor: 'gray', 
    borderWidth: 1,
    marginTop:20,
    paddingLeft:5
  },
  listItem:{
    borderBottomWidth:1,borderBottomColor:'#EFF1F4'
  },
  loading:{
    position:'absolute',
    zIndex:10001,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'rgba(1,1,1,0.8)',
    padding:20,
    borderBottomLeftRadius:5,
    borderBottomRightRadius:5,
    borderTopLeftRadius:5,
    borderTopRightRadius:5
  },

  header:{
      backgroundColor: '#2F3345',
      justifyContent: 'space-around',
      paddingTop:-25,
      height:50,
      borderBottomWidth:0
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },

});
// AppRegistry.registerComponent('default', () => ChargingBattery);