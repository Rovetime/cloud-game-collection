
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  getGames,
  addGame,
  updateGame,
  deleteGame,
} from '../services/gameRepository';

import { colors } from '../styles/theme';

export default function LibraryScreen() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [platform, setPlatform] = useState('');
  const [rating, setRating] = useState('');
  const [status, setStatus] = useState('Backlog');

  async function loadGames() {
    setLoading(true);
    setError('');

    try {
      const results = await getGames();
      setGames(results);
    } catch (err) {
      console.error('Firestore READ error:', err);
      setError(err.message || 'Unable to load games.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGames();
  }, []);

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setGenre('');
    setPlatform('');
    setRating('');
    setStatus('Backlog');
  }

  function handleEdit(game) {
    setEditingId(game.id);
    setTitle(game.title || '');
    setGenre(game.genre || '');
    setPlatform(game.platform || '');
    setRating(String(game.rating ?? ''));
    setStatus(game.status || 'Backlog');
    setError('');
    setMessage('');
  }

  async function handleSaveGame() {
    setError('');
    setMessage('');

    if (!title.trim() || !genre.trim() || !platform.trim()) {
      setError('Please enter a title, genre, and platform.');
      return;
    }

    const numericRating = Number(rating);

    if (
      !rating.trim() ||
      !Number.isFinite(numericRating) ||
      numericRating < 0 ||
      numericRating > 10
    ) {
      setError('Rating must be a number between 0 and 10.');
      return;
    }

    const gameData = {
      title: title.trim(),
      genre: genre.trim(),
      platform: platform.trim(),
      rating: numericRating,
      status,
    };

    setSaving(true);

    try {
      if (editingId) {
        await updateGame(editingId, gameData);
        setMessage('Game updated successfully!');
      } else {
        await addGame({
          ...gameData,
          favorite: false,
        });
        setMessage('Game added successfully!');
      }

      resetForm();
      await loadGames();
    } catch (err) {
      console.error('Firestore SAVE error:', err);
      setError(err.message || 'Unable to save game.');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete(game) {
    setError('');
    setMessage('');
    setSaving(true);

    try {
      await deleteGame(game.id);
      setDeleteTarget(null);

      if (editingId === game.id) {
        resetForm();
      }

      setMessage(`${game.title} deleted successfully!`);
      await loadGames();
    } catch (err) {
      console.error('Firestore DELETE error:', err);
      setError(err.message || 'Unable to delete game.');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(game) {
    if (saving) return;

    // On web, use an in-page confirmation dialog.
    // This also works reliably in GitHub Codespaces.
    setDeleteTarget(game);
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.eyebrow}>LIBRARY</Text>

      <Text style={styles.title}>
        Cloud Game Collection
      </Text>

      <Text style={styles.subtitle}>
        Manage games stored in Firebase Firestore
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {editingId ? 'Edit Game' : 'Add New Game'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Game title"
          placeholderTextColor={colors.muted}
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.input}
          placeholder="Genre"
          placeholderTextColor={colors.muted}
          value={genre}
          onChangeText={setGenre}
        />

        <TextInput
          style={styles.input}
          placeholder="Platform"
          placeholderTextColor={colors.muted}
          value={platform}
          onChangeText={setPlatform}
        />

        <TextInput
          style={styles.input}
          placeholder="Rating (0–10)"
          placeholderTextColor={colors.muted}
          keyboardType="numeric"
          value={rating}
          onChangeText={setRating}
        />

        <Text style={styles.fieldLabel}>Game Status</Text>

        <View style={styles.statusRow}>
          {['Backlog', 'Playing', 'Completed'].map((option) => (
            <Pressable
              key={option}
              onPress={() => setStatus(option)}
              style={[
                styles.statusButton,
                status === option && styles.statusSelected,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  status === option && styles.selectedText,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={[
              styles.button,
              saving && styles.disabled,
            ]}
            onPress={handleSaveGame}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Save Changes'
                  : 'Add Game'}
            </Text>
          </Pressable>

          {editingId && (
            <Pressable
              style={styles.cancelButton}
              onPress={resetForm}
              disabled={saving}
            >
              <Text style={styles.cancelText}>
                Cancel Editing
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {message ? (
        <Text style={styles.success}>{message}</Text>
      ) : null}

      {error ? (
        <Text style={styles.error}>Error: {error}</Text>
      ) : null}

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Your Games</Text>

        <Pressable
          onPress={loadGames}
          disabled={loading || saving}
        >
          <Text style={styles.refresh}>Refresh Games</Text>
        </Pressable>
      </View>

      {deleteTarget && (
        <View style={styles.confirmCard}>
          <Text style={styles.cardTitle}>Delete Game?</Text>
          <Text style={styles.cardText}>
            Are you sure you want to delete
            {' '}{deleteTarget.title}?
            This cannot be undone.
          </Text>

          <View style={styles.buttonRow}>
            <Pressable
              style={styles.deleteButton}
              disabled={saving}
              onPress={() => confirmDelete(deleteTarget)}
            >
              <Text style={styles.deleteText}>
                {saving ? 'Deleting...' : 'Yes, Delete'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              disabled={saving}
              onPress={() => setDeleteTarget(null)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.accent}
          style={styles.loading}
        />
      ) : games.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardText}>
            No games found. Add your first game above.
          </Text>
        </View>
      ) : (
        games.map((game) => (
          <View key={game.id} style={styles.card}>
            <Text style={styles.cardTitle}>
              {game.title}
            </Text>

            <Text style={styles.cardText}>
              Genre: {game.genre || 'Unknown'}
            </Text>

            <Text style={styles.cardText}>
              Platform: {game.platform || 'Unknown'}
            </Text>

            <Text style={styles.cardText}>
              Status: {game.status || 'Backlog'}
            </Text>

            <Text style={styles.cardText}>
              Rating: {game.rating ?? 'Not rated'}
            </Text>

            <View style={styles.buttonRow}>
              <Pressable
                style={styles.editButton}
                onPress={() => handleEdit(game)}
                disabled={saving}
              >
                <Text style={styles.editText}>
                  Edit Game
                </Text>
              </Pressable>

              <Pressable
                style={styles.deleteButton}
                onPress={() => handleDelete(game)}
                disabled={saving}
              >
                <Text style={styles.deleteText}>
                  Delete Game
                </Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 26,
    paddingTop: 40,
    paddingBottom: 60,
  },
  eyebrow: {
    color: colors.accent,
    fontWeight: '900',
    letterSpacing: 1.4,
    fontSize: 11,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '900',
    marginTop: 5,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    marginTop: 10,
  },
  card: {
    marginTop: 18,
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    maxWidth: 720,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 8,
  },
  cardText: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 7,
  },
  input: {
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 9,
    padding: 13,
    marginTop: 12,
    color: colors.text,
    fontSize: 15,
  },
  fieldLabel: {
    color: colors.text,
    fontWeight: '800',
    marginTop: 18,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  statusButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 11,
  },
  statusSelected: {
    backgroundColor: colors.accent,
  },
  statusText: {
    color: colors.muted,
    fontWeight: '700',
  },
  selectedText: {
    color: '#0A0E0B',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  button: {
    backgroundColor: colors.accent,
    padding: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: '#0A0E0B',
    fontWeight: '900',
  },
  disabled: {
    opacity: 0.5,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: 10,
  },
  cancelText: {
    color: colors.text,
    fontWeight: '800',
  },
  editButton: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 8,
  },
  editText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  deleteButton: {
    backgroundColor: '#B91C1C',
    padding: 12,
    borderRadius: 8,
  },
  deleteText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  confirmCard: {
    marginTop: 20,
    backgroundColor: colors.panel,
    borderColor: '#B91C1C',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    maxWidth: 720,
  },
  success: {
    color: '#4ADE80',
    marginTop: 18,
    fontWeight: '700',
  },
  error: {
    color: '#FF6B6B',
    marginTop: 18,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 720,
    marginTop: 28,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '900',
  },
  refresh: {
    color: colors.accent,
    fontWeight: '800',
  },
  loading: {
    marginTop: 30,
  },
});
