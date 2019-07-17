import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,Alert,PixelRatio,TouchableOpacity,TextInput,Picker,ActivityIndicator } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import { Card, ListItem,Header,Input, Button,Image,SearchBar,ButtonGroup,CheckBox } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome5';
import '../global.js';
import ActionSheet from 'react-native-action-sheet';
import ImagePicker from 'react-native-image-crop-picker';
const severe_title = global.severe_title;
const scootet_status = global.scootet_status;

var t = 0;

export default class Violation extends React.Component {
    constructor () {
        super()
        this.state = {
            photos:[],
            show_loading:false,
            avatarSource1: null,
            avatarSource2: null,
            avatarSource3: null,
            avatarSource4: null,
            select_type:"",
            select_subtype:"",
            hit_position:false,
            MainCate: ['請選擇','違規停車（巡查）','違規停車（檢舉）','雙載（巡查）','雙載（檢舉）','危險駕駛（巡查）','危險駕駛（檢舉）','營運範圍外還車','車輛損壞賠償'],
            SubCate:["禁止臨時停車處所停車。","彎道、陡坡、狹路、槽化線、交通島或道路修理地段停車。","在機場、車站、碼頭、學校、娛樂、展覽、競技、市場、或其他公共場所出、入口或消防栓之前停車。","在設有禁止停車標誌、標線之處所停車。","在顯有妨礙其他人、車通行處所停車。","不依順行方向，或不緊靠道路右側，或併排停車，或單行道不緊靠路邊停車。","停車時間、位置、方式、車種不依規定。","於身心障礙專用停車位違規停車。","還車時停放私人區域"]
        }
        this.selectPhotoTapped = this.selectPhotoTapped.bind(this);
        this.SelectOperation=this.SelectOperation.bind(this);
        this.send_violation=this.send_violation.bind(this);
    }
    componentWillMount(){
      // this.getPosition();
    }
    
