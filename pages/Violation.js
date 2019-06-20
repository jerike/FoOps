import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,Alert,PixelRatio,TouchableOpacity } from 'react-native';
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
                  
                    <View style={{flexDirection:'row',justifyContent: "space-between",alignItems: "flex-start",marginTop:20}}>
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
                    <ScrollView>

                    </ScrollView>

                    <Button
                      title="送出"
                      titleStyle={styles.view_titleStyle}
                    />
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


