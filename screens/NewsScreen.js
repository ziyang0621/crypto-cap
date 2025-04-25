import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import BottomNavBar from '../components/BottomNavBar';

const NewsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>News</Text>
      <Text style={styles.text}>Latest crypto news will appear here</Text>

      {/* Bottom Navigation Bar */}
      <BottomNavBar navigation={navigation} activeScreen="News" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111827',
  },
  text: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
  },
});

export default NewsScreen;
