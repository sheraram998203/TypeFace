import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  FONTS,
  SIZES,
  COLORS,
  SPACING,
  globalStyles,
} from '../../utils/globalStyles';

// UI COMPONENTS
import moment from 'moment';
import {Header} from '@rneui/themed';
import {HelpButton} from '../../components/theme';
import {Button, Icon, Image, ListItem} from '@rneui/base';
import HelpAndInformation from '../../components/HelpAndInformation';

// STATE & STATE
import {
  getProfile,
  selectQuiz,
  fetchQuizList,
  getQuizUserAttempts,
} from '../../store/actions';
import {useSelector, useDispatch} from 'react-redux';

// ANALYTICS & SERVICES
import Config from 'react-native-config';
import {notificationListener, setToken} from '../../utils/PushNotification';
import suprsend from '@suprsend/react-native-sdk';
import messaging from '@react-native-firebase/messaging';
import {identifyUser, trackEventSuprsend} from '../../utils/analytics/SuprSend';
import {logEventFacebook, setUserPropertiesFacebook} from '../../utils/analytics/Facebook';
import {setUserPropertiesAmplitude, trackEventAmplitude} from '../../utils/analytics/Amplitude';
import {ANALYTICAL_EVENTS} from '../../utils/analytics/Events';
import Log from '../../helpers/Log';


const bannerIMG = require('../../assets/images/bannerImg.png');

