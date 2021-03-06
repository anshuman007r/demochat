import React, { Component } from 'react'
import { Container, Content, Icon } from 'native-base';
import { View, Text, Image, TouchableOpacity, Dimensions, KeyboardAvoidingView, TextInput, Alert, Platform, Linking, FlatList } from 'react-native';
import Logo from '../../assets/images/demo.png'
import styles from '../../style';
import { connect } from 'react-redux'
import { loggedOut } from '../../storage/action'
import firestore from '@react-native-firebase/firestore'
import logout from '../../assets/Icon/Logout.png'
import  RBSheet from 'react-native-raw-bottom-sheet'
import moment from 'moment'
import base64 from 'base-64'


class HomePage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            roomName :'',
            disableCTA :true,
            threads:[]
        }
    }

    callLogout = () =>{
        this.props.loggedOut()
        this.props.navigation.navigate('LoginPage')
    }

    addChatRoom = () => {
        let {roomName} = this.state
        this.RBSheet.close()
        this.setState({
            roomName :'',
            disableCTA :true
        })
        firestore().collection('USE_FIRESTORE').add({
            name: base64.encode(roomName),
            latestMessage: {
              text: base64.encode(`${roomName} created. Welcome!`),
              createdAt: new Date().getTime()
            }
          })
          .then((res) => {
            //   Alert.alert(res,'New Room is created')
          })
    }

    targetEmailText = enteredValue => {
        if (enteredValue && enteredValue.length > 0) {
            //valid Email hence Call the API.
            this.setState({
                roomName: enteredValue,
                disableCTA :false
            });
        } else {
            this.setState({
                roomName: enteredValue,
                disableCTA :true
            });
        }
    };

    onFocusTxt = () => {
        this.setState({ isFocusOnTextbox: true, errorTextinput: false });
    };

    offFocusTxt = enteredRoomName => {
        if (enteredRoomName.length >0){
            this.setState({ errorTextinput: false,disableCTA :false, isFocusOnTextbox: false });
        } else if (!enteredRoomName || enteredRoomName.length == 0) {
            this.setState({ errorTextinput: false,disableCTA : true, isFocusOnTextbox: false });
        } else {
            this.setState({ errorTextinput: true,disableCTA :true,isFocusOnTextbox: false });
        }
    };

    componentDidMount(){
        const getRooms = firestore().collection('USE_FIRESTORE')
        .orderBy('latestMessage.createdAt', 'desc')
        .onSnapshot(querySnapshot => {
            console.log(querySnapshot)
         if(querySnapshot != null){
            const threads = querySnapshot.docs.map(documentSnapshot => {
                return {
                  _id: documentSnapshot.id,
                  name: '',
                  latestMessage: { text: '' },
                  ...documentSnapshot.data()
                }
              })
              if(threads && threads.length > 0){
                  threads.map((item)=>{
                      item.name = base64.decode(item.name)
                      if(item.latestMessage && item.latestMessage.text){
                          item.latestMessage.text = base64.decode(item.latestMessage.text)
                      }
                  })
              }
              this.setState({
                  threads
              })
         }
        })
        console.log('room',getRooms)
    }

    navigateToChat = (item) => {
        this.props.navigation.navigate('ChatRoom',{ chatData : item })
    }

    _renderChatRoom = (rowItem) => {
        const {item, index}  = rowItem;
        let date = moment(item.latestMessage.createdAt).format('YYYY-MM-DD')
        let time = moment(item.latestMessage.createdAt).format('hh:mm:ss')
        console.log(item)
        return (
            <TouchableOpacity  onPress={()=>this.navigateToChat(item)} style={{backgroundColor:'#d4d4d4', height :100, width :'90%', alignSelf:'center',borderColor:'grey',borderWidth:1,borderRadius:10,paddingHorizontal :20, marginTop:10}} key={index}>
                <Text style={{ color: '#000', fontFamily: 'WorkSans-SemiBold',fontSize: 22, alignSelf: 'flex-start', marginTop: 10 }} numberOfLines ={1} ellipsizeMode={'tail'}>{item.name}</Text>
                <View style={{flexDirection:'row',marginTop:3}}>
                    <Text style={{ alignSelf:'flex-start', color:'grey', fontSize:14,flex :1.2}} numberOfLines={2}>{item.latestMessage.text}</Text>
                </View>
                <Text style={{ alignSelf:'flex-end', color:'grey', fontSize:12,marginTop:10}}>{date}<Text> {time}</Text></Text>

            </TouchableOpacity>
        )
    }


    render() {
        return (
            <Container>
                    <View style ={{backgroundColor :'#c3c3c3', height :50,alignItems :'center', flexDirection:'row'}}>
                        <View style ={{flex : 1}}>
                            <TouchableOpacity onPress={()=>this.RBSheet.open()} style ={{alignSelf:'center', backgroundColor:'#000', height :30, width : 80,justifyContent:'center',borderRadius :4, borderWidth : 1, borderColor :'grey'}}>
                                <Text style ={{color :'#fff', alignSelf:'center'}}>+Add room</Text>
                            </TouchableOpacity>
                        </View>
                        <View style ={styles.homepage_header}>
                            <Text style={styles.homepage_text}>Home page</Text>
                        </View>
                        <View style ={{flex : 0.8}}>
                            <TouchableOpacity onPress={()=>this.callLogout()} style ={{alignSelf:'center'}}>
                                <Image source={logout} style={{ height : 30, width:30}}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Content ref={c => this._content = c}>
                        <View style={styles.homepage_wrapper}>
                        <   View style={styles.signup_imageView}>
                                <Image source={Logo} style={styles.signup_image_path} />
                            </View>
                        </View>
                        <FlatList
                            data={this.state.threads}
                            horizontal={false}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={this._renderChatRoom}
                            style={{marginBottom:20}}
                        />
                    </Content>
                    <RBSheet
                        ref={ref => {
                            this.RBSheet = ref;
                        }}
                        closeOnDragDown={true}
                        closeOnPressMask={false}
                        height={180}
                        openDuration={250}
                        customStyles={{
                          container: {
                            alignItems: "center"
                          }
                        }}
                    >
                        <View style={{width:'90%', marginHorizontal :20}}>
                            <Text style={styles.userName_div}>
                                Enter room name
                             </Text>
                            <TouchableOpacity style={styles.userNameDiv_section}>
                                <KeyboardAvoidingView
                                    width={"100%"}
                                    behavior="padding"
                                    enabled
                                    style={styles.userName_login}
                                >
                                    <TextInput
                                        selectionColor={"#4d5054"}
                                        defaultValue={this.state.roomName}
                                        onFocus={() => this.onFocusTxt()}
                                        onBlur={() => this.offFocusTxt(this.state.roomName)}
                                        maxLength={256}
                                        placeholder="Room name"
                                        autoCapitalize="none"
                                        placeholderTextColor="grey"
                                        editable={true}
                                        onChangeText={roomName =>
                                            this.targetEmailText(roomName)
                                        }
                                        style={[styles.userName_inbox,
                                        {
                                            borderColor: this.state.isFocusOnTextbox
                                                ? "#800000"
                                                : "#4d5054"
                                        }
                                        ]}
                                    />
                                </KeyboardAvoidingView>
                            </TouchableOpacity>

                            {this.state.errorTextinput === true ? (
                                <View>
                                    <Text style={styles.invalid_email}>
                                        Invalid Chat room name
                                    </Text>
                                </View>
                            ) : (
                                    <View />
                            )}
                        </View>
                        <TouchableOpacity
                            disabled={this.state.disableCTA}
                            onPress={() => this.addChatRoom()}
                            style={[styles.button_disable,
                            {
                                backgroundColor: this.state.disableCTA
                                    ? "#babcbf"
                                    : "#000",
                                marginTop :20
                            }]
                            }
                        >
                            <Text style={[styles.continue_text, { color: this.state.disableCTA ? 'black' : 'white' }]}>Continue</Text>
                        </TouchableOpacity>

                    </RBSheet>

            </Container>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        loggedOut: () => dispatch(loggedOut()),
    };
};

export default connect(null, mapDispatchToProps)(HomePage)