import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SharedProvider } from './ShareContext';
// import { NumberProvider } from './NumberContext';
import HomePage from './HomePage'; // 引用新的 HomePage 組件
import OrderPage from './OrderPage';
import AuthScreen from './AuthScreen';
// 引用其他需要導航到的頁面

const Stack = createStackNavigator();

export default function App() {
  return (
    // <NumberProvider>
    <SharedProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Home" component={HomePage} />
          <Stack.Screen name="Orders" component={OrderPage} />
          {/* 配置其他頁面 */}
        </Stack.Navigator>
      </NavigationContainer>
    </SharedProvider>
    // {/* </NumberProvider> */}
  );
}