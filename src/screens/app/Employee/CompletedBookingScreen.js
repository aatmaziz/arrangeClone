import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {height, width} from '../../../constants/screenSize';
import {fonts, colors} from '../../../Theme';
// import { styles } from './styles';
import {globalImagePath} from '../../../constants/globalImagePath';
import font from '../../../Theme/font';
import NavBar from '../../../components/NavBar';
import I18n from '../../../I18n';
import {postService} from '../../../services/postServices';
import Loader from '../../../components/Loader';
import moment from 'moment';
import {showToast, showDangerToast} from '../../../components//ToastMessage';
import {useIsFocused} from '@react-navigation/native';

var pageNo = 1;
export default function CompletedBookingScreen({navigation, currentTabNum}) {
  let onEndReachedCalledDuringMomentum = true;
  const isFocused = useIsFocused();
  const [loading, setLoading] = React.useState(false);
  const [completedBooking, setCompletedBooking] = React.useState([]);
  const [getProfileUrl, setProfileUrl] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [showLoadMore, setShowLoadMore] = React.useState(false);
  // const [pageNo, setPageNo] = React.useState(1);
  const [changeTab, setChangeTab] = React.useState('');

  React.useEffect(() => {
    if (isFocused) {
      pageNo = 1;
      setLoading(true);
      getCompletedBooking();
    }
  }, [currentTabNum, isFocused]);

  //***** For getting New Request Api*/
  const getCompletedBooking = () => {
    const data = {
      status: 3,
      page: pageNo,
    };

    //***** api calling */
    postService('employee/get-bookings', data)
      .then((res) => {
        setLoading(false);
        console.log('Completed', res.data.response);
        if (res.data.status === 1) {
          //  console.log("salon-appointment/new", res.data.response);
          setLoading(false);
          setRefreshing(false);
          setShowLoadMore(false);

          let data = res.data.response;
          if (data != '') {
            if (!res.data.response) {
              showToast(res.data.message);
            }
            if (pageNo == 1) {
              setCompletedBooking([...data]);
            } else {
              data && data
                ? setCompletedBooking([...completedBooking, ...data])
                : setCompletedBooking([...completedBooking]);
            }
          }
        } else {
          setLoading(false);
          setRefreshing(false);
          setShowLoadMore(false);
          setTimeout(function () {
            //showDangerToast(res.data.message);
          }, 100);
        }
      })
      .catch((error) => {
        setLoading(false);
        setRefreshing(false);
        setShowLoadMore(false);
        setTimeout(function () {
          showDangerToast(error);
        }, 100);
      });
  };

  const animationShow = async (key, val) => {
    let data = [...completedBooking];
    data[key].animate = val;
    setCompletedBooking(await data);
  };

  // Render _renderCompleted
  const _renderCompleted = (item, index) => {
    return (
      <TouchableOpacity
        style={styles.renderOuterView}
        onPress={() => {
          navigation.navigate('RequestDetails', {
            bookingId: item._id,
          });
        }}>
        <View
          style={{
            flex: 1,
            backgroundColor: '#fff',
            borderRadius: 10,
            paddingVertical: 12,
            paddingLeft: 12,
          }}>
          <View style={{flexDirection: 'row', flex: 1}}>
            <View style={{justifyContent: 'center'}}>
              <Image
                source={
                  item.user_id &&
                  item.userData &&
                  item.userData.full_profile_path
                    ? {uri: item.userData.full_profile_path}
                    : globalImagePath.user_dummy
                }
                style={styles.image}
                resizeMode={'cover'}
                onLoadStart={() => animationShow(index, true)}
                onLoad={() => animationShow(index, false)}
              />
              {item.animate ? (
                <ActivityIndicator
                  style={{position: 'absolute', marginLeft: width * (15 / 375)}}
                  size="small"
                  color={'rgb(196,170,153)'}
                  animating={item.animate}
                />
              ) : null}
            </View>
            <View style={{flex: 1, marginLeft: 20}}>
              <View style={{flex: 1}}>
                <View style={{flexDirection: 'row'}}>
                  <Text
                    style={{
                      flex: 1,
                      color: 'rgb(150,136,125)',
                      fontSize: 12,
                      fontFamily: fonts.type.NunitoSans_bold,
                    }}>
                    {'#' + item.booking_number}
                  </Text>
                  <Text
                    style={{
                      marginRight: 20,
                      color: 'rgb(150,136,125)',
                      fontSize: 12,
                      fontFamily: fonts.type.NunitoSans_bold,
                    }}>
                    {item.start_date
                      ? moment(item.start_date).format('YYYY-MM-DD')
                      : ''}
                  </Text>
                </View>
                <View style={{marginRight: 20}}>
                  <Text
                    style={{
                      marginTop: 5,
                      fontSize: 16,
                      fontFamily: font.type.NunitoSans_bold,
                    }}>
                    {item.user_id && item.userData.first_name
                      ? item.userData.first_name + ' ' + item.userData.last_name
                      : ''}
                  </Text>
                  <Text
                    style={{
                      marginTop: 7,
                      color: colors.themeColor,
                      fontSize: 14,
                      fontFamily: fonts.type.NunitoSans_Regular,
                    }}>
                    {'SAR ' + item.total_price}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const _renderFooter = () => {
    if (!refreshing) return null;
    if (!showLoadMore) return null;

    return (
      <View
        style={{
          padding: 10,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={{
            padding: 10,
            borderRadius: 4,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              fontFamily: fonts.type.NunitoSans_Regular,
              textAlign: 'center',
            }}>
            {I18n.t('lbl_load_more')}
          </Text>
          {true ? (
            <ActivityIndicator color="rgb(74,74,74)" style={{marginLeft: 8}} />
          ) : null}
        </TouchableOpacity>
      </View>
    );
  };

  const _renderEmptyComponent = (type) => {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
        }}>
        <Text
          style={{
            alignItems: 'center',
            marginTop: 100,
            fontSize: 22,
            fontWeight: 'bold',
            fontFamily: fonts.type.NunitoSans_Regular,
          }}>
          {I18n.t('lbl_completed_booking_not_found')}
        </Text>
      </View>
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    pageNo = 1;
    getCompletedBooking();
  };

  const onReached = () => {
    setRefreshing(true);
    setShowLoadMore(true);
    pageNo = parseInt(pageNo) + 1;
    getCompletedBooking();
  };

  if (loading) {
    return (
      <View>
        <Loader loading={loading} />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
      }}>
      <Loader loading={loading} />
      <View
        style={{
          flex: 1,
          marginHorizontal: width * (20 / 375),
          marginTop: width * (10 / 375),
        }}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={completedBooking}
          renderItem={({item, index}) => _renderCompleted(item, index)}
          keyExtractor={(item, index) => String(index)}
          onRefresh={() => onRefresh()}
          refreshing={refreshing}
          onEndReached={({distanceFromEnd}) => {
            if (!onEndReachedCalledDuringMomentum) {
              onReached();
              onEndReachedCalledDuringMomentum = true;
            }
          }}
          onEndReachedThreshold={0.005}
          onMomentumScrollBegin={() => {
            onEndReachedCalledDuringMomentum = false;
          }}
          ListFooterComponent={() => _renderFooter()}
          ListEmptyComponent={() => _renderEmptyComponent()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  renderOuterView: {
    flexDirection: 'row',

    marginBottom: width * (10 / 375),
    padding: 2,
    borderRadius: 15,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    //  marginRight: 10,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 2,
  },
  image: {
    // borderWidth: 5,
    height: width * (55 / 375),
    width: width * (55 / 375),
    borderRadius: 10,
  },
  addimage: {
    // borderWidth: 5,
    height: width * (11 / 375),
    width: width * (11 / 375),
    borderRadius: 10,
  },

  btnText: {
    fontFamily: fonts.type.NunitoSans_SemiBold,
    fontSize: width * (12 / 375),
    color: colors.themeColor,
  },
  btnText2: {
    fontFamily: fonts.type.NunitoSans_SemiBold,
    fontSize: width * (12 / 375),
    color: colors.whiteColor,
  },
  editOuter: {
    borderRadius: 5,
    backgroundColor: colors.themeColor,
    paddingHorizontal: width * (30 / 375),
    paddingVertical: width * (8 / 375),
    justifyContent: 'center',
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: colors.themeColor,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: colors.whiteColor,
    paddingHorizontal: width * (30 / 375),
    paddingVertical: width * (8 / 375),
    justifyContent: 'center',
  },
});