    pad(number){ return (number < 10 ? '0' : '') + number }
    dateFormat(date){
      var format_date = new Date(date);
      var create_date = this.pad(format_date.getMonth()+1)+'/'+this.pad(format_date.getDate())+' '+this.pad(format_date.getHours())+':'+this.pad(format_date.getMinutes());
      return create_date;
    }
    send_violation(){
        // this.setState({show_loading:true});
        var msg = [];
        var photo_count = 0;
        if(this.state.photos.length < 2){
          msg.push('請上傳2~4張照片');
        }
        if(this.state.select_type == ""){
          msg.push('請選擇違規項目');
        }
        if(this.state.location == ""){
          msg.push('請描述發生地點');
        }
        if(msg.length > 0){
          Alert.alert('⚠️ Warning',msg.join('\n'),[{text: 'OK'}]);
          this.setState({show_loading:false,modal1:true,msg:msg});
        }else{
            var scooter = this.props.violation_option.scooter;
            var formData  = new FormData();
            formData.append("scooter_id", scooter.id);
            formData.append("plate", scooter.plate);
            formData.append("type", this.state.select_type);
            formData.append("subtype", this.state.select_subtype);
            formData.append("location", this.state.location);
            for (var i = 0; i < 4; i++) {
              var photo = "";
              if(this.state.photos[i] != undefined){
                photo = 'data:image/jpeg;base64,' + this.state.photos[i].data;
              }
              formData.append("photo"+(i+1),photo);
            }
           
            formData.append("operator", global.user_givenName);
            // console.warn(formData);
            fetch(global.API+'/scooter/violation',{
              method: 'POST',
              mode: 'cors',
              body: formData,
              credentials: 'include'
            })
            .then((response) => {
              return response.json();
            })
            .then((json) => {
              this.setState({show_loading:false});
              if(json.code ==1){
                Alert.alert('👍🏻 Success',"送出成功",[{text: 'OK',onPress: () => {this.props.violation_option.onClose('violation_modal');
                this.clearData();}}]);
              }else{
                Alert.alert('⚠️ Warning',json.reason,[{text: 'OK'}]);
              }
            });
        }

    }
    SelectOperation(){
      var BUTTONS = [
        '開啟相機',
        '從相簿選擇',
        '取消',
      ];

      var DESTRUCTIVE_INDEX = 1;
      var CANCEL_INDEX = 2;
      ActionSheet.showActionSheetWithOptions({
        title:'拍照/上傳',
        options: BUTTONS,
        cancelButtonIndex: CANCEL_INDEX,
        destructiveButtonIndex: DESTRUCTIVE_INDEX,
        tintColor: '#ff5722'
      },
      (buttonIndex) => {
        switch(buttonIndex){
          case 0:
            this.selectPhotoTapped('camera');
          break;
          case 1:
            this.selectPhotoTapped('album');
          break;
        }
      });
    }
    selectPhotoTapped(type) {
      if(type == "album"){
        ImagePicker.openPicker({
          compressImageMaxWidth: 800,
          compressImageMaxHeight: 800,
          minFiles:2,
          maxFiles:4,
          multiple: true,
          includeBase64:true,
          compressImageQuality:0.6,
          forceJpg:true
        }).then(image => {
          if(image.length > 0){
            if(this.state.photos.length > 0){
              var photos = this.state.photos;
              this.setState({photos:photos.concat(image)});
            }else{
              this.setState({photos:image});
            }
          }
        });
      }else{
        ImagePicker.openCamera({
          compressImageMaxWidth: 800,
          compressImageMaxHeight: 800,
          includeBase64:true,
          compressImageQuality:0.6,
          forceJpg:true
        }).then(image => {
          this.setState({photos:this.state.photos.concat(image)});
        });
      }
    }
    clearData(){
      this.setState({ 
        photos: [],
        location:"",
        select_type:"",
        select_subtype:"",
        hit_position:false,
      });
    }
    PickerMain(itemIndex,itemValue){
        this.setState({select_type: itemValue});
        if(itemIndex == 1 || itemIndex == 2){
          this.setState({showSubpick:true});
        }else{
          this.setState({showSubpick:false});
        }
    }
    PickerSub(itemValue){
        this.setState({select_subtype: itemValue});
    }
    getPosition(){
      navigator.geolocation.getCurrentPosition(
        (position: any) => {
          const positionData: any = position.coords;
          var latlng = positionData.latitude+","+positionData.longitude;
          fetch("https://maps.googleapis.com/maps/api/geocode/json?latlng="+latlng+"&language=zh-TW&key="+global.key,{
             method: 'GET',
          })
          .then((response) => response.json())
          .then((json)=> {
            this.setState({hit_position:true});
            if(json.results.length > 0){
              if(json.results.length == 1){
                this.setState({location:json.results[0].formatted_address});  
              }else{
                this.setState({location:json.results[0].formatted_address+"\n"+json.results[1].formatted_address});  
              }
            }
          });
        },
        (error: any) => {
          console.warn('失敗：' + JSON.stringify(error.message))
        }, {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 1000
        }
      );

    }
    render() {
        const {violation_option} = this.props;

        var photos = this.state.photos.map(function(m,i){
            if(i <= 3){
              let source = 'data:image/jpeg;base64,' + m.data;
              return (<View
                      style={[
                        styles.avatar,
                        styles.avatarContainer,
                      ]}
                      key={"photo"+i}
                    >
                      <Image style={styles.avatar} source={{uri: source}} />
                    </View>
              );
            }
        })
        return (
            <Modal
              animationType="slide"
              transparent={false}
              visible={violation_option.violation_modal}
              presentationStyle="fullScreen"
              >
              <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
                  {this.state.show_loading && (
                    <View style={{position:'absolute',justifyContent:'center',alignItems:'center',width:'100%',height:'110%',top:0,left:0,zIndex:100005,backgroundColor:'rgba(0,0,0,0.6)'}}>
                        <View  style={styles.loading}>
                        <ActivityIndicator size="large" color="#ffffff" style={{marginBottom:5}} />
                        <Text style={{color:'#fff'}}>Loading...</Text>
                        </View>
                    </View>
                  )}
                  <View style={{  justifyContent: "flex-start", alignItems: "flex-end",marginRight:5,marginTop:5 }}>
                     <Icon name='times-circle' size={30}  onPress={() => {
                        violation_option.onClose('violation_modal');this.clearData();
                      }} />
                  </View>
                    <View style={{justifyContent:'center',alignItems:'center'}}><Text>📷 拍照/上傳 (請上傳2~4張)</Text></View>
                    <View style={{flexDirection:'row',justifyContent: "space-around",alignItems: "flex-start",marginTop:10}}>
                        
                        {photos}
                        {this.state.photos.length < 4 && (
                          <TouchableOpacity onPress={()=>this.SelectOperation()}>
                            <View style={[
                              styles.avatar,
                              styles.avatarContainer,
                            ]}>
                                <Text>+</Text>
                            </View>
                          </TouchableOpacity>
                        )}
                      </View>
                    <View style={{paddingLeft:30,paddingRight:30,paddingTop:10,paddingBottom:10}}>
                      <View style={{justifyContent:'center',alignItems:'center',marginTop:20}}><Text>📌 地點</Text></View>
                        <TextInput
                          editable = {true}
                          multiline = {true}
                          numberOfLines = {5}
                          onChangeText={(location) => this.setState({location})}
                          value={this.state.location}
                          placeholder="請描述發生地點"
                          style={{height: 100, borderColor: '#ccc', borderWidth: 1,textAlign:'left',textAlignVertical: 'top',fontSize:12}}
                        />
                        {!this.state.hit_position &&(
                          <Button icon={
                              <Icon
                                name="search-location"
                                size={12}
                                color="white"
                              />
                            } title=" 取得目前所在地" onPress={()=>this.getPosition()} titleStyle={{fontSize:12}} buttonStyle={{borderTopLeftRadius:0,borderTopRightRadius:0}}/>
                        )}
                    </View>
                    <View style={{justifyContent:'center',alignItems:'center'}}><Text>⚠️ 請選擇違規項目</Text></View>

                    <View style={{justifyContent:'center',alignItems:'center',marginTop:20}}>
                      <Picker
                        selectedValue={this.state.select_type}
                        style={{height: 20, width: '96%'}}
                        itemStyle={{fontSize:12}}
                        onValueChange={(itemValue, itemIndex) =>
                          this.PickerMain(itemIndex,itemValue)
                        }>
                        {this.state.MainCate.map(function(m,i){
                          return <Picker.Item key={"m"+i} label={m} value={m}  />
                        })}
                      </Picker>
                      {this.state.showSubpick &&(
                        <Picker
                          selectedValue={this.state.select_subtype}
                          style={{height: 20, width: '96%',marginTop:20}}
                          itemStyle={{fontSize:12}}
                          onValueChange={(itemValue, itemIndex) =>
                            this.PickerSub(itemValue)
                          }>
                          {this.state.SubCate.map(function(m,i){
                            return <Picker.Item key={"s"+i} label={m} value={m}  />
                          })}
                        </Picker>
                      )}
                    </View>
                    <View style={{position:'absolute',width:'100%',bottom:0,left:0,zIndex:1}}>
                    <Button
                      title="送出"
                      titleStyle={styles.view_titleStyle}
                      onPress={()=>this.send_violation()}
                    />
                    </View>
                </SafeAreaView>
            </Modal>
       
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  avatarContainer: {
    backgroundColor: '#F5F5F5',
    borderColor: '#9B9B9B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 90,
    height: 90,
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


