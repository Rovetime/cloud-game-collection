import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { saveGameLocally, getLocalGames } from '../services/sqliteGames';

export default function SQLiteTest() {
  const [result, setResult] = useState('Not tested yet');

  async function test() {
    try {
      await saveGameLocally({
        id: 'test-1',
        title: 'SQLite Test Game',
        genre: 'Adventure',
        platform: 'PC',
        status: 'Playing',
        rating: 5,
      });

      const games = await getLocalGames();
      const found = games.some(game => game.id === 'test-1');

      setResult(found
        ? 'SUCCESS! SQLite saved and retrieved the game.'
        : 'FAILED: Game not found.');
    } catch (error) {
      setResult('ERROR: ' + error.message);
    }
  }

  return (
    <View style={{ flex: 1, padding: 30, backgroundColor: '#101827' }}>
      <Text style={{ color: 'white', fontSize: 24, marginBottom: 20 }}>
        SQLite Test
      </Text>
      <Button title="Test SQLite" onPress={test} />
      <Text style={{ color: 'white', marginTop: 20 }}>{result}</Text>
    </View>
  );
}
