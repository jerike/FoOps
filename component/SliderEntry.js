import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { ParallaxImage } from 'react-native-snap-carousel';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/SliderEntry.style';

export default class SliderEntry extends Component {

    static propTypes = {
        data: PropTypes.object.isRequired,
        even: PropTypes.bool,
        parallax: PropTypes.bool,
        parallaxProps: PropTypes.object
    };

    get image () {
        const { data: { illustration }, parallax, parallaxProps, even } = this.props;

        return parallax ? (
            <ParallaxImage
              source={{ uri: illustration }}
              containerStyle={[styles.imageContainer, even ? styles.imageContainerEven : {}]}
              style={styles.image}
              parallaxFactor={0.35}
              showSpinner={true}
              spinnerColor={even ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.25)'}
              {...parallaxProps}
            />
        ) : (
            <Image
              source={{ uri: illustration }}
              style={styles.image}
            />
        );
    }

    render () {
        const { data: { title, stats_type,power_msg,scooter_status,range_days }, even ,sid,CloseCard} = this.props;

        const uppercaseTitle = title ? (
            <Text
              style={[styles.title, even ? styles.titleEven : {}]}
              numberOfLines={2}
            >
                 { title.toUpperCase() }
            </Text>
        ) : false;

        var status = scooter_status ? <Text style={{color:'#fff',fontSize:13,marginTop:10,marginBottom:10}}>{scooter_status}</Text> : ""

        return (
            <TouchableOpacity
              activeOpacity={1}
              style={styles.slideInnerContainer}
              onPress={() => {CloseCard(); this.props.navigation.navigate('ScooterDetail',{scooter:sid}); }}
              >
                <View style={{position:'absolute',top:-20,zIndex:1,left:'49%',opacity:1,width: 10,height: 10,borderStyle: 'solid',borderTopWidth:0,borderRightWidth:10,borderBottomWidth:20,borderLeftWidth:10,borderTopColor: 'transparent', borderRightColor: 'transparent',borderBottomColor:'#000000',borderLeftColor: 'transparent'}}></View>
                <View style={styles.shadow} />
                
                <View style={[styles.textContainer, even ? styles.textContainerEven : {}]}>
                    <View style={{flexDirection: 'row',justifyContent: 'center',alignItems: "center"}}>
                        <Icon name="motorcycle" color="#fff" size={20} style={{marginRight:10}}/>
                        { uppercaseTitle }
                    </View>
                     
                     
                    <Text  style={{fontSize:13,marginTop:10,marginBottom:10}} >
                        { stats_type }
                    </Text>
                    <Text style={{color:'#fff',fontSize:13,marginTop:10,marginBottom:10}}>{power_msg}</Text>
                    <Text>{status}</Text>
                    <Text style={{color:'#fff',fontSize:13,marginTop:10,marginBottom:10}}>【{range_days}】天未租用</Text>


                    
                </View>
            </TouchableOpacity>
        );
    }
}
