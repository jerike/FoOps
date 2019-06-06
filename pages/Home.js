import React, { Component } from 'react';
import { Text, View,ScrollView,SafeAreaView,StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Card, ListItem,Header, Button, Icon,Image } from 'react-native-elements'

class LogoTitle extends React.Component {
  render() {
    return (
      <Image
        source={require('../img/gokube-logo.png')}
      />
    );
  }
}
const users = [
 {
    name: 'brynn',
    icon: 'av-timer',
    subtitle:'xxxs'
 },
 
]
export default class Home extends React.Component {
    componentWillMount() {
        var API = this.props.navigation.state.params.API;
        this.setState({ API: API });

    }
    render() {
        
        // AsyncStorage.getItem("@FoOps:user_id").then((obj) => {
        //    console.warn(obj)
        // })
        //  .catch((error) => {
        //    console.warn(error)
        // });

        return (
        <View style={{flex: 1, backgroundColor: '#ccc'}}>
            <Header
              leftComponent={{ icon: 'menu', color: '#fff' }}
              centerComponent={{ text: '列表', style: { color: '#fff' } }}
              rightComponent={{ icon: 'search', color: '#fff' }}
            />

            <ScrollView style={{flexDirection:'column' }}>
                 <View>
                  {
                    users.map((u, i) => {
                      return (
                        <ListItem
                          key={i}
                          title={u.name}  
                          subtitle={u.subtitle}    
                        leftIcon={{ name: u.icon }}
                        />
                      );
                    })
                  }
                </View>
            </ScrollView>
        </View>
         
        );
    }
}
