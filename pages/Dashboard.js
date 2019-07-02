import React, { Component } from 'react';
import { TextInput, View,StyleSheet,TouchableOpacity,Alert,ScrollView,Animated,Easing,ActivityIndicator,Dimensions,SafeAreaView } from 'react-native';
import { Text,Card, ListItem,Header, Button,Image,SearchBar,ButtonGroup,Avatar } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import '../global.js';
import shallowCompare from 'react-addons-shallow-compare';
import styles from '../styles/home.style';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from 'react-native-chart-kit'
export default class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = { show_loading:true,scooter:[] };
        this.setStorage=this.setStorage.bind(this);
    }
    componentWillMount() {
        this.getStorage().done();
    }
    componentDidMount() {
        this.get_scooter();
        this.get_scooter_status();
    }
    pad(number){ return (number < 10 ? '0' : '') + number }
    dateFormat(date){
      var format_date = new Date(date);
      var create_date = this.pad(format_date.getMonth()+1)+'/'+this.pad(format_date.getDate())+' '+this.pad(format_date.getHours())+':'+this.pad(format_date.getMinutes());
      return create_date;
    }
    //取得電動車資訊
    get_scooter(){
        var theTime = new Date();
        var reload_time = this.pad(theTime.getMonth()+1)+'/'+this.pad(theTime.getDate())+' '+this.pad(theTime.getHours())+':'+this.pad(theTime.getMinutes())+':'+this.pad(theTime.getSeconds());
        this.setState({reload_time:reload_time});

        if (global.scooters == undefined) {
            this.fetch_scooters();
        }else{
            this.setState({scooter:global.scooters,show_loading:false});
        }
    }
    fetch_scooters(){
        var result = []
        fetch(global.API+'/scooter',{
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
            global.scooters = json.data;
            global.scooter = json.data;
            this.setState({scooter:json.data,show_loading:false},()=>{this.setStorage()});
                       
        });
    }
    getStorage = async () => {
      try {
        const value = await AsyncStorage.getItem('@FoOps:scooters');
        if (value !== null) {
          global.scooters = JSON.parse(value);
        }
      } catch (error) {
        console.warn(error);
      }
    }
    setStorage = async () => {
        try {
          await AsyncStorage.setItem('@FoOps:scooters', JSON.stringify(this.state.scooter));
        } catch (error) {
          console.warn(error);
        }
    }
    //取得車況
    get_scooter_status =()=>{
        fetch(global.API+'/scooter/status',{
          method: 'GET'
        })
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          if(json.code == 1){
            global.condition = JSON.stringify(json.data);
            this.setState({ condition:json.data });
          }else{
            alert(json.reason);
          }
        });
    }
    render() {

        const scooter_status = [];
        var sstatus=[];
        var scooter_severe=[];
        var labels = ['尚未服務','使用中','暫停服務'];
        var severe_labels = ['優先處理','次要處理','待處理','正常'];
        var severe_color=['#d63246','#f26c42','#f8bb27','#8cb162'];
        var scooter_color = ['#c2c0c2','#8cb162','#d63246'];

        // 顯示服務狀態
        this.state.scooter.map(function(m,i){
            switch(m.status){
                case "FREE":
                    sstatus[0] = (sstatus[0] == undefined) ? 1 : sstatus[0] + 1;
                break;
                case "RIDING":
                   sstatus[1] = (sstatus[1] == undefined) ? 1 : sstatus[1] + 1;
                break;
                case "MAINTENANCE":
                   sstatus[2] = (sstatus[2] == undefined) ? 1 : sstatus[2] + 1;
                break;
            }
            scooter_severe[(m.severe-1)] = (scooter_severe[m.severe-1] == undefined) ? 1 : scooter_severe[m.severe-1] + 1;
        });

        for (var i = 0; i < sstatus.length; i++) {
            if(sstatus[i] == undefined){
                scooter_status.push({ name: labels[i], population: 0, color: scooter_color[i], legendFontColor: '#7F7F7F', legendFontSize: 15 });
            }else{
                scooter_status.push({ name: labels[i], population: sstatus[i], color: scooter_color[i], legendFontColor: '#7F7F7F', legendFontSize: 15 });
            }
        }
        var show_ss = false;
        if(sstatus[0] != undefined){
            show_ss= true;
        }

        var chartConfig = {
            backgroundColor: '#1cc910',
            backgroundGradientFrom: '#eff3ff',
            backgroundGradientTo: '#efefef',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
        };

        return (
            <SafeAreaView style={{flex: 1,justifyContent: 'center',alignItems: 'center'}}>
                {this.state.show_loading &&(
                  <View style={styles.loading}>
                    <ActivityIndicator size="large" color="#ffffff" style={{marginBottom:5}} />
                    <Text style={{color:'#fff'}}>Loading...</Text>
                  </View>
                )}
                <Header
                  leftComponent={<Avatar rounded source={{uri:'https://gokube.com/images/logo.png'}} overlayContainerStyle={{backgroundColor:'transparent'}} />}
                  centerComponent={<Text color={'#ffffff'}>Dashboard</Text>}
                  rightComponent={<Icon name="hand-point-right" size={20} color='#fff' onPress={()=>{this.props.navigation.navigate('Home');}}/>}
                  containerStyle={styles.header}
                />
                <ScrollView style={{flexDirection:'column',width:'100%' }}>
                {show_ss &&(
                    <View style={{justifyContent:'center',alignItems:'center',marginTop:20}}>
                      <Text>
                        車輛服務狀態
                      </Text>
                        <PieChart
                          data={scooter_status}
                          width={Dimensions.get('window').width - 16}
                          height={220}
                          chartConfig={chartConfig}
                          accessor="population"
                          backgroundColor="transparent"
                          absolute
                        />
                    </View>
                )}
                <View style={{
                    flexDirection:'row',
                    justifyContent:'space-around',
                    alignItems:'center',
                    paddingRight:20,

                  }}>
                  {
                    scooter_severe.map((l, i) => (
                        <Card key={"ss_card_"+i} title={severe_labels[i]} titleStyle={{fontSize:13,color:`${severe_color[i]}`}}>
                            <View key={"ss_card_view_"+i} style={{justifyContent:'center'}}>
                              <Text style={{fontSize:11}}>{l}</Text>
                            </View>
                        </Card>
                    ))
                  }
                </View>

                </ScrollView>
            </SafeAreaView>
        );
    }
}
