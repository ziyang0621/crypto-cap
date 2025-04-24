/**
 * 这个文件为Web版本提供特定的适配实现
 */

import { Platform } from 'react-native';

// 确保victory组件在Web上正确运行所需的适配
export const setupVictoryForWeb = () => {
  if (Platform.OS === 'web') {
    // 添加全局CSS样式以改善Web上的显示
    const style = document.createElement('style');
    style.textContent = `
      body {
        margin: 0;
        padding: 0;
        background-color: #031622;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      
      * {
        box-sizing: border-box;
      }
      
      /* 优化滚动行为 */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
        background-color: #031622;
      }
      
      ::-webkit-scrollbar-thumb {
        background-color: #1a3752;
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-track {
        background-color: transparent;
      }
    `;
    document.head.appendChild(style);
  }
};

export default {
  setupVictoryForWeb,
};
