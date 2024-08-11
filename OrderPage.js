// OrderPage.js
import React, { useState, useEffect } from 'react';
import { Modal, TextInput, TouchableOpacity, View, Text, FlatList, StyleSheet, ActivityIndicator, Button } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { useShared } from './ShareContext';
import * as pako from 'pako';
import * as base64 from 'base-64';


const OrderPage = ({route}) => {
    // const { DecryptedCredentials } = route.params;
    // console.log('DecryptedCredentials:', DecryptedCredentials);

    const {error, setError, decryptData, tempMasterPassword, setTempMasterPassword }= useShared();
    const [credentials, setCredentials] = useState([]); // 用於存儲加密後的憑證
    const [isDecryptAllVisible, setIsDecryptAllVisible] = useState(false);

    const [orders, setOrders] = useState([]); //
    const [loading, setLoading] = useState(false); // 用於追蹤資料是否正在載入的狀態

    const [searchQuery, setSearchQuery] = useState(''); // 用於追蹤搜索查詢的狀態

    // 使用 useEffect 鉤子，在元件掛載時取得訂單數據
    useEffect(() => {
        loadOrders();
    }, []); // 空數組表示這個 effect 只在元件掛載時運行一次

    useEffect(() => {
        loadCredentials();
        saveOrders();
    }   , [orders]); 

    const saveOrders = async () => {
        try {
            await SecureStore.setItemAsync('orders', JSON.stringify(orders));
        } catch (error) {
            console.error(error);
        }
    };

    const loadCredentials = async () => {
        const result = await SecureStore.getItemAsync('credentials');
        console.log(result);
        if (result) {
            setCredentials(JSON.parse(result));
        }
    };

    const loadOrders = async () => {
        try {
            const savedOrders = await SecureStore.getItemAsync('orders');
            console.log('savedOrders:', savedOrders);
            if (savedOrders) {
                setOrders(JSON.parse(savedOrders));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const clearOrders = async () => {
        await SecureStore.deleteItemAsync('orders');
        setOrders([]);
    };    

    const decryptAll = async () => {
        // 檢查主密碼是否已設置
        if (!tempMasterPassword) {
          setError("請先輸入主密碼。");
          return;
        }
      
        try {
          // 創建一個新數組來存儲解密後的憑證
          const decryptedCredentials = await Promise.all(credentials.map(async (cred) => {
            // 對每個憑證進行解密
            console.log('cred', cred);
            const decryptedPassword = await decryptData(cred.encryptedPassword, cred.salt, tempMasterPassword);
            console.log('decryptedPassword', decryptedPassword);
            // 返回一個包含網站、用戶名和解密後密碼的新對象
            const decryptedCredential = {
              website: cred.website,
              username: cred.username,
              decryptedPassword: decryptedPassword, // 使用解密後的密碼
              id: cred.id
            };
            console.log(decryptedCredential);
            return decryptedCredential;
          }));
      
          // 將解密後的憑證數組設置到狀態中
          // setDecryptedAllCredentials(decryptedCredentials);
          // console.log('decryptedAllCredentials', decryptedAllCredentials);
          setError('');
          return decryptedCredentials;
        } catch (error) {
          // 處理解密過程中可能發生的任何錯誤
          setError("解密過程中發生錯誤。請檢查主密碼。");
          console.error("Decrypt All Error:", error);
        }
    };
    
    const handleDecryptAndNavigate = async () => {
        const decryptedCredentials = await decryptAll();
        fetch_Orders(decryptedCredentials);
        setIsDecryptAllVisible(false);
        setTempMasterPassword('');
    };

    const fetch_Orders = async ( decryptedCredentials ) => {
        try {
            setLoading(true);
            const response = await axios.post('https://192.168.47.129:5001/fetch_orders', decryptedCredentials);
            // const response = await axios.post('http://140.113.207.47:6666/fetch_orders', decryptedCredentials);
            setOrders(response.data); // 將取得的訂單資料儲存到狀態中
            setLoading(false); // 設定載入狀態為 false，表示資料載入完成
            console.log('response.data:', response.data);
        } catch (error) {
            console.error(error);
            setLoading(false); // 如果發生錯誤，也設定載入狀態為 false
        }
    };

    // 一個渲染每個訂單的函數
    const renderOrderItem = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.titleText}>訂單編號: {item.訂單編號}</Text>
            <Text style={styles.itemText}>日期: {item.日期}</Text>
            <Text style={styles.itemText}>訂單狀態: {item.訂單狀態}</Text>
            <Text style={styles.itemText}>總價: {item.總價}</Text>
            <Text style={styles.itemText}>付款方式: {item.付款}</Text>
            {/* <Text style={[styles.itemText, {fontWeight: 'bold'}]}>配送狀態: {item.配送狀態}</Text> */}
            <Text selectable={true} style={styles.itemText}>產品名稱: {item.產品名稱}</Text>
            <Text selectable={true} style={[styles.itemText, {fontWeight: 'bold'}]}>物流資訊: {item.物流資訊}</Text>
        </View>
    );

    const handleSearchChange = (query) => {
        setSearchQuery(query);
    };

    // Filter orders based on the search query
    const filteredOrders = orders.filter(order => {
        // Convert both searchQuery and order properties to lowercase for case-insensitive comparison
        const query = searchQuery.toLowerCase();
        return order.產品名稱.toLowerCase().includes(query) || order.物流資訊.includes(query);
    });

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={[styles.button, styles.uploadButton]}
                    onPress={() => setIsDecryptAllVisible(true)}
                    >
                        <Text style={styles.buttonText}>更新訂單</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.button, styles.uploadButton]}
                    onPress={ clearOrders }
                >
                    <Text style={styles.buttonText}>清空訂單</Text>
                </TouchableOpacity>
            </View>
        <TextInput
            style={styles.searchInput}
            placeholder="Search by product name or order number..."
            value={searchQuery}
            onChangeText={handleSearchChange}
        />
        {loading ? (
            <ActivityIndicator size="large" /> // 如果資料正在加載，顯示加載指示器
        ) : (
            <FlatList
            // data={orders} // 將狀態中的訂單資料傳遞給 FlatList
            data={filteredOrders}
            renderItem={renderOrderItem} // 指定如何渲染每個訂單
            keyExtractor={item => item.訂單編號} // 指定每個訂單的唯一鍵值
            />
        )}
        <Modal 
        animationType="slide"
        transparent={true}
        visible={isDecryptAllVisible}
        onRequestClose={() => {
            setIsDecryptAllVisible(!isDecryptAllVisible);
            setTempMasterPassword('');
            setError('');
        }}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}> 
                    <TextInput
                    secureTextEntry
                    style={styles.modalText}
                    placeholder="請輸入主密碼"
                    onChangeText={text => setTempMasterPassword(text)}
                    value={tempMasterPassword}
                    />
                    <Button
                    title="顯示訂單清單"
                    onPress={handleDecryptAndNavigate} 
                    />
                    </View>
            </View>
        </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, // 使用 flex 版面填充整個螢幕
        marginTop: 20,
    },
    itemContainer: {
        backgroundColor: '#f9f9f9',
        padding: 20,
        marginVertic2al: 8,
        marginHorizontal: 16,
        borderRadius: 5,
        // 依需要新增其他樣式
    },
    itemText: {
        fontSize: 15,
        
    },
    titleText: {
        fontSize: 25,
        fontWeight: 'bold',
        // 依需要新增其他樣式
    },
    item: { // 項目樣式
        flexDirection: 'column', // 排列方向為垂直（列）
        justifyContent: 'space-between', // 子元素間距平均分佈
        padding: 10, // 內填 10
        marginVertical: 8, // 垂直外邊距 8
        backgroundColor: '#f9c2ff', // 背景色為淺紫色
    },
    uploadButton: { // 上傳按鈕樣式
        backgroundColor: '#2196F3', // 背景色藍色
        minWidth: 100, // 設定最小寬度
        maxWidth: 200, // 設定最大寬度
        alignSelf: 'center', // 自我對齊至中心
        padding: 5, // 內填充 5
        borderRadius: 5, // 邊框圓角 5
        marginTop: 10, // 上邊距 10
    },
    button: { // 按鈕樣式
        elevation: 2, // 陰影高度 2
    },
    buttonText: { // 按鈕文本樣式
        fontSize: 20, // 字體大小 15
        fontWeight: 'bold', // 字重粗體
        textAlign: 'center', // 文本居中對齊
        color: 'white', // 文本顏色白色
    },
    centeredView: { // 居中視圖樣式
        // flex: 1, // 彈性比例為 1
        justifyContent: 'center', // 內容居中對齊
        alignItems: 'center', // 項目居中對齊
        marginTop: 22, // 上邊距 22
    },
    modalView: { // 模態視窗樣式
        margin: 20, // 外邊距 20
        marginTop: 250, // 上邊距 220
        backgroundColor: 'white', // 背景色白色
        borderRadius: 20, // 邊框圓角 20
        padding: 35, // 內填充 35
        alignItems: 'center', // 項目居中對齊
        shadowColor: '#000', // 陰影顏色黑色
        shadowOffset: { // 陰影偏移
          width: 0, // 寬度 0
          height: 2, // 高度 2
        },
        shadowOpacity: 0.25, // 陰影透明度
        shadowRadius: 4, // 陰影半徑
        elevation: 5, // 陰影高度 5
    },
    modalText: { // 模態文本樣式
        fontSize : 20, // 字體大小 20
        marginBottom: 15, // 下邊距 15
        textAlign: 'center', // 文本居中對齊
        fontWeight: 'bold', // 字重粗體
    },
    buttonContainer: { // 按鈕容器樣式
        marginVertical: 5, // 垂直外邊距 5
        flexDirection: 'row', // 排列方向為水平（行）
        justifyContent: 'space-around', // 子元素間距平均分佈
        // alignItems: 'center', // 項目居中對齊
        // zIndex: 1 // 層疊順序 1
    },
    searchInput: {
        fontSize: 18,  // 字體大小 18
        padding: 10,    // 內填充 10
        margin: 10,    // 外邊距 10
        borderColor: 'gray', // 邊框顏色灰色
        borderWidth: 2, // 邊框寬度 1
        borderRadius: 5, // 邊框圓角 5
    },
});

export default OrderPage;