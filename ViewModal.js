import {View, Text, Modal, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {COLORS, SIZES, SPACING} from '../../utils/globalStyles';
import {ScrollView} from 'react-native-gesture-handler';
import {PrizeRules} from '.';
import Log from '../../helpers/Log';

export default function ViewDetailsModal({
  modalVisible,
  setModalVisible,
  quiz,
}) {

  return (
    <Modal
      animationType="dissolve"
      transparent={true}
      visible={modalVisible}
      statusBarTranslucent={true}
      onRequestClose={() => setModalVisible(false)}>
      <TouchableOpacity
        style={styles.modalBackground}
        activeOpacity={1}
        onPressOut={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}>
            <AntDesign name="close" size={28} color={COLORS.black} />
          </TouchableOpacity>
          <ScrollView>
            <Text
              allowFontScaling={false}
              style={{...styles.font18, marginTop: 50}}>
              Prize Scheme
            </Text>
            <View style={styles.contactContainer}>
              <View
                // style={styles.container}
                contentContainerStyle={{paddingBottom: 100}}
                showsVerticalScrollIndicator={false}>
                <View style={styles.subContainer}>
                  {quiz?.prizesText?.map((item, index) => {
                    const myArray = item.split(':');
                    return (
                      <Text key={index} style={styles.prizeText}>
                        &#8226; {myArray[0]} {' - '}
                        <Text style={{fontWeight: '700', color: COLORS.BLUE}}>
                          {myArray[1]}
                        </Text>
                      </Text>
                    );
                  })}
                </View>
                <Text
                  allowFontScaling={false}
                  style={{...styles.font18, marginVertical: 16}}>
                  Rules
                </Text>
                <PrizeRules />
              </View>
            </View>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  subContainer: {
    padding: SPACING.s10,
    // marginBottom: 20,
  },
  font18: {
    // marginTop: 50,
    fontSize: SPACING.s20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginLeft: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    paddingHorizontal: SIZES.large,
    borderRadius: 10,
    width: 350,
    maxHeight: '75%',
  },
  contactContainer: {
    marginVertical: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  prizeText: {
    color: 'black',
    marginBottom: 4,
    lineHeight: 20,
    fontWeight: '500',
    fontSize: SPACING.s14,
  },
});
