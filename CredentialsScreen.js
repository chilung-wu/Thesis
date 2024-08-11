import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, FlatList, Text } from 'react-native';

export default function CredentialsScreen() {
  const [credentials, setCredentials] = useState([]);
  const [website, setWebsite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const addCredential = () => {
    setCredentials([...credentials, { website, username, password, id: credentials.length.toString() }]);
    setWebsite('');
    setUsername('');
    setPassword('');
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Website URL" value={website} onChangeText={setWebsite} style={styles.input} />
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <Button title="Add Credential" onPress={addCredential} />
      <FlatList
        data={credentials}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.website}</Text>
            <Text>{item.username}</Text>
            <Text>{item.password}</Text>
          </View>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
  },
});
