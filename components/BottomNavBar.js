import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Icon } from 'react-native-elements';
import Theme from '../tools/Theme';

const BottomNavBar = ({ navigation, activeScreen, themeColors }) => {
  const [colors, setColors] = useState(themeColors || Theme.colors);

  useEffect(() => {
    if (themeColors) {
      setColors(themeColors);
    } else {
      // 如果未通过props传递颜色，则使用Theme直接监听变化
      const unsubscribe = Theme.addThemeListener((newColors) => {
        setColors(newColors);
      });

      return () => unsubscribe();
    }
  }, [themeColors]);

  const screens = [
    { name: 'Home', icon: 'home' },
    { name: 'Search', icon: 'search', label: 'Search' },
    { name: 'Watchlist', icon: 'star' },
    { name: 'News', icon: 'newspaper-o' },
    { name: 'Profile', icon: 'user' },
  ];

  return (
    <View style={styles(colors).navigationBar}>
      {screens.map((screen) => (
        <TouchableOpacity
          key={screen.name}
          style={styles(colors).navItem}
          onPress={() => navigation.navigate(screen.name)}
        >
          <Icon
            name={screen.icon}
            type="font-awesome"
            size={22}
            color={
              activeScreen === screen.name ? colors.primary : colors.textLight
            }
          />
          <Text
            style={[
              styles(colors).navText,
              activeScreen === screen.name
                ? styles(colors).activeNavText
                : null,
            ]}
          >
            {screen.label || screen.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = (colors) =>
  StyleSheet.create({
    navigationBar: {
      flexDirection: 'row',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.tabBarBackground,
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
      paddingVertical: 10,
      justifyContent: 'space-around',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    navItem: {
      alignItems: 'center',
    },
    navText: {
      fontSize: 10,
      marginTop: 4,
      color: colors.textLight,
    },
    activeNavText: {
      color: colors.primary,
    },
  });

export default BottomNavBar;
