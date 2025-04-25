import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Icon, Avatar } from 'react-native-elements';
import BottomNavBar from '../components/BottomNavBar';

const ProfileScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Avatar
          source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
          size="xlarge"
          rounded
          containerStyle={styles.avatar}
        />
        <Text style={styles.header}>Alex Johnson</Text>
        <Text style={styles.text}>Crypto Enthusiast</Text>
      </View>

      {/* Bottom Navigation Bar */}
      <BottomNavBar navigation={navigation} activeScreen="Profile" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
  },
  text: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
  },
});

export default ProfileScreen;
