import React, { Component } from 'react';
import { TextInput, View,StyleSheet,TouchableOpacity,TouchableHighlight,Modal,Alert,ScrollView,Picker,Animated,Easing,ActivityIndicator,Dimensions,SafeAreaView,BackHandler,AppRegistry} from 'react-native';
import { Text,Card, ListItem,Header, Button,Image,SearchBar,ButtonGroup,Avatar,Input,Divider   } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome5';
import '../global.js';
import QRCodeScanner from 'react-native-qrcode-scanner';
import LinearGradient from 'react-native-linear-gradient';

export default class ScanScooter extends React.Component {
    constructor () {
        super()
        this.state={
          select_type:"KH",
          show_picker:false,
          select_bike:"選擇車號",
          select_scooter:null,
          select_sid:null,
          selectedIndex: null,
          pickerData:[[],["-"],[]],
          data:null,
          show_loading:false
        }
        this.jump2ScooterInfo=this.jump2ScooterInfo.bind(this);
        this.onSuccess=this.onSuccess.bind(this);
        this.ShowPicker=this.ShowPicker.bind(this);
        this.setScooter=this.setScooter.bind(this);
        this.onChangeText=this.onChangeText.bind(this);
        this.Sure=this.Sure.bind(this);
    }
    componentDidMount(){
        this.setScooter();
    }
    setScooter(){
      this.setState({scooters:global.scooters},()=>{this.parser_plate()});
    }
    parser_plate(){
      var pickerData = [[],["-"],[]];
      this.state.scooters.map(function(m,i){
          var plate = m.plate;
          var parser_plate = plate.split("-");
          if(pickerData[0].indexOf(parser_plate[0]) == -1){
            pickerData[0].push(parser_plate[0]);
          }
          pickerData[2].push(parser_plate[1]);
      });
      pickerData[2].sort();
      this.setState({pickerData:pickerData});
    }
    selectScooter(sid,scooter){
      fetch(global.API+'/scooter/'+sid,{
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
          console.warn(json);
          if(json.code == 1){
            this.setState({data:json.data,select_scooter:scooter,show_loading:false});
          }
        });
    }
    back2page(){
      this.props.navigation.navigate('Home');
    }
    onSuccess = (e) => {
      
      this.jump2ScooterInfo(e.data);
    }
    jump2ScooterInfo(scooter){
      this.setState({show_loading:true});
      var select_sid = null;
      this.state.scooters.map(function(m,i){
        if(m.plate == scooter){
          select_sid = m.id;
        }
      }.bind(this));
      if(select_sid){
          this.setState({select_sid:select_sid},()=>{this.selectScooter(select_sid,scooter)});
      }else{
          Alert.alert('系統訊息',"找不到車輛，請重新輸入",[{text: '我知道了', onPress: () => {this.setState({show_loading:false})}}]);
      }
    }
    ShowPicker(){
      this.setState({show_picker:true});
    }
    CloseModel(){
      this.setState({select_bike:"選擇車號",select_scooter:null,select_sid:null,plate_no:""});
      this.props.ss_option.onClose('ss_modal');
    }
    selectWork(id,data){
      this.setState({select_bike:"選擇車號",select_scooter:null,select_sid:null,plate_no:""});
      this.props.ss_option.selectWork(id,data);
    }
    PickerMain(itemIndex,itemValue){
      this.setState({select_type: itemValue});
    }
    Sure(){
      if(this.state.plate_no == ""){
       Alert.alert('系統訊息',"請輸入號碼",[{text: '我知道了'}]);
      }else{
        var scooter = this.state.select_type+"-"+this.state.plate_no;
        this.jump2ScooterInfo(scooter);
        }
    }
    onChangeText(value){
      this.setState({plate_no:value});
    }
    render() {
        const {ss_option} = this.props;
        const {select_scooter,selectedIndex,pickerData,data} = this.state;
        if(this.state.show_picker){
          // console.warn(pickerData);
          Picker.init({
              pickerData: pickerData,
              selectedValue: [],
              pickerTitleText:"選擇車牌號碼",
              pickerConfirmBtnText:"確定",
              pickerCancelBtnText:"取消",
              pickerFontSize:21,
              onPickerConfirm: data => {
                var plate = data[0]+data[1]+data[2];
                this.setState({select_bike:plate,show_picker:false},()=>{this.jump2ScooterInfo(plate)});
              },
              onPickerCancel: data => {
                this.setState({show_picker:false});
              }
          });
          Picker.show();
        }
        var show_scooter_info = (select_scooter == null) ? false : true;
        
        var scooter_id = (data != null) ? data.id : "-";
        var scooter_power = (data != null) ? data.power : 0;
        var start_power_color = parseFloat(scooter_power/100);
        return (
            <Modal
              animationType="slide"
              transparent={false}
              visible={ss_option.ss_modal}
              presentationStyle="fullScreen"
            >
              <SafeAreaView style={{flex: 1, backgroundColor: '#2F3345'}}>
                  {this.state.show_loading &&(
                    <View style={styles.loading}>
                      <ActivityIndicator size="large" color="#ffffff" style={{marginBottom:5}} />
                      <Text style={{color:'#fff'}}>Loading...</Text>
                    </View>
                  )}
                  <View style={{position:'absolute',right:10,top:10,zIndex:151 }}>
                    <TouchableOpacity onPress={()=>this.CloseModel()}>
                      <Icon name='window-close' color={"#fff"} size={30} />
                   </TouchableOpacity>
                  </View>
                  {show_scooter_info ? 
                    (
                      <ScrollView style={{width:'100%'}}>
                        <View style={{width:'100%',justifyContent:'center',alignItems:'center'}}>
                          <View style={{justifyContent:'center',textAlign:'center',marginTop:10,paddingBottom:5,width:120,borderBottomColor:'#FF5722',borderBottomWidth:1}}>
                            <Text style={{ color: '#fff',fontSize:18,textAlign:'center' }}>{this.state.select_scooter}</Text>
                          </View>
                          <View style={{position:'relative',width:'80%',marginTop:30}}>
                              <View style={{width:'auto',height:70}}><Text style={{textAlign:'right',fontSize:60,color:'#fff',fontFamily:'arial'}}>{scooter_id}</Text></View>
                              <LinearGradient colors={['#12497B', '#4896B7']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.linearGradient}>
                                <Text style={{fontSize:15,lineHeight:27,textAlign:'left',paddingLeft:10,color:'#fff'}}>車輛編號</Text>
                              </LinearGradient>
                              
                          </View>
                          <View style={{position:'relative',width:'80%',marginTop:30}}>
                              <View style={{width:'auto',height:70}}><Text style={{textAlign:'right',fontSize:60,color:'#fff',fontFamily:'arial'}}>{scooter_power}</Text></View>
                              <LinearGradient colors={['#36A42D', '#F9250F']} start={{x:start_power_color,y:start_power_color}} end={{x:1,y:1}} style={styles.linearGradient}>
                                <Text style={{fontSize:15,lineHeight:27,textAlign:'left',paddingLeft:10,color:'#fff'}}>目前電量<Text style={{fontSize:10,color:'#fff'}}>(%)</Text></Text>
                              </LinearGradient>
                          </View>
                        </View>
                        
                      </ScrollView>
                    )
                  :
                    (
                        <ScrollView style={{width:'100%' }}>
                          <View style={{justifyContent:'center',alignItems:'center'}}>
                            <View style={{justifyContent:'center',textAlign:'center',marginTop:10,paddingBottom:5,width:120,borderBottomColor:'#FF5722',borderBottomWidth:1}}>
                              <Text style={{ color: '#fff',fontSize:18,textAlign:'center' }}>選擇車輛</Text>
                            </View>
                            <View style={{position:'relative',flex:1,width:'80%',marginBottom:5,marginTop:40,justifyContent:'center'}}>
                              <View style={{marginBottom:20}}>
                                <Picker
                                  selectedValue={this.state.select_type}
                                  style={{height: 20, width: 80,color:'#fff',borderWidth:1,borderColor:'#fff'}}
                                  itemStyle={{fontSize:12,color:'#fff'}}
                                  onValueChange={(itemValue, itemIndex) =>
                                    this.PickerMain(itemIndex,itemValue)
                                  }>
                                  <Picker.Item key={"p1"} style={{color:'#fff'}} label="KH"  value="KH"  />
                                  <Picker.Item key={"p2"} style={{color:'#fff'}} label="TPA" value="TPA"  />
                                </Picker>
                              </View>
                              <View style={{marginBottom:30}}>
                                <Input placeholder="請輸入號碼" placeholderTextColor={'#FFFACD'}  onSubmitEditing={() => this.Sure()} onChangeText={(text) => this.onChangeText(text)}  inputStyle={{fontSize:21,color:'#fff'}}/>
                              </View>
                              <View style={{flex:1,justifyContent:'center'}}>
                                <Button
                                  title="確定"
                                  onPress={()=>{this.Sure()}}
                                  titleStyle={{color:'#fff',fontSize:15}}

                                />
                              </View>

                            </View>
                            
                          </View>
                        </ScrollView>
                  )}
                  {show_scooter_info && (
                    <View style={{width:'100%',position:'absolute',bottom:0,flexDirection:'row',backgroundColor:'#fff',borderTopWidth:1,borderTopColor:'#ccc',paddingTop:10,paddingBottom:10,paddingLeft:20,paddingRight:20,justifyContent:'space-between',alignItems: "center"}}>
                      <Button  key={"btn_1"} icon={<Icon name="charging-station" size={25} color="#6A7684" style={{marginRight:5}}   />}  type="outline" buttonStyle={{borderWidth:0}} titleStyle={{color:"#6A7684"}} onPress={()=>this.selectWork(1,data)} title="車輛換電" />
                      <View style={{width:1,height:'100%',borderRightColor:'#999',borderRightWidth:1}}></View>
                      <Button  key={"btn_2"} icon={<Icon name="route" size={25} color="#6A7684"  style={{marginRight:5}}  />}  type="outline" buttonStyle={{borderWidth:0}} titleStyle={{color:"#6A7684"}} onPress={()=>this.selectWork(2,data)} title="移動車輛" />
                    </View>
                  )}
                </SafeAreaView>
            </Modal>
       
        );
    }
}

const styles = StyleSheet.create({
  loading:{
    position:'absolute',
    zIndex:10001,
    top:'40%',
    left:'40%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'rgba(1,1,1,0.8)',
    padding:20,
    borderBottomLeftRadius:5,
    borderBottomRightRadius:5,
    borderTopLeftRadius:5,
    borderTopRightRadius:5
  },
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
  linearGradient: {
    flex: 1,
    height:27,
    width:'100%',
    position:'absolute',zIndex:-1,left:0,bottom:0,
  },
  btn_containerStyle: {
        height: 50,
        width: '100%',
        borderWidth: 0,
        backgroundColor: '#77DDFF',
        marginTop: 0,
        borderRadius: 0,
        paddingLeft:0,
        paddingRight:0,
        marginLeft:0,
        marginRight:0,
        marginBottom:0,
    },
    btn_buttonStyle: {
        backgroundColor: '#fff',
        borderWidth: 0,
        padding:0,
        lineHeight:50
    },
    btn_selectedButtonStyle: {
        backgroundColor: '#fff'
    },
});


