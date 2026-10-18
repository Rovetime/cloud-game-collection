
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import Sidebar from '../components/Sidebar';
import { getGames } from '../services/gameRepository';
import { colors } from '../styles/theme';

const gameCovers = {
  deadByDaylight: require('../assets/images/games/dbd.png'),
  oblivion: require('../assets/images/games/oblivion.png'),
  pragmata: require('../assets/images/games/Pragmata_cover.png'),
  belmont: require('../assets/images/games/belmont.png'),
  finalFantasy: require('../assets/images/games/Final_Fantasy_XVI_cover_art.png'),
  clairObscur: require('../assets/images/games/clair.png'),
  residentEvil: require('../assets/images/games/requiem.png'),
  sonic: require('../assets/images/games/sonic.png'),
};

function getGameCover(title = '') {
  const name = title.toLowerCase().trim();

  if (name.includes('dead by daylight')) {
    return gameCovers.deadByDaylight;
  }

  if (name.includes('oblivion')) {
    return gameCovers.oblivion;
  }

  if (name.includes('pragmata')) {
    return gameCovers.pragmata;
  }

  if (name.includes('castlevania') || name.includes('belmont')) {
    return gameCovers.belmont;
  }

  if (name.includes('final fantasy')) {
    return gameCovers.finalFantasy;
  }

  if (name.includes('clair obscur')) {
    return gameCovers.clairObscur;
  }

  if (name.includes('resident evil') || name.includes('requiem')) {
    return gameCovers.residentEvil;
  }

  if (name.includes('sonic')) {
    return gameCovers.sonic;
  }

  return null;
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const router = useRouter();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('All');

  const loadGames = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const results = await getGames();
      setGames(results);
    } catch (err) {
      console.error('Home Firestore error:', err);
      setError(err.message || 'Unable to load games.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGames();
    }, [loadGames])
  );

  const genres = [
    'All',
    ...new Set(
      games
        .map((game) => game.genre)
        .filter(Boolean)
    ),
  ];

  const filteredGames = games.filter((game) => {
    const matchesGenre =
      genre === 'All' || game.genre === genre;

    const matchesSearch = (game.title || '')
      .toLowerCase()
      .includes(query.toLowerCase());

    return matchesGenre && matchesSearch;
  });

  return (
    <View style={styles.page}>
      {desktop && <Sidebar active="Home" />}

      <ScrollView
        style={styles.main}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search bar */}
        <View style={styles.topBar}>
          {!desktop && (
            <View style={styles.mobileBrand}>
              <Ionicons
                name="cloud"
                size={24}
                color={colors.accent}
              />
              <Text style={styles.mobileBrandText}>
                CLOUD ARC
              </Text>
            </View>
          )}

          <View style={styles.search}>
            <Ionicons
              name="search"
              size={18}
              color={colors.muted}
            />

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search games..."
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          </View>
        </View>

        {/* Hero section */}
        <View style={styles.hero}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroEyebrow}>
              CLOUD COLLECTION
            </Text>

            <Text style={styles.heroTitle}>
              Your library, one place.
            </Text>

            <Text style={styles.heroText}>
              Your personal video game collection,
              powered by Firebase Firestore.
              Browse your games, track progress,
              and manage your library.
            </Text>

            <Pressable
              style={styles.heroButton}
              onPress={() => router.push('/library')}
            >
              <Ionicons
                name="game-controller"
                size={17}
                color="#0A0E0B"
              />

              <Text style={styles.heroButtonText}>
                Manage Library
              </Text>
            </Pressable>
          </View>

          {desktop && (
            <View style={styles.heroTiles}>
              {games.slice(0, 3).map((game) => (
                <View
                  key={game.id}
                  style={styles.miniTile}
                >
                  <Text style={styles.miniTileTitle}>
                    {game.title}
                  </Text>

                  <Text style={styles.miniTileMeta}>
                    {game.genre || 'Unknown genre'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Collection heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            My Game Collection
          </Text>

          <Text style={styles.gameCount}>
            {games.length} games
          </Text>
        </View>

        {/* Genre filters */}
        <Text style={styles.genreHeading}>
          Browse by genre
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genreRow}
        >
          {genres.map((item) => {
            const active = item === genre;

            return (
              <Pressable
                key={item}
                onPress={() => setGenre(item)}
                style={[
                  styles.genreChip,
                  active && styles.genreChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.genreText,
                    active && styles.genreTextActive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Firebase game collection */}
        {loading ? (
          <View style={styles.centerMessage}>
            <ActivityIndicator
              size="large"
              color={colors.accent}
            />

            <Text style={styles.messageText}>
              Loading your Firebase games...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centerMessage}>
            <Text style={styles.errorText}>
              Error: {error}
            </Text>

            <Pressable
              style={styles.heroButton}
              onPress={loadGames}
            >
              <Text style={styles.heroButtonText}>
                Try Again
              </Text>
            </Pressable>
          </View>
        ) : filteredGames.length === 0 ? (
          <View style={styles.centerMessage}>
            <Text style={styles.messageText}>
              {games.length === 0
                ? 'No games yet. Add games in your Library.'
                : 'No games match your search or genre.'}
            </Text>
          </View>
        ) : (
          <View style={styles.gameGrid}>
            {filteredGames.map((game) => {
              const cover = getGameCover(game.title);

              return (
                <View
                  key={game.id}
                  style={styles.gameCard}
                >
                  {/* Actual game cover */}
                  {cover ? (
                    <Image
                      source={cover}
                      style={styles.gameCover}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.coverPlaceholder}>
                      <Ionicons
                        name="game-controller-outline"
                        size={42}
                        color={colors.accent}
                      />

                      <Text style={styles.coverLabel}>
                        COVER COMING SOON
                      </Text>
                    </View>
                  )}

                  {/* Game information */}
                  <View style={styles.gameInfo}>
                    <Text
                      style={styles.gameTitle}
                      numberOfLines={2}
                    >
                      {game.title}
                    </Text>

                    <Text style={styles.gameMeta}>
                      {game.genre || 'Unknown genre'}
                    </Text>

                    <Text style={styles.gameMeta}>
                      {game.platform || 'Unknown platform'}
                    </Text>

                    <View style={styles.gameFooter}>
                      <Text style={styles.rating}>
                        ★ {game.rating ?? 'N/A'}/10
                      </Text>

                      <Text style={styles.status}>
                        {game.status || 'Backlog'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Firebase information panel */}
        <View style={styles.dataPanel}>
          <View style={styles.dataIcon}>
            <Ionicons
              name="cloud-done-outline"
              size={24}
              color={colors.accent}
            />
          </View>

          <View style={styles.dataCopy}>
            <Text style={styles.dataTitle}>
              Connected to Firebase Firestore
            </Text>

            <Text style={styles.dataText}>
              Your collection is loaded from the
              cloud. Add, edit, or delete games
              through the Library page.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.bg,
  },
  main: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  mainContent: {
    padding: 22,
    paddingBottom: 50,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 18,
  },
  mobileBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileBrandText: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1.1,
  },
  search: {
    minHeight: 44,
    flex: 1,
    maxWidth: 520,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  input: {
    color: colors.text,
    flex: 1,
  },
  hero: {
    minHeight: 300,
    borderRadius: 18,
    padding: 28,
    backgroundColor: '#19231C',
    borderWidth: 1,
    borderColor: '#2D4B33',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
  },
  heroLeft: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  heroEyebrow: {
    color: colors.accent,
    fontWeight: '900',
    letterSpacing: 1.4,
    fontSize: 11,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '900',
    marginTop: 6,
  },
  heroText: {
    color: '#D7DEE8',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 560,
    marginTop: 9,
  },
  heroButton: {
    alignSelf: 'flex-start',
    marginTop: 18,
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  heroButtonText: {
    color: '#0A0E0B',
    fontWeight: '900',
  },
  heroTiles: {
    width: 240,
    justifyContent: 'center',
    gap: 10,
  },
  miniTile: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
  },
  miniTileTitle: {
    color: colors.text,
    fontWeight: '900',
  },
  miniTileMeta: {
    color: colors.muted,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 13,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '900',
  },
  gameCount: {
    color: colors.accent,
    fontWeight: '800',
  },
  genreHeading: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  genreRow: {
    gap: 9,
    paddingBottom: 15,
  },
  genreChip: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  genreChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  genreText: {
    color: colors.text,
    fontWeight: '800',
  },
  genreTextActive: {
    color: '#0A0E0B',
  },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 10,
  },
  gameCard: {
    width: 190,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    overflow: 'hidden',
  },
  gameCover: {
    width: '100%',
    height: 245,
    backgroundColor: '#203326',
  },
  coverPlaceholder: {
    height: 245,
    backgroundColor: '#203326',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 10,
  },
  coverLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  gameInfo: {
    padding: 13,
  },
  gameTitle: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 16,
    minHeight: 42,
  },
  gameMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 7,
  },
  gameFooter: {
    marginTop: 14,
    gap: 7,
  },
  rating: {
    color: colors.accent,
    fontWeight: '900',
  },
  status: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  centerMessage: {
    padding: 35,
    alignItems: 'center',
    gap: 12,
  },
  messageText: {
    color: colors.text,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
  },
  dataPanel: {
    marginTop: 28,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    gap: 13,
  },
  dataIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#1C3322',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataCopy: {
    flex: 1,
  },
  dataTitle: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 17,
  },
  dataText: {
    color: colors.muted,
    lineHeight: 20,
    marginTop: 4,
  },
});
