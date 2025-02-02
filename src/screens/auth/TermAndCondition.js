//***** import libraries */
import React from 'react';
import {Text, View} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {Container, Content} from 'native-base';
import I18n from '../../I18n';
import NavBar from '../../components/NavBar';
import Loader from '../../components/Loader';
import {globalImagePath} from '../../constants/globalImagePath';
import {WebView} from 'react-native-webview';
import AutoHeightWebView from '../../components/autoheight_webview/autoHeightWebView';
import {postService} from '../../services/postServices';
export default function TermAndCondition({navigation}) {
  const [loading, setLoading] = React.useState(false);
  const [termCondition, setTermCondition] = React.useState('');
  React.useEffect(() => {
    getTermCondition();
  }, []);

  const getTermCondition = () => {
    setLoading(true);
    const data = {
      slug: 'term-and-condition',
    };
    console.log('data =>', data);
    // //***** api calling */
    postService('cms', data)
      .then(async (res) => {
        setLoading(false);

        if (res.data.response.status == 1) {
          try {
            setTermCondition(
              I18n.currentLocale() == 'en'
                ? res.data.response.content_en
                : res.data.response.content_ar,
            );
            // console.log("res privacy policy==>", res.data.response.content_ar);
          } catch (e) {
            showDangerToast(e);
            setLoading(false);
          }
        } else if (res.data.response.status == 2) {
          //setAboutData('Content Not Available');
          setLoading(false);
          setTimeout(function () {
            showDangerToast(res.data.message);
          }, 100);
        } else {
          setLoading(false);
          setTimeout(function () {
            showDangerToast(res.data.message);
          }, 100);
        }
      })
      .catch((error) => {
        setLoading(false);
        setTimeout(function () {
          alert(error);
        }, 100);
      });
  };

  //***** For rendering UI */
  return (
    <Container>
      <Loader loading={loading} />
      <NavBar
        textColor={'black'}
        isLeftIconUrl={false}
        leftIcon={globalImagePath.back_icon}
        navigator={navigation}
        backgroundColor={'#ffffff'}
        title={I18n.t('lbl_terms_and_conditions')}
        isCenterImage={false}
        centerText={I18n.t('lbl_terms_and_conditions')}
        navigation="HomePage"
        titleTop={''}
      />

      <Content
        style={{}}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="always"
        enableResetScrollToCoords={false}
        //enableOnAndroid={true}
      >
        <View style={styles.container}>
          <AutoHeightWebView
            startInLoadingState={true}
            customStyle={`p {font-size: ${18}px;}`}
            style={{
              width: -10,
              marginTop: 16,
            }}
            // or uri
            source={{
              html: `<p>${termCondition}</p>`,
            }}
            zoomable={false}
          />
        </View>
      </Content>
    </Container>
  );
}

//***** Define style */
const styles = {
  container: {
    paddingHorizontal: 20,
  },
};
