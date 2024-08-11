import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Button, StyleSheet, Alert } from 'react-native';
import { WagmiConfig, useAccount} from 'wagmi'
import { sepolia } from 'viem/chains'
import { createWeb3Modal, defaultWagmiConfig, Web3Modal, W3mButton} from '@web3modal/wagmi-react-native'
// import {PROJECT_ID} from "@env"
import axios from 'axios';
import { useShared } from './ShareContext';
import * as SecureStore from 'expo-secure-store';

// 1. Get projectId at https://cloud.walletconnect.com
const PROJECT_ID = '31e798cb45fd0b35c9cf5807b40d2093'
const projectId = PROJECT_ID

// 2. Create config
const metadata = {
  name: 'Web3Modal RN',
  description: 'Web3Modal RN Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'YOUR_APP_SCHEME://',
    universal: 'YOUR_APP_UNIVERSAL_LINK.com'
  }
}

const chains = [sepolia]

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal
createWeb3Modal({
  projectId,
  chains,
  wagmiConfig
})

const GetAccount = ({ onAddressUpdate }) => {
  const { address, isConnected } = useAccount();

  // This effect runs only when the `isConnected` status changes.
  // It updates the parent component's state with the new address or clears it if disconnected.
  useEffect(() => {
      if (isConnected && address) {
          onAddressUpdate(address);
      } else {
          onAddressUpdate('');
      }
  }, [address, isConnected]);
  // }, [address, isConnected, onAddressUpdate]);

  // Optionally, you can return the address or connection status if needed for UI display.
  return (
    <View>
      {isConnected ? <Text selectable={true}> {address}</Text> : <Text selectable={true}> Disconnected</Text>}
    </View>
  )
}

// const GetAccount = ({ onAddressUpdate }) => {
//     const { address, isConnecting, isDisconnected } = useAccount();
//     console.log('user account address: ', address)
//     useEffect(() => {
//       if (isDisconnected) {
//         onAddressUpdate('');
//       } else if (address) {
//         onAddressUpdate(address);
//       }
//     }, [address, isDisconnected, onAddressUpdate]);

//     return (
//       <View>
//         {/* {isConnecting ? <Text selectable={true}> Connecting</Text> : isDisconnected ? <Text selectable={true}> Disconnected</Text> : <Text selectable={true}> {address}</Text>}   */}
//       </View>
//     )
// }

const AuthScreen = ({ navigation }) => {
    const { walletAddress, setWalletAddress, setClientContractAddress }= useShared();
    const [personalId, setPersonalId] = useState('');
    // const [walletAddress, setWalletAddress] = useState('');

    // Check if client_contract_address exists in SecureStore on component mount
    useEffect(() => {
      const source = axios.CancelToken.source();
      
      const checkContractAddress = async () => {
        try {
          const storedContractAddress = await SecureStore.getItemAsync('client_contract_address');
          if (storedContractAddress) {
              setClientContractAddress(storedContractAddress);
              navigation.navigate('Home');
          }
        } catch (error) {
          if (axios.isCancel(error)) {
            console.log('Request canceled', error.message);
          } else {
            console.error(error);
            // 處理其他錯誤
          }
        }
      };
    
      checkContractAddress();
    
      return () => {
        source.cancel('Component unmounted, request is canceled');
      };
    }, []);

    const handleRegister = async () => {
        try {
            // const response = await axios.post('https://192.168.47.129:5001/register', {
            const response = await axios.post('http://140.113.207.47:6666/register', {
                personal_id: personalId,
                wallet_address: walletAddress,
            });
            Alert.alert('Registration Successful', `Contract Address: ${response.data.client_contract_address}`);
        } catch (error) {
            // Alert.alert('Registration Successful');
            Alert.alert('Registration Failed', error.response.data.error);
        }
    };

    const handleLogin = async () => {
        // navigation.navigate('Home');

        try {
            const response = await axios.post('https://192.168.47.129:5001/login', {
            // const response = await axios.post('http://140.113.207.47:6666/login', {
                personal_id: personalId,
                wallet_address: walletAddress,
            });
            setClientContractAddress(response.data.client_contract_address);
            await SecureStore.setItemAsync('client_contract_address', response.data.client_contract_address);
            navigation.navigate('Home');
        } catch (error) {
            Alert.alert('Login Failed', error.response.data.error);
        }
    };
    
    const handleClear = () => {
        setPersonalId('');
        setWalletAddress('');
    }

    const handleAddressUpdate = (newAddress) => {
        setWalletAddress(newAddress);
      };

    return (
        <View style={styles.container}>
            <WagmiConfig config={wagmiConfig}>
                <View style={styles.marginVertical}>
                    <W3mButton balance='show'/>
                    <GetAccount onAddressUpdate={handleAddressUpdate} />
                </View>
                <Web3Modal />
            </WagmiConfig>

            <TextInput
                style={styles.input}
                placeholder="Personal ID"
                value={personalId}
                onChangeText={setPersonalId}
            />
            <TextInput
                style={styles.input}
                placeholder="Wallet Address"
                value={walletAddress}
                onChangeText={setWalletAddress}
            />
            <View style={styles.buttonContainer}>
              <Button title="Register" onPress={handleRegister} />
            </View>
            <View style={styles.buttonContainer}>
              <Button title="Login" onPress={handleLogin} />
            </View>
            <View style={styles.clearButtonContainer}>
              <Button title="Clear" onPress={handleClear} />
            </View>
            {/* <Button title="Register" onPress={handleRegister} />
            <Text/>
            <Button title="Login" onPress={handleLogin} />
            <Text/><Text/>
            <Button title="Clear" onPress={handleClear} /> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,  // 1:1
        justifyContent: 'center',   // 垂直置中
        padding: 20,   // 內距
    },
    input: {
        height: 40,
        marginBottom: 20,  // 下外距
        borderWidth: 1, // 邊框粗細
        padding: 10,  // 內距
    },
    buttonContainer: {
      marginVertical: 8, // Adjust the vertical margin for spacing between buttons
    },
    clearButtonContainer: {
      marginVertical: 16, // Larger margin for the Clear button
    },
});

export default AuthScreen;
