import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight,Platform,Alert,CameraRoll } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import { Card, ListItem,Header,Input, Button,Image,SearchBar,ButtonGroup,CheckBox } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import '../global.js';

const severe_title = global.severe_title;
const scootet_status = global.scootet_status;

var t = 0;
export default class Violation extends React.Component {
    constructor () {
        super()
        this.state = {
            photos:[]

        }
    }
    componentWillMount() {
    }
    
    pad(number){ return (number < 10 ? '0' : '') + number }
    dateFormat(date){
      var format_date = new Date(date);
      var create_date = this.pad(format_date.getMonth()+1)+'/'+this.pad(format_date.getDate())+' '+this.pad(format_date.getHours())+':'+this.pad(format_date.getMinutes());
      return create_date;
    }
  
    _handleButtonPress = () => {
      CameraRoll.getPhotos({
         first: 20,
         assetType: 'Photos',
       })
       .then(r => {
         this.setState({ photos: r.edges });
       })
       .catch((err) => {
          //Error Loading Images
       });
     };
    render() {
        const {violation_option} = this.props;
        console.warn(this)
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
                        violation_option.onClose('violation_modal');
                      }} />
                  </View>
                  <Button title="Load Images" onPress={this._handleButtonPress} />
                  <ScrollView>
                     {this.state.photos.map((p, i) => {
                     return (
                       <Image
                         key={i}
                         style={{
                           width: 300,
                           height: 100,
                         }}
                         source={{ uri: p.node.image.uri }}
                       />
                     );
                   })}
                   </ScrollView>
                  
                    <Button
                      title="送出"
                      titleStyle={styles.view_titleStyle}
                      onPress={() => {
                        violation_option.updateCondition(violation_option.scooter.id);
                      }}
                    />
                </SafeAreaView>
            </Modal>
       
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
  }
});


