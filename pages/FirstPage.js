// Home screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View,Button } from 'react-native';
//import all the components we are going to use.
 
export default class FirstPage extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Home Screen</Text>
        <Button
            title="xx"
            onPress={()=>this.props.navigation.navigate('SecondPage')}
        />
      </View>
    );
  }
}