import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet,Modal,TouchableHighlight } from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { Card, ListItem,Header, Button, Icon,Image,SearchBar,ButtonGroup } from 'react-native-elements'


export default class Filter extends React.Component {

    render() {
        const {filter_option} = this.props;
        return (
            <Modal
              animationType="slide"
              transparent={false}
              visible={filter_option.modalVisible}
              presentationStyle="fullScreen"
              >
              <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
                  <View style={{  justifyContent: "flex-start", alignItems: "flex-end" }}>
                     <Icon name='close'  onPress={() => {
                        filter_option.setModalVisible(!filter_option.modalVisible);
                      }} />
                  </View>
                  <ScrollView style={{flexDirection:'column' }}>
                  {
                    filter_option.condition.map((l, i) => (
                    <ListItem
                      key={i}
                      title={l.description}
                      
                    />
                    ))
                  }                    
                  </ScrollView>
                </SafeAreaView>
            </Modal>
        );
    }
}