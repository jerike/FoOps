import { StyleSheet } from 'react-native';


export default StyleSheet.create({
    search_container: {
        backgroundColor:'#ff5722',
        borderWidth:0,
        borderBottomColor: 'transparent',
        borderTopColor: 'transparent'
    },
    search_input: {
        width:'100%',
        marginTop:-10,
        backgroundColor:'#fff',
        borderWidth: 0,
        height:15
    },
    input:{
        fontSize:12,
        borderWidth: 0,
    },
    cardContainerStyle:{
        width:'98%',
        margin:3,
        borderWidth:1,
        borderColor:'#ccc',
        shadowColor: '#333',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.5,
        shadowRadius: 2,
    },
    containerStyle:{
        margin:0,
        padding:0,

    },
    btn_containerStyle: {
        height: 40,
        width: '100%',
        // borderTopRightRadius: 20,
        borderWidth: 0,
        backgroundColor: '#fff',
        marginTop: 0,
        borderRadius: 0,
        paddingLeft:0,
        marginLeft:0,
        marginBottom:0,
        borderBottomWidth:1,
        borderBottomColor:'rgba(224, 224, 224,0.5)',
        shadowColor: '#ccc',
        shadowOffset: { width: 2, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    btn_buttonStyle: {
        backgroundColor: '#fff',

        borderWidth: 0,
    },
    btn_selectedButtonStyle: {
        backgroundColor: '#fff'
    },
    btn2_containerStyle:{
        height: 20,
        width: '90%',
        // borderTopRightRadius: 20,
        borderWidth: 0,
        backgroundColor: '#ff5722',
        marginTop: 0,
        borderRadius: 20,
        marginTop:5
    },
    btn2_buttonStyle: {
        backgroundColor: '#ff5722',
        borderWidth: 0
    },
    btn2_selectedButtonStyle:{
        backgroundColor: '#fff',
    },
    btn2_textStyle:{
        fontSize:12,
        color:'#ffffff',
    },
    btn2_selectedTextStyle:{
        fontSize:12,
        color:'#ff5722',
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
    header:{
        backgroundColor: '#ff5722',
        justifyContent: 'space-around',
        paddingTop:-25,
        height:50
    },

    circle:{
       
        marginRight:10,
        alignItems:'center',
        justifyContent:'center',
        width: 50,
        height:50,
        backgroundColor:'#f76260',
        borderColor:'green',
        borderStyle:'solid',
        borderRadius:25,
        paddingBottom:2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,  
    },
});