import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,Alert,PixelRatio,TouchableOpacity,TextInput,Picker } from 'react-native';
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
    CropW: 1000,    
    CropH: 1000,    
    isGif: false,              
    showCropCircle: false,     
    circleCropRadius: 1000/2, 
    showCropFrame: true,       
    showCropGrid: false,       
    quality: 70,               
    enableBase64: true,  


};
export default class Violation extends React.Component {
    constructor () {
        super()
        this.state = {
            photos:[],
            avatarSource1: null,
            avatarSource2: null,
            avatarSource3: null,
            avatarSource4: null,
            sel_maincate:"",
            sel_subcate:"",
            MainCate: ['請選擇','違規停車（巡查）','違規停車（檢舉）','雙載（巡查）','雙載（檢舉）','危險駕駛（巡查）','危險駕駛（檢舉）','營運範圍外還車','車輛損壞賠償'],
            SubCate:["禁止臨時停車處所停車。","彎道、陡坡、狹路、槽化線、交通島或道路修理地段停車。","在機場、車站、碼頭、學校、娛樂、展覽、競技、市場、或其他公共場所出、入口或消防栓之前停車。","在設有禁止停車標誌、標線之處所停車。","在顯有妨礙其他人、車通行處所停車。","不依順行方向，或不緊靠道路右側，或併排停車，或單行道不緊靠路邊停車。","停車時間、位置、方式、車種不依規定。","於身心障礙專用停車位違規停車。","還車時停放私人區域"]
        }
        this.selectPhotoTapped = this.selectPhotoTapped.bind(this);
    }
    componentWillMount() {
    }
    
    pad(number){ return (number < 10 ? '0' : '') + number }
    dateFormat(date){
      var format_date = new Date(date);
      var create_date = this.pad(format_date.getMonth()+1)+'/'+this.pad(format_date.getDate())+' '+this.pad(format_date.getHours())+':'+this.pad(format_date.getMinutes());
      return create_date;
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
          let source = { uri: 'data:image/jpeg;base64,' + response.data };
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
    clearPhoto(){
      this.setState({ 
        avatarSource1: null,
        avatarSource2: null,
        avatarSource3: null,
        avatarSource4: null
      });
    }
    PickerMain(itemIndex,itemValue){
        this.setState({sel_maincate: itemValue});
        if(itemIndex == 1 || itemIndex == 2){
          this.setState({showSubpick:true});
        }else{
          this.setState({showSubpick:false});
        }
    }
    PickerSub(itemValue){
        this.setState({sel_subcate: itemValue});
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
                  <View style={{  justifyContent: "flex-start", alignItems: "flex-end",marginRight:10 }}>
                     <Icon name='close' size={30}  onPress={() => {
                        violation_option.onClose('violation_modal');this.clearPhoto();
                      }} />
                  </View>
                    <View><Text>📷 拍照/上傳 (請上傳2~4張)</Text></View>
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
                              <Image style={styles.avatar} source={this.state.avatarSource1} />
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
                              <Image style={styles.avatar} source={this.state.avatarSource2} />
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
                              <Image style={styles.avatar} source={this.state.avatarSource3} />
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
                              <Image style={styles.avatar} source={this.state.avatarSource4} />
                            )}
                          </View>
                        </TouchableOpacity>
                      </View>
                    <View style={{padding:10}}>
                      <Text>📌 地點</Text>
                      <TextInput
                        editable = {true}
                        multiline = {true}
                        numberOfLines = {4}
                        onChangeText={(text) => this.setState({text})}
                        value={this.state.text}
                        placeholder="請描述發生地點"
                        style={{height: 80, borderColor: '#ccc', borderWidth: 1,}}
                      />
                    </View>
                    <View><Text>⚠️ 請選擇違規項目</Text></View>
                    <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                      <Picker
                        selectedValue={this.state.sel_maincate}
                        style={{height: 50, width: 150}}
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
                          selectedValue={this.state.sel_subcate}
                          style={{height: 50, width: 200}}
                          itemStyle={{fontSize:12,flexWrap: 'wrap'}}
                          onValueChange={(itemValue, itemIndex) =>
                            this.PickerSub(itemValue)
                          }>
                          {this.state.SubCate.map(function(m,i){
                            return <Picker.Item key={"s"+i} label={m} value={m}  />
                          })}
                        </Picker>
                      )}
                    </View>
                    <View style={{position:'absolute',width:'100%',bottom:0,left:0}}>
                    <Button
                      title="送出"
                      titleStyle={styles.view_titleStyle}
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
});


