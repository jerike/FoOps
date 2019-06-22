import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,Alert,PixelRatio,TouchableOpacity,TextInput,Picker,ActivityIndicator } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import { Card, ListItem,Header,Input, Button,Image,SearchBar,ButtonGroup,CheckBox } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import '../global.js';
import ImagePicker from 'react-native-image-picker';

const severe_title = global.severe_title;
const scootet_status = global.scootet_status;

var t = 0;
const options = {
    imageCount: 4,             
    isRecordSelected: false,   
    isCamera: true,            
    isCrop: false,             
    maxWidth: 800,    
    maxHeight: 800,    
    isGif: false,              
    showCropCircle: false,     
    showCropFrame: false,       
    showCropGrid: false,       
    quality: 0.6,               
    enableBase64: true,  
    cancelButtonTitle:'取消',
    takePhotoButtonTitle:'拍照',
    chooseFromLibraryButtonTitle:'從相簿選擇',
    location:"",
    operator:""
};
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
            MainCate: ['請選擇','違規停車（巡查）','違規停車（檢舉）','雙載（巡查）','雙載（檢舉）','危險駕駛（巡查）','危險駕駛（檢舉）','營運範圍外還車','車輛損壞賠償'],
            SubCate:["禁止臨時停車處所停車。","彎道、陡坡、狹路、槽化線、交通島或道路修理地段停車。","在機場、車站、碼頭、學校、娛樂、展覽、競技、市場、或其他公共場所出、入口或消防栓之前停車。","在設有禁止停車標誌、標線之處所停車。","在顯有妨礙其他人、車通行處所停車。","不依順行方向，或不緊靠道路右側，或併排停車，或單行道不緊靠路邊停車。","停車時間、位置、方式、車種不依規定。","於身心障礙專用停車位違規停車。","還車時停放私人區域"]
        }
        this.selectPhotoTapped = this.selectPhotoTapped.bind(this);
        this.send_violation=this.send_violation.bind(this);
    }
    componentDidMount() {
      this.getStorage().done();
    }
    getStorage = async () => {
        try {
          const operator = await AsyncStorage.getItem('@FoOps:user_givenName');
          if (operator !== null) {
            this.setState({operator:operator});
          }
          const operator_id = await AsyncStorage.getItem('@FoOps:user_id');
          if (operator_id !== null) {
            this.setState({operator_id:operator_id});
          }
        } catch (error) {
          console.warn(error);
        }
    }
    pad(number){ return (number < 10 ? '0' : '') + number }
    dateFormat(date){
      var format_date = new Date(date);
      var create_date = this.pad(format_date.getMonth()+1)+'/'+this.pad(format_date.getDate())+' '+this.pad(format_date.getHours())+':'+this.pad(format_date.getMinutes());
      return create_date;
    }
    send_violation(){
        this.setState({show_loading:true});
        var msg = [];
        var photo_count = 0;
        if(this.state.avatarSource1 !=null){
            photo_count++;
        }
        if(this.state.avatarSource2 !=null){
            photo_count++;
        }
        if(this.state.avatarSource3 !=null){
            photo_count++;
        }
        if(this.state.avatarSource4 !=null){
            photo_count++;
        }
        if(photo_count < 2){
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

          this.setState({modal1:true,msg:msg});
        }else{
            var scooter = this.props.violation_option.scooter;
            var formData  = new FormData();
            formData.append("scooter_id", scooter.id);
            formData.append("plate", scooter.plate);
            formData.append("type", this.state.select_type);
            formData.append("subtype", this.state.select_subtype);
            formData.append("location", this.state.location);
            formData.append("photo1", this.state.avatarSource1);
            formData.append("photo2", this.state.avatarSource2);
            formData.append("photo3", this.state.avatarSource3);
            formData.append("photo4", this.state.avatarSource4);
            formData.append("operator", this.state.operator);
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
    selectPhotoTapped(index) {
      ImagePicker.showImagePicker(options, (response) => {

        if (response.didCancel) {
          console.log('User cancelled photo picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else {
          let source = 'data:image/jpeg;base64,' + response.data;
          switch(index){
            case 1:
              this.setState({ avatarSource1: source});
            break;
            case 2:
              this.setState({ avatarSource2: source});
            break;
            case 3:
              this.setState({ avatarSource3: source});
            break;
            case 4:
              this.setState({ avatarSource4: source});
            break;
          }
          
        }
      });
    }
    clearData(){
      this.setState({ 
        avatarSource1: null,
        avatarSource2: null,
        avatarSource3: null,
        avatarSource4: null,
        location:"",
        select_type:"",
        select_subtype:"",
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
    render() {
        const {violation_option} = this.props;
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
                  <View style={{  justifyContent: "flex-start", alignItems: "flex-end",marginRight:10 }}>
                     <Icon name='close' size={30}  onPress={() => {
                        violation_option.onClose('violation_modal');this.clearData();
                      }} />
                  </View>
                    <View style={{justifyContent:'center',alignItems:'center'}}><Text>📷 拍照/上傳 (請上傳2~4張)</Text></View>
                    <View style={{flexDirection:'row',justifyContent: "space-between",alignItems: "flex-start",marginTop:10}}>
                        <TouchableOpacity onPress={()=>this.selectPhotoTapped(1)}>
                          <View
                            style={[
                              styles.avatar,
                              styles.avatarContainer,
                            ]}
                          >
                            {this.state.avatarSource1 === null ? (
                              <Text style={{color:'#000',}}>+</Text>
                            ) : (
                              <Image style={styles.avatar} source={{uri: this.state.avatarSource1}} />
                            )}
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>this.selectPhotoTapped(2)}>
                          <View
                            style={[
                              styles.avatar,
                              styles.avatarContainer,
                            ]}
                          >
                            {this.state.avatarSource2 === null ? (
                              <Text style={{color:'#000'}}>+</Text>
                            ) : (
                              <Image style={styles.avatar} source={{uri:this.state.avatarSource2}} />
                            )}
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>this.selectPhotoTapped(3)}>
                          <View
                            style={[
                              styles.avatar,
                              styles.avatarContainer,
                            ]}
                          >
                            {this.state.avatarSource3 === null ? (
                              <Text style={{color:'#000'}}>+</Text>
                            ) : (
                              <Image style={styles.avatar} source={{uri: this.state.avatarSource3}} />
                            )}
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>this.selectPhotoTapped(4)}>
                          <View
                            style={[
                              styles.avatar,
                              styles.avatarContainer
                            ]}
                          >
                            {this.state.avatarSource4 === null ? (
                              <Text style={{color:'#000'}}>+</Text>
                            ) : (
                              <Image style={styles.avatar} source={{uri: this.state.avatarSource4}} />
                            )}
                          </View>
                        </TouchableOpacity>
                      </View>
                    <View style={{padding:30}}>
                      <View style={{justifyContent:'center',alignItems:'center',marginTop:20}}><Text>📌 地點</Text></View>
                      <TextInput
                        editable = {true}
                        multiline = {true}
                        numberOfLines = {4}
                        onChangeText={(location) => this.setState({location})}
                        value={this.state.location}
                        placeholder="請描述發生地點"
                        style={{height: 80, borderColor: '#ccc', borderWidth: 1,}}
                      />
                    </View>
                    <View style={{justifyContent:'center',alignItems:'center',marginTop:20}}><Text>⚠️ 請選擇違規項目</Text></View>
                    <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                      <Picker
                        selectedValue={this.state.select_type}
                        style={{height: 20, width: 150}}
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
                          style={{height: 20, width: 200}}
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