function HomeScreen({navigation}) {
  const dispatch = useDispatch();

  const {todaysQuiz, attemptedQuizList, missedQuizList, currentQuiz} =
    useSelector(state => state.AppReducer);
  const Profile = useSelector(state => state.Profile);
const {user, getLoading}=Profile
  
  const [timeLeft, setTimeLeft] = useState('');
  const [timeLeftInMms, setTimeLeftInMms] = useState();

  useEffect(() => {
    if (user?._id) {
      identifyUser(user?._id);
      logEventFacebook(ANALYTICAL_EVENTS.VIEWED_HOME, {});
      trackEventAmplitude(ANALYTICAL_EVENTS.VIEWED_HOME, {});
      trackEventSuprsend(ANALYTICAL_EVENTS.VIEWED_HOME, {});
      setToken();
      notificationListener();
    }

    // for foreground
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, [user?._id]);

  const getTimeInNextQuiz = () => {
    const now = moment();
    const timeDiff = moment(now).utcOffset('+05:30').endOf('day') - now;
    const dur = moment.duration(timeDiff);
    setTimeLeft(`${dur.hours()} hrs ${dur.minutes()} min ${dur.seconds()}`)
    const duration = moment.duration(timeDiff).asMilliseconds();
    setTimeLeftInMms(duration);
  };

  useEffect(() => {
    getTimeInNextQuiz();
  }, []);

  useEffect(() => {
    if (timeLeftInMms > 0) {
      const timerId = setTimeout(() => {
        const ds = moment.duration(timeLeftInMms);
        const ss =
          Math.floor(ds.asHours()) + moment.utc(timeLeftInMms).format(':mm:ss');
        setTimeLeft(ss.toString());

        setTimeLeftInMms(timeLeftInMms - 1000);
      }, 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeftInMms]);

  useEffect(() => {
    dispatch(
      getProfile({
        data: {userId: user?._id},
        callback: user => {
          const avatars = [
            Config.a1,
            Config.a2,
            Config.a3,
            Config.a4,
            Config.a5,
            Config.a6,
          ];
          const userData = {
            full_name: user?.full_name,
            username: user?.username,
            phoneNumber: user?.phone.toString(),
            profilePicture: !user?.avatar
              ? 'None'
              : avatars.find(element => element === user?.avatar)
              ? 'Avatar'
              : 'Picture',
          };
          // addUserChannel(userProfile?.email, userProfile?.phone.toString())
          setUserPropertiesFacebook(userData);
          setUserPropertiesAmplitude(userData);
          // identifyUser(data?.user?._id)
          fetchDailyQuiz();
        },
      }),
    );
  }, []);

  const fetchDailyQuiz = () => {
    const nextDayDate = moment().add(1, 'day').format('YYYY-MM-DD'); // next day
    const twoWeeksBeforeDate = moment()
      .subtract(14, 'days')
      .format('YYYY-MM-DD');
    dispatch(
      fetchQuizList({
        data: {
          startDate: twoWeeksBeforeDate,
          endDate: nextDayDate,
        },
        callback: cb => {
          const quizIds = cb.map(quiz => quiz._id);
          const temp = JSON.stringify(quizIds);
          dispatch(
            getQuizUserAttempts({
              data: {quizIds: temp, quizArray: cb},
              callback: cb1 => {},
            }),
          );
        },
      }),
    );
  };

  const RowView = ({text, onClose, onButtonPress}) => {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={onClose} style={styles.closeContainer}>
          <Icon name="close" type="material" size={24} />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text allowFontScaling={false} style={styles.text}>
            Complete account Details
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            allowFontScaling={false}
            title="GO!"
            titleStyle={{
              color: COLORS.text,
              fontFamily: FONTS.medium,
            }}
            buttonStyle={{
              backgroundColor: COLORS.white,
              borderWidth: 1,
              borderColor: COLORS.black,
              paddingHorizontal: SPACING.lg,
              borderRadius: 4,
            }}
            onPress={onButtonPress}
          />
        </View>
      </View>
    );
  };

  return (
    <View
      style={[globalStyles.containerWhite, {justifyContent: 'space-between'}]}>
      <View>
        {HeaderComponent()}
        <ScrollView>
          {attemptedQuizList.length !== 0 || missedQuizList.length !== 0 ? (
            <>
              {bannerComponent(navigation, todaysQuiz, dispatch)}
              <View>
                <Text allowFontScaling={false} style={styles.timerText}>
                  Next Quiz In :
                  <Text allowFontScaling={false} style={{color: COLORS.black}}>
                    {' '}
                    {timeLeft}
                  </Text>
                </Text>
              </View>
              <ListItem
                containerStyle={styles.listItem}
                Component={TouchableOpacity}
                onPress={() => navigation.navigate('pastQuiz')}>
                <ListItem.Content>
                  <ListItem.Title style={styles.listTitle}>
                    View Past Quizzes and Scores
                  </ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron size={SPACING.xl} color={COLORS.white} />
              </ListItem>
            </>
          ) : (
            <ActivityIndicator size={'large'} color={COLORS.primary} />
          )}
        </ScrollView>
      </View>
      {!getLoading && user === null ? <RowView /> : null}
    </View>
  );
}

function bannerComponent(navigation, todaysQuiz, dispatch) {
  function handleQuizNavFunc() {
    if (todaysQuiz == null || todaysQuiz === undefined) {
      return null;
    } else if (todaysQuiz?.attempted == true) {
      navigation.navigate('quizAttempted');
      dispatch(selectQuiz(todaysQuiz));
    } else {
      navigation.navigate('quizIntro');
      dispatch(selectQuiz(todaysQuiz));
    }
  }

  return (
    <View
      style={{
        width: '95%',
        height: 170,
        backgroundColor: '#5447B6',
        borderRadius: SPACING.s10,
        padding: SPACING.lg,
      }}>
      <Text
        allowFontScaling={false}
        style={{
          color: COLORS.white,
          fontSize: SPACING.lg,
          fontWeight: '700',
          fontFamily: FONTS.bold,
        }}>
        Daily Quiz
      </Text>
      <Text
        allowFontScaling={false}
        style={{
          color: COLORS.white,
          fontSize: SPACING.md,
          fontWeight: '500',
        }}>
        Train your mind daily!
      </Text>

      <Button
        allowFontScaling={false}
        title={todaysQuiz?.attempted ? 'Attempted' : 'Start'}
        titleStyle={{
          fontSize: SPACING.md,
          color: COLORS.black,
        }}
        containerStyle={{
          width: 125,
          borderRadius: SPACING.sm / 2,
          marginTop: SPACING.lg,
        }}
        buttonStyle={{
          backgroundColor: COLORS.white,
          borderRadius: SPACING.sm / 2,
        }}
        iconRight
        icon={{
          name: 'play-circle-fill',
          type: 'material',
          color: COLORS.black,
        }}
        onPress={handleQuizNavFunc}
      />

      <Image
        source={bannerIMG}
        containerStyle={{
          position: 'absolute',
          top: SPACING.s10,
          right: -SPACING.xl,
          width: SIZES.SCREEN_WIDTH / 2.5,
        }}
        style={{
          width: SIZES.SCREEN_WIDTH / 2.5,
          height: SIZES.SCREEN_HEIGHT / 4.8,
          resizeMode: 'contain',
        }}
      />
    </View>
  );
}

function HeaderComponent() {
  const [modalVisible, setModalVisible] = useState(false);

  function helpPress() {
    setModalVisible(true);
  }

  return (
    <>
      <Header
        containerStyle={{
          backgroundColor: COLORS.white,
          marginVertical: SPACING.lg,
          paddingHorizontal: 2,
        }}
        leftComponent={
          <Image
            source={require('../../assets/images/q-logo.png')}
            style={{
              width: 97,
              height: 24,
              resizeMode: 'contain',
            }}
          />
        }
        rightComponent={<HelpButton onPress={helpPress} />}
      />
      <HelpAndInformation
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
    </>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  timerText: {
    marginVertical: SPACING.s10,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textGrey,
  },

  listItem: {
    backgroundColor: COLORS.secondary,
    borderRadius: SPACING.sm,
    marginTop: SPACING.s10,
  },

  listTitle: {
    fontSize: 18,
    width: 200,
    fontWeight: '700',
    color: COLORS.white,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },

  closeContainer: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  buttonContainer: {
    marginLeft: 10,
  },
});
