import { Appearance } from 'react-native';

// 获取当前设备的颜色模式（深色或浅色）
const getColorScheme = () => {
  return Appearance.getColorScheme() || 'light';
};

// 基于设备模式的动态颜色
const generateDynamicColors = (colorScheme) => {
  const isDark = colorScheme === 'dark';

  return {
    // 背景颜色
    backgroundColor: isDark ? '#121212' : '#f9fafb',
    cardBackground: isDark ? '#1e1e1e' : '#ffffff',

    // 文本颜色
    textPrimary: isDark ? '#ffffff' : '#111827',
    textSecondary: isDark ? '#b0b0b0' : '#4b5563',
    textLight: isDark ? '#6b6b6b' : '#9ca3af',

    // 强调色和状态颜色（保持一致以确保足够的对比度）
    primary: '#1e40af',
    primaryLight: '#3b82f6',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',

    // UI元素颜色
    borderColor: isDark ? '#2e2e2e' : '#e5e7eb',
    inputBackground: isDark ? '#2e2e2e' : '#f1f5f9',
    chartFill: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
    chartStroke: '#3b82f6',

    // 导航栏颜色
    headerBackground: isDark ? '#1e1e1e' : '#ffffff',
    tabBarBackground: isDark
      ? 'rgba(30, 30, 30, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',

    // 状态栏样式
    statusBarStyle: isDark ? 'light-content' : 'dark-content',

    // 导航标题颜色
    headerTintColor: isDark ? '#ffffff' : '#111827',
  };
};

// 初始化主题
const colors = generateDynamicColors(getColorScheme());

// 监听器回调集合
const listeners = new Set();

// 当主题变化时通知所有监听器
const notifyListeners = () => {
  const newColors = generateDynamicColors(getColorScheme());
  Object.assign(colors, newColors);
  listeners.forEach((listener) => listener(colors));
};

// 当设备的颜色方案变化时更新主题
Appearance.addChangeListener(({ colorScheme }) => {
  notifyListeners();
});

// 主题API
const Theme = {
  colors,

  // 添加主题变化监听器
  addThemeListener: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  // 获取当前主题颜色
  getColors: () => colors,

  // 获取当前模式
  getColorScheme,
};

export default Theme;
