import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Header from '../../components/geral/Header';
import { MaterialIcons } from '@expo/vector-icons';

const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export default function EvolucaoCasos() {
  const [analysis, setAnalysis] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        { title: 'Permissão de Câmera', message: 'Precisamos acessar a câmera.' }
      );
    }
  }, []);

  async function fetchAnalysis() {
    setLoading(true);
    setAnalysis([]);
    try {
      const response = await fetch(`http://${HOST}:8001/analyze-webcam`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      // Filtrar apenas resultados válidos e incluir mensagens de erro
      const valid = json.analysis.map(item => {
        if (item.error) return { ...item, dominant_emotion: 'N/D', emotions: {}, isError: true };
        return { ...item, isError: false };
      });
      setAnalysis(valid);
    } catch (error) {
      console.error('Erro na análise:', error);
      alert(`Erro na análise: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Header corFundo="#F43F5E" />
      <View style={styles.titleWrapper}>
        <Text style={styles.title}>📹 Análise de Webcam</Text>
        <Text style={styles.subtitle}>Clique para capturar e analisar</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={fetchAnalysis}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <MaterialIcons name="camera" size={24} color="#FFF" />
            <Text style={styles.buttonText}>Analisar Webcam</Text>
          </>
        )}
      </TouchableOpacity>

      <ScrollView style={styles.logContainer}>
        {analysis.length > 0 ? (
          analysis.map((item, idx) => (
            <View key={idx} style={[styles.logItem, item.isError && styles.logError]}>
              <Text style={styles.emotionText}>
                {item.second}s → {item.dominant_emotion.toUpperCase()}
                {item.isError && ' (Não detectado)'}
              </Text>
              {!item.isError && (
                <Text style={styles.valuesText}>
                  {Object.entries(item.emotions)
                    .map(([emo, val]) => `${emo}: ${val}%`)
                    .join(' • ')}
                </Text>
              )}
            </View>
          ))
        ) : (
          !loading && <Text style={styles.emptyText}>Nenhuma análise realizada ainda.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  titleWrapper: { padding: 16, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  button: {
    flexDirection: 'row',
    backgroundColor: '#F43F5E',
    margin: 16,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.75 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  logContainer: { flex: 1, marginHorizontal: 16 },
  logItem: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    elevation: 2,
  },
  logError: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  emotionText: { fontSize: 16, fontWeight: '700' },
  valuesText: { fontSize: 14, color: '#374151', marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#64748B' },
});