import React from 'react';
import { View, Text, Image, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { globalImagePath } from '../../../../constants/globalImagePath';
import { Container, Content } from 'native-base';
import { NavigationActions } from '@react-navigation/compat';
import TextInput from '../../../../components/TextInput';
import Button from '../../../../components/Button';
import { CommonStyles } from '../../../../assets/css';
import validate from '../../../../components/Validations/validate_wrapper';
import AsyncStorage from '@react-native-community/async-storage';
import { postService } from '../../../../services/postServices';
import { getService } from '../../../../services/getServices';
import I18n from '../../../../I18n';
import { normalize } from '../../../../components/Dimensions';
import NavBar from '../../../../components/NavBar';
import RNPicker from '../../../../components/RNPicker';
import { countries } from '../../../../constants/countryCode';
import { CUSTOMERIMAGEURL } from '../../../../utils/constants';
import * as Animatable from 'react-native-animatable';
import ImagePicker from 'react-native-image-picker';
import ErrorMessage from '../../../../components/ErrorMessage';
import Loader from '../../../../components/Loader';
import {
  showToast,
  showDangerToast,
  showDangerToastLong,
} from '../../../../components/ToastMessage';
import {
  check,
  PERMISSIONS,
  openSettings,
  request,
} from 'react-native-permissions';

import { fonts, colors, metrics } from '../../../../Theme';
const height = metrics.screenHeight;
const width = metrics.screenWidth;
export default function EditProfileScreen({ navigation }) {
  const [userID, setUserID] = React.useState('');
  const [image, setImage] = React.useState('');
  const [imageError, setImageError] = React.useState('');
  const [langVal, setLangVal] = React.useState('+966');
  // const [selectCountry, setSelectCountry] = React.useState('Select country');
  const [countryError, setCountryError] = React.useState();
  const [isImageUpdate, setIsImageUpdate] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState('');
  const [name, setName] = React.useState('');
  const [nameError, setNameError] = React.useState('');
  const [surname, setSurname] = React.useState('');
  const [surnameError, setSurnameError] = React.useState('');
  const [getPhone, setPhoneNumber] = React.useState('');
  const [phoneError, setPhoneError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [profileLoad, setProfileLoad] = React.useState(false);
  const [salonProfile, setSalonProfile] = React.useState('');
  React.useEffect(() => {
    AsyncStorage.getItem('user', (err1, item1) => {
      var userDetail = JSON.parse(item1);
      setUserID(userDetail._id);
      setLoading(true);
      getUserProfileDetails();
    });
  }, []);

  //***** For getting user's profile information */
  const getUserProfileDetails = user_id => {
    const postData = {
      update_status: 0,
      user_id: user_id,
    };

    //***** api calling */ 
    getService('profile/detail')
      .then(res => {

        if (res.data.status === 1) {
          console.log("res.data =>", res.data);
          setLoading(false);
          let data = res.data.response;

          setName(data.first_name);
          setSurname(data.last_name)
          setPhoneNumber(data.phoneno);
          setEmail(data.email);
          setImage(data.profile);
          // setSelectCountry(data.country);
          setLangVal(data.country_code);
        } else {
          setLoading(false);
          var message = '';
          res.data.errors.map((val) => {
            message += Object.values(val) + ' '
          })
          setTimeout(function () {
            showDangerToast(message != null ? message : res.data.message);
          }, 100);
        }
      })
      .catch(error => {
        setLoading(false);
        setTimeout(function () {
          alert(error);
        }, 100);
      });
  };


  //***** Function for showing confirm alert for camera and photo permission */
  const confirmAlert = () => {
    Alert.alert(
      '"ArrangeApp" Would Like to Access Your Camera and Photos',
      'Need for upload photo',
      [
        {
          text: 'Not Allow',
          onPress: () => console.log('Permission denied'),
          style: 'cancel',
        },
        { text: 'Open Settings', onPress: () => openSettings() },
      ],
    );
  };

  const checkPhotoPermissions = () => {
    if (Platform.OS == 'ios') {
      Promise.all([
        check(PERMISSIONS.IOS.CAMERA),
        check(PERMISSIONS.IOS.PHOTO_LIBRARY),
      ]).then(([cameraStatus, photosStatus]) => {
        console.log({ cameraStatus, photosStatus });
        if (cameraStatus == 'blocked' || photosStatus == 'blocked') {
          confirmAlert();
        } else {
          pickImageHandler();
        }
      });
    } else if (Platform.OS == 'android') {
      Promise.all([
        check(PERMISSIONS.ANDROID.CAMERA),
        check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE),
      ]).then(([cameraStatus, photosStatus]) => {
        console.log({ cameraStatus, photosStatus });
        if (cameraStatus == 'blocked' || photosStatus == 'blocked') {
          confirmAlert();
        } else {
          pickImageHandler();
        }
      });
    }
  };

  // ***** Function for uploading images * /
  const pickImageHandler = () => {
    ImagePicker.showImagePicker(
      { title: I18n.t('lbl_pick_image'), maxWidth: 800, maxHeight: 600 },
      res => {
        if (res.didCancel) {
        } else if (res.error) {
        } else {
          setSalonProfile(res.uri)
          setImage(res.uri);
          setIsImageUpdate(true);
          setImageError(validate('image', res.uri));
        }
      },
    );
  };

  const changePass = () => {
    //***** For validate input fields */
    const nameError = validate("name", name);
    const surname_error = validate("surname", surname);
    const phoneError = validate('phone', getPhone);
    const email_error = validate('email', email);
    // const country = selectCountry == undefined ? 'Please Select Country' : ''
    setNameError(nameError);
    setSurnameError(surname_error);
    setPhoneError(phoneError);
    setEmailError(email_error);
    // setCountryError(country);

    if (
      nameError ||
      surname_error ||
      phoneError ||
      email_error
    ) {
    } else {
      setLoading(true);
      let body = new FormData();
      if (isImageUpdate) {

        body.append('profile', {
          uri: isImageUpdate ? image : CUSTOMERIMAGEURL + image,
          name: 'avatar.png',
          filename: 'avatar.png',
          type: 'image/png',
        });
      }
      body.append('first_name', name);
      body.append('last_name', surname);
      body.append('phoneno', getPhone);
      // body.append('country', selectCountry)
      body.append('user_id', userID);
      body.append('country_code', langVal)
      console.log("body =>", body);
      //  ***** api calling */
      postService('profile/update-profile', body)
        .then(res => {
          console.log('result = ' + JSON.stringify(res));

          if (res.data.status === 1) {
            setLoading(false);
            showToast(res.data.message);
          } else {
            setLoading(false);
            var message = '';
            res.data.errors.map((val) => {
              message += Object.values(val) + ' '
            })
            setTimeout(function () {
              showDangerToast(message != null ? message : res.data.message);
            }, 100);
          }
        })
        .catch(error => {
          setLoading(false);
          setTimeout(function () {
            alert(error);
          }, 100);
        });
    }
  };

  const onSelectLanguage = (lang, index) => {

    setSelectCountry(lang.name);
  }

  const phoneDigit = (val, index) => {

    setLangVal(val.dc)


  }

  const profileAnimationShow = async (val) => {
    setProfileLoad(val);
  };

  return (
    <Container>
      <Loader loading={loading} />
      <Content
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        //enableOnAndroid={true}
        enableResetScrollToCoords={false}
        automaticallyAdjustContentInsets={false}
        keyboardShouldPersistTaps="always"
      >
        <View
          style={{
            backgroundColor: colors.moreLight,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
          }}>
          <NavBar
            textColor={'black'}
            isLeftIconUrl={false}
            leftIcon={globalImagePath.back_icon}
            navigator={navigation}
            backgroundColor={colors.white}
            titleTop={''}
            // centerImg={''}
            //rightImage={globalImagePath.notification}
            navigation="HomePage"
            centerText={I18n.t('lbl_myAccount')}
          />

          <View style={{ paddingHorizontal: 30, alignItems: 'center' }}>

            <Animatable.View animation="slideInDown">
              <View style={{ paddingHorizontal: 60, alignItems: 'center', paddingVertical: 20 }}>
                <TouchableOpacity onPress={() => checkPhotoPermissions()}>
                  <Image
                    //  source={image ? { uri: image } : globalImagePath.user_dummy}
                    source={salonProfile ? { uri: salonProfile } : { uri: CUSTOMERIMAGEURL + image }}
                    style={{
                      width: normalize(100),
                      height: normalize(100),
                      borderRadius: normalize(50 / 2),
                      //marginTop: normalize(-50),
                    }}
                    onLoadStart={() => profileAnimationShow(true)}
                    onLoad={() => profileAnimationShow(false)}
                  />
                  {profileLoad ? (
                    <ActivityIndicator
                      style={{ position: 'absolute', marginLeft: width * (50 / 375), marginTop: width * (50 / 375), }}
                      size='small'
                      color={'rgb(196,170,153)'}
                      animating={profileLoad}
                    />
                  ) : null}
                </TouchableOpacity>
                <TouchableOpacity style={{}} onPress={() => checkPhotoPermissions()}>
                  <Image
                    source={globalImagePath.imageEdit}
                    style={{
                      marginTop: normalize(-15),
                    }}
                  />
                </TouchableOpacity>
              </View>
            </Animatable.View>
          </View>
        </View>

        <View style={styles.container}>
          <View style={{ width: '100%', marginTop: normalize(30) }}>

            <TextInput
              showIcon={false}
              isPlaceHolder={true}
              placeholder={I18n.t('lbl_enter_first_name')}
              isLevelShow={true}
              level={I18n.t('lbl_first_name')}
              error={nameError}
              onChangeText={name => { setName(name); setNameError(validate("name", name, "", true)); }}
              // onChangeText={name => this.setState({ name: name, nameError: validate("name", name, "", true) })}
              value={name}
            />
            <TextInput
              isPlaceHolder={true}
              placeholder={I18n.t('lbl_enter_last_name')}
              isLevelShow={true}
              level={I18n.t('lbl_last_name')}
              error={surnameError}
              onChangeText={surname => { setSurname(surname); setSurnameError(validate("surname", surname)); }}
              value={surname}
            />
            <TextInput
              isPlaceHolder={true}
              placeholder={I18n.t('lbl_enter_email')}
              isLevelShow={true}
              level={I18n.t('lbl_email')}
              editable={false}
              inputStyle={{
                fontFamily: 'NunitoSans-Regular',
                borderRadius: 5,
                marginTop: 4,
                height: 50,
                color: 'rgb(38, 38, 38)',
                fontSize: 14,
                flex: 1,
                backgroundColor: '#efefef'
              }}
              error={emailError}
              keyboardType={'email-address'}
              onChangeText={email => {
                setEmail(email);
                setEmailError(validate('email', email));
              }}
              value={email}
            />

            <TextInput
              langVal={langVal}
              onSelect={(val) => phoneDigit(val)}
              picker={true}
              isPlaceHolder={true}
              placeholder={I18n.t('lbl_enter_phone')}
              isLevelShow={true}
              level={I18n.t('lbl_phone_number')}
              error={phoneError}
              keyboardType={'phone-pad'}
              onChangeText={phone => { setPhoneNumber(phone); setPhoneError(validate('phone', phone,)); }}
              value={`${getPhone}`}
            />

            {/* <View style={{ marginTop: 10, marginBottom: 10, }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ ...CommonStyles.InputLabelStyle() }}>{'Country'}</Text>
              </View>
              <View style={{ flexDirection: 'row', borderColor: 'rgb(196,170,153)', borderBottomWidth: 0.5, }}>
                <RNPicker
                  ifCountry={true}
                  dataSource={countries}
                  dummyDataSource={countries}
                  defaultValue={selectCountry != "" ? true : false}
                  pickerTitle={'hello'}
                  showSearchBar={true}
                  searchBarPlaceHolder={'jjjjjj'}
                  disablePicker={countries.length > 0 ? false : true}
                  changeAnimation={"none"}
                  searchBarPlaceHolder={'Search for country'}
                  showPickerTitle={false}
                  selectedLabel={selectCountry}
                  placeHolderLabel={'adfas'}
                  placeholderColor={'#4782c5'}
                  selectedValue={(index, item) =>
                    onSelectLanguage(item, index)
                  }
                  selectedId={countries}
                  value={selectCountry}
                />
              </View>

              {countryError ? <ErrorMessage text={countryError} /> : null}
            </View> */}

            <View style={{ marginTop: 10, marginBottom: 20 }}>
              <Button
                label={I18n.t('lbl_submit')}
                textSize={16}
                onPress={() => {
                  changePass()
                }}
              />
            </View>

          </View>
        </View>
      </Content>

    </Container>
  );
}

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
};
