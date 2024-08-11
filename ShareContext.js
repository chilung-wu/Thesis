// SharedContext.js
import React, { createContext, useState, useContext } from 'react';
import CryptoJS from "rn-crypto-js";
const SharedContext = createContext();

export const useShared = () => useContext(SharedContext);

export const SharedProvider = ({ children }) => {
    const [walletAddress, setWalletAddress] = useState('');
    const [clientContractAddress, setClientContractAddress] = useState('');
    // const [accountAddress, setAccountAddress] = useState('');
    const [credentials, setCredentials] = useState([]);
    const [error, setError] = useState('');
    const [tempMasterPassword, setTempMasterPassword] = useState('');
    
    const decryptData = (encryptedPassword, salt, masterPassword) => {
        // const fakeMasterPassword = 'bbbb';
        const key = CryptoJS.PBKDF2(masterPassword, salt, {
            keySize: 256 / 32,
            iterations: 1000
        }).toString();
        const decryptedDataBytes = CryptoJS.AES.decrypt(encryptedPassword, key);
        const decryptedPassword = decryptedDataBytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedPassword) {
            throw new Error("Decryption failed");
        }
        return decryptedPassword;
    };

    return (
        <SharedContext.Provider value={{ walletAddress, setWalletAddress, clientContractAddress, setClientContractAddress, credentials, setCredentials, error, setError, decryptData, tempMasterPassword, setTempMasterPassword }}>
        {children}
        </SharedContext.Provider>
    );
};

