import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  LayoutAnimation,
  UIManager,
  Platform,
  TextInput,
} from 'react-native';
import Svg, { Polyline, Text as SvgText, Circle, Line, G, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../../../components/geral/Header';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PADDING = 24;
const EXTRA_RIGHT_PADDING = 20; // Originalmente não usado, mas mantido para contexto se for adicionado
const GRAPH_HEIGHT = 220;
const GRAPH_WIDTH = SCREEN_WIDTH * 1.5; // Aumentado para melhor visualização
const PIE_CHART_SIZE = 160;
const PIE_CHART_RADIUS = PIE_CHART_SIZE / 2;

const EMOTION_COLORS = {
  happy: '#F59E0B',
  sad: '#3B82F6',
  fear: '#EC4899',
  angry: '#EF4444',
  surprise: '#10B981',
  neutral: '#9CA3AF',
  disgust: '#8B5CF6',
};

const EMOTION_TRANSLATIONS = {
  happy: 'feliz',
  sad: 'triste',
  fear: 'medo',
  angry: 'raiva',
  surprise: 'surpresa',
  neutral: 'neutro',
  disgust: 'desgosto',
};

const getEmotionColor = (emotion) => EMOTION_COLORS[emotion] ?? '#E5E7EB';
const getEmotionTranslation = (emotion) => EMOTION_TRANSLATIONS[emotion] ?? emotion;

export default function EvolucaoCasos() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [notes, setNotes] = useState(''); // Estado para as anotações globais ou do gráfico de pizza

  const toggleItem = useCallback((idx) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      // ATENÇÃO: Ajuste este endereço IP de acordo com seu ambiente de teste:
      // - Emulador Android: 'http://10.0.2.2:8001/analyze-fixed-video'
      // - Simulador iOS: 'http://127.0.0.1:8001/analyze-fixed-video' (geralmente funciona)
      // - Dispositivo Físico: 'http://SEU_IP_LOCAL:8001/analyze-fixed-video'
      const res = await fetch('http://192.168.15.8:8001/analyze-fixed-video');
      if (!res.ok) throw new Error(`Erro na resposta da API: ${res.status} ${res.statusText}`);
      const json = await res.json();
      setAnalysis(json);
      // Opcional: Limpar as notas ao carregar uma nova análise
      setNotes(''); 
    } catch (error) {
      alert(`Erro ao buscar dados da API: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const chartPoints = useMemo(() => {
    if (!analysis?.analysis?.length) return [];
    const data = analysis.analysis;
    const maxSecond = Math.max(...data.map((d) => d.second));

    // Garantir que não haja divisão por zero se maxSecond for 0
    const scaleFactor = maxSecond > 0 ? GRAPH_WIDTH / maxSecond : 0;

    return data.map((d) => ({
      x: d.second * scaleFactor, // Escala o tempo para a largura do gráfico
      // Inverte a coordenada Y para que 0% seja na parte inferior e 100% no topo
      y: GRAPH_HEIGHT - ((d.emotions[d.dominant_emotion] ?? 0) / 100) * GRAPH_HEIGHT,
      ...d,
    }));
  }, [analysis]);

  // Calcula a distribuição geral das emoções para o gráfico de pizza
  const pieChartData = useMemo(() => {
    if (!analysis?.analysis?.length) return [];

    const emotionTotals = analysis.analysis.reduce((acc, curr) => {
      Object.entries(curr.emotions).forEach(([emotion, value]) => {
        acc[emotion] = (acc[emotion] || 0) + value;
      });
      return acc;
    }, {});

    const total = Object.values(emotionTotals).reduce((sum, val) => sum + val, 0);

    // Filtra emoções com valor 0 para não criar fatias invisíveis
    return Object.entries(emotionTotals)
      .filter(([, value]) => value > 0) 
      .map(([emotion, value]) => ({
        emotion,
        value,
        percentage: (value / total) * 100,
        color: getEmotionColor(emotion),
      }))
      .sort((a, b) => b.value - a.value); // Ordena para fatias maiores primeiro
  }, [analysis]);

  // Gera os paths para o gráfico de pizza
  const pieChartPaths = useMemo(() => {
    if (!pieChartData.length) return [];

    let startAngle = 0;
    const paths = [];

    pieChartData.forEach((slice) => {
      const endAngle = startAngle + (slice.percentage / 100) * 2 * Math.PI;
      
      const x1 = PIE_CHART_RADIUS + PIE_CHART_RADIUS * Math.cos(startAngle);
      const y1 = PIE_CHART_RADIUS + PIE_CHART_RADIUS * Math.sin(startAngle);
      const x2 = PIE_CHART_RADIUS + PIE_CHART_RADIUS * Math.cos(endAngle);
      const y2 = PIE_CHART_RADIUS + PIE_CHART_RADIUS * Math.sin(endAngle);

      const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;

      const pathData = [
        `M ${PIE_CHART_RADIUS} ${PIE_CHART_RADIUS}`, // Move para o centro
        `L ${x1} ${y1}`, // Linha para o ponto inicial do arco
        `A ${PIE_CHART_RADIUS} ${PIE_CHART_RADIUS} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Arco
        'Z', // Fecha o caminho para o centro
      ].join(' ');

      paths.push({
        pathData,
        color: slice.color,
        emotion: slice.emotion,
        percentage: slice.percentage,
      });

      startAngle = endAngle;
    });

    return paths;
  }, [pieChartData]);

  // Componente auxiliar para exibir informações
  const InfoItem = ({ icon, text }) => (
    <View style={styles.infoItem}>
      <MaterialIcons name={icon} size={18} color="#F43F5E" style={{ marginRight: 6 }} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );

  // Componente auxiliar para chips de legenda
  const LegendChip = ({ label, color }) => (
    <View style={styles.legendChip}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );

  const renderDetailItem = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => toggleItem(index)}
      style={[
        styles.detailCard,
        { borderLeftColor: getEmotionColor(item.dominant_emotion) },
      ]}
    >
      <View style={styles.detailHeaderRow}>
        <View style={styles.detailHeaderLeft}>
          <Text style={styles.secondBadge}>{item.second}s</Text>
          <View>
            <Text style={styles.secondLabel}>Segundo {item.second}</Text>
            <Text style={[styles.dominantLabel, { color: getEmotionColor(item.dominant_emotion) }]}>
              {getEmotionTranslation(item.dominant_emotion).toUpperCase()} ({item.emotions[item.dominant_emotion]}%)
            </Text>
          </View>
        </View>
        <MaterialIcons
          name={expanded[index] ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color="#6B7280"
        />
      </View>

      {expanded[index] && (
        <View style={styles.detailContent}>
          {Object.entries(item.emotions).map(([emo, val]) => (
            <View key={emo} style={styles.emotionRow}>
              <View style={[styles.emotionDot, { backgroundColor: getEmotionColor(emo) }]} />
              <Text style={styles.emotionText}>
                <Text style={styles.emotionName}>{getEmotionTranslation(emo)}:</Text> {val.toFixed(1)}% {/* Garante 1 casa decimal para valores de emoção */}
              </Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header corFundo="#F43F5E" />

      <View style={styles.titleWrapper}>
        <Text style={styles.title}>📊 Evolução Emocional</Text>
        <Text style={styles.subtitle}>Análise por segundo das emoções detectadas</Text>
      </View>

      <TouchableOpacity
        style={[styles.analyzeBtn, loading && { opacity: 0.75 }]}
        disabled={loading}
        onPress={fetchAnalysis}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <MaterialIcons name="play-circle-filled" size={20} color="#FFF" />
            <Text style={styles.analyzeText}>Analisar Vídeo</Text>
          </>
        )}
      </TouchableOpacity>

      {analysis && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.infoBox}>
            <InfoItem icon="videocam" text={`Vídeo: ${analysis.video || 'Não informado'}`} />
            <InfoItem icon="description" text={`Saída JSON: ${analysis.output_json || 'Não informado'}`} />
            {analysis.analysis?.length > 0 && (
              <InfoItem
                icon="timer"
                text={`Duração total: ${Math.max(...analysis.analysis.map((d) => d.second))}s`}
              />
            )}
          </View>

          {/* Seção do gráfico de pizza com caixa de notas */}
          <View style={styles.pieChartSection}>
            <Text style={styles.sectionHeading}>📊 Distribuição Emocional Geral</Text>
            
            <View style={styles.pieChartRow}>
              <View style={styles.pieChartContainer}>
                {pieChartData.length > 0 ? (
                  <Svg width={PIE_CHART_SIZE} height={PIE_CHART_SIZE}>
                    <Defs>
                      <LinearGradient id="totalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor="#F43F5E" stopOpacity={0.8} />
                        <Stop offset="100%" stopColor="#FF7080" stopOpacity={0.8} />
                      </LinearGradient>
                    </Defs>
                    {pieChartPaths.map((slice, index) => (
                      <Path
                        key={index}
                        d={slice.pathData}
                        fill={slice.color}
                        stroke="#FFF"
                        strokeWidth={2}
                      />
                    ))}
                    
                    <Circle
                      cx={PIE_CHART_RADIUS}
                      cy={PIE_CHART_RADIUS}
                      r={PIE_CHART_RADIUS * 0.5}
                      fill="#FFF" // Fundo do círculo central
                    />
                    
                    <SvgText
                      x={PIE_CHART_RADIUS}
                      y={PIE_CHART_RADIUS - 10}
                      fontSize="14"
                      fontWeight="bold"
                      fill="#1E293B"
                      textAnchor="middle"
                    >
                      Total
                    </SvgText>
                    <SvgText
                      x={PIE_CHART_RADIUS}
                      y={PIE_CHART_RADIUS + 15}
                      fontSize="12"
                      fill="#64748B"
                      textAnchor="middle"
                    >
                      {analysis.analysis.length}s
                    </SvgText>
                  </Svg>
                ) : (
                  <Text style={styles.noDataText}>Sem dados para o gráfico de pizza.</Text>
                )}
              </View>
              
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Anotações Gerais</Text>
                <TextInput
                  style={styles.notesInput}
                  multiline
                  placeholder="Escreva suas observações gerais sobre a análise do vídeo..."
                  placeholderTextColor="#9CA3AF"
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>
            </View>
            
            {pieChartData.length > 0 && (
              <View style={styles.pieChartLegend}>
                {pieChartData.map((slice) => (
                  <View key={slice.emotion} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: slice.color }]} />
                    <Text style={styles.legendText}>
                      {getEmotionTranslation(slice.emotion)}: {slice.percentage.toFixed(1)}%
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Gráfico de linha melhorado */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>📈 Tendência da Emoção Dominante</Text>
            <Text style={styles.chartSubtitle}>Segundos analisados: {analysis.analysis.length}</Text>

            {chartPoints.length > 0 ? (
              <View style={styles.chartContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: EXTRA_RIGHT_PADDING }}
                >
                  <Svg height={GRAPH_HEIGHT + 80} width={GRAPH_WIDTH + EXTRA_RIGHT_PADDING}>
                    <Defs>
                      <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor="#F43F5E" stopOpacity={0.2} />
                        <Stop offset="100%" stopColor="#F43F5E" stopOpacity={0} />
                      </LinearGradient>
                    </Defs>
                    
                    {/* Grid horizontal e rótulos de porcentagem */}
                    {[0, 25, 50, 75, 100].map((p) => (
                      <React.Fragment key={p}>
                        <Line
                          x1={0}
                          y1={GRAPH_HEIGHT - (p * GRAPH_HEIGHT) / 100}
                          x2={GRAPH_WIDTH}
                          y2={GRAPH_HEIGHT - (p * GRAPH_HEIGHT) / 100}
                          stroke="#E5E7EB"
                          strokeWidth={1}
                          strokeDasharray={p !== 0 && p !== 100 ? '4,4' : '0'}
                        />
                        <SvgText
                          x={-H_PADDING + 8} // Posição do rótulo %
                          y={GRAPH_HEIGHT - (p * GRAPH_HEIGHT) / 100 + 4}
                          fontSize="12"
                          fill="#9CA3AF"
                          textAnchor="start" // Alinha à esquerda
                        >
                          {p}%
                        </SvgText>
                      </React.Fragment>
                    ))}

                    {/* Eixo X com segundos */}
                    {analysis.analysis
                      .filter((_, i) => i % 5 === 0 || i === analysis.analysis.length - 1) // Filtra para mostrar a cada 5s e o último segundo
                      .map((d) => {
                        const maxSecond = Math.max(...analysis.analysis.map((dataPoint) => dataPoint.second));
                        const x = (d.second / maxSecond) * GRAPH_WIDTH;
                        return (
                          <G key={`time-${d.second}`}>
                            <Line
                              x1={x}
                              y1={GRAPH_HEIGHT}
                              x2={x}
                              y2={GRAPH_HEIGHT + 5}
                              stroke="#6B7280"
                              strokeWidth={1}
                            />
                            <SvgText
                              x={x}
                              y={GRAPH_HEIGHT + 25}
                              fontSize="12"
                              fill="#374151"
                              textAnchor="middle"
                            >
                              {d.second}s
                            </SvgText>
                          </G>
                        );
                      })}

                    {/* Área preenchida abaixo da linha */}
                    <Path
                      d={`M0,${GRAPH_HEIGHT} L${chartPoints.map(pt => `${pt.x},${pt.y}`).join(' L')} L${GRAPH_WIDTH},${GRAPH_HEIGHT} Z`}
                      fill="url(#gradient)"
                    />

                    {/* Linha principal com gradiente */}
                    <Polyline
                      points={chartPoints.map((pt) => `${pt.x},${pt.y}`).join(' ')}
                      fill="none"
                      stroke="#F43F5E"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Pontos interativos */}
                    {chartPoints.map((pt, i) => (
                      <G key={i}>
                        <Circle
                          cx={pt.x}
                          cy={pt.y}
                          r="6"
                          fill={getEmotionColor(pt.dominant_emotion)}
                          stroke="#FFF"
                          strokeWidth="2"
                          onPress={() => setSelectedPoint(selectedPoint?.second === pt.second ? null : pt)}
                        />
                        {/* Tooltip renderizado como parte do SVG */}
                        {selectedPoint?.second === pt.second && (
                          <G>
                            <Circle
                              cx={pt.x}
                              cy={pt.y}
                              r={12}
                              fill={getEmotionColor(pt.dominant_emotion)}
                              fillOpacity={0.2}
                            />
                            {/* Ajustar a posição do texto do tooltip para não ficar muito grudado */}
                            <SvgText
                              x={pt.x}
                              y={pt.y - 25} // Ajustado para não sobrepor o ponto
                              fontSize="12"
                              fontWeight="bold"
                              fill={getEmotionColor(pt.dominant_emotion)}
                              textAnchor="middle"
                            >
                              {getEmotionTranslation(pt.dominant_emotion)}
                            </SvgText>
                            <SvgText
                              x={pt.x}
                              y={pt.y - 10} // Ajustado para não sobrepor o ponto
                              fontSize="11"
                              fill="#6B7280"
                              textAnchor="middle"
                            >
                              ({(pt.emotions[pt.dominant_emotion] ?? 0).toFixed(1)}% @ {pt.second}s)
                            </SvgText>
                          </G>
                        )}
                      </G>
                    ))}
                  </Svg>
                </ScrollView>

                {/* Caixa de texto ao lado do gráfico */}
                <View style={styles.chartNotesContainer}>
                  <Text style={styles.chartNotesTitle}>Observações do Gráfico</Text>
                  <TextInput
                    style={styles.chartNotesInput}
                    multiline
                    placeholder="Anote padrões ou insights sobre a evolução emocional..."
                    placeholderTextColor="#9CA3AF"
                    // Embora o exemplo use 'notes', pode ser útil ter um estado separado para as notas do gráfico
                    // value={chartNotes} 
                    // onChangeText={setChartNotes}
                    value={notes} // Reutilizando 'notes' para simplicidade, mas idealmente seria 'chartNotes'
                    onChangeText={setNotes}
                  />
                </View>
              </View>
            ) : (
              <Text style={styles.noDataText}>Análise do gráfico de tendência não disponível.</Text>
            )}

            {/* Legenda do gráfico de linha */}
            <View style={styles.legendWrapper}>
              {Object.keys(EMOTION_COLORS).map((emo) => (
                <LegendChip
                  key={emo}
                  label={getEmotionTranslation(emo).toUpperCase()}
                  color={getEmotionColor(emo)}
                />
              ))}
            </View>
          </View>

          <Text style={styles.sectionHeading}>
            🧠 Detalhes por Segundo ({analysis.analysis.length} segundos analisados)
          </Text>
          <FlatList
            data={analysis.analysis}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={renderDetailItem}
            scrollEnabled={false} // Desabilita o scroll da FlatList dentro da ScrollView principal
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <Text style={styles.noDataText}>Nenhum detalhe de análise por segundo disponível.</Text>
            )}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC', 
    paddingHorizontal: H_PADDING 
  },
  titleWrapper: { 
    marginTop: 14, 
    alignItems: 'center', 
    marginBottom: 18 
  },
  title: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#1E293B' 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#64748B', 
    marginTop: 4 
  },
  analyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F43F5E',
    borderRadius: 10,
    paddingVertical: 14,
    elevation: 2,
    marginBottom: 20, // Adicionado espaçamento
  },
  analyzeText: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: '600', 
    marginLeft: 6 
  },
  scrollContent: { 
    paddingBottom: 40 
  },
  infoBox: { 
    backgroundColor: '#FFE4E6', 
    borderRadius: 12, 
    padding: 14, 
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  infoItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 6 
  },
  infoText: { 
    flex: 1, 
    fontSize: 12, 
    color: '#B91C1C' 
  },
  
  // Estilos para a seção do gráfico de pizza
  pieChartSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 22,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  pieChartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  pieChartContainer: {
    width: PIE_CHART_SIZE,
    height: PIE_CHART_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesContainer: {
    flex: 1,
    marginLeft: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  notesInput: {
    flex: 1,
    minHeight: 120, // Altura mínima para o TextInput
    fontSize: 14,
    color: '#1E293B',
    textAlignVertical: 'top', // Para o texto começar do topo em multiline
  },
  pieChartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
  },
  
  // Estilos para o gráfico de linha melhorado
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 22,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  chartContainer: {
    flexDirection: 'row',
    marginTop: 10,
    // Remover paddingHorizontal para o ScrollView controlar isso
  },
  chartTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#1E293B' 
  },
  chartSubtitle: { 
    fontSize: 12, 
    color: '#64748B', 
    marginTop: 2 
  },
  chartNotesContainer: {
    width: 150, // Largura fixa para a caixa de notas ao lado do gráfico
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginLeft: 10, // Espaçamento entre o gráfico e a caixa
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chartNotesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  chartNotesInput: {
    flex: 1,
    fontSize: 12,
    color: '#1E293B',
    textAlignVertical: 'top',
  },
  legendWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 14,
  },
  legendChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginHorizontal: 6, 
    marginVertical: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  legendDot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    marginRight: 4 
  },
  legendLabel: { 
    fontSize: 10, 
    fontWeight: '500', 
    color: '#4B5563' 
  },
  sectionHeading: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#1E293B', 
    marginBottom: 12,
    marginTop: 8,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 6,
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  detailHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  detailHeaderLeft: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  secondBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 10,
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  secondLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#334155' 
  },
  dominantLabel: { 
    fontSize: 13, 
    fontWeight: '500', 
    marginTop: 2 
  },
  detailContent: { 
    marginTop: 12, 
    borderTopWidth: 1, 
    borderTopColor: '#E2E8F0', 
    paddingTop: 12 
  },
  emotionRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  emotionDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    marginRight: 8 
  },
  emotionName: { 
    fontWeight: '700', 
    textTransform: 'capitalize' 
  },
  emotionText: { 
    fontSize: 13, 
    color: '#334155' 
  },
  tooltip: {
    // Este estilo não é mais usado para o tooltip renderizado DENTRO do SVG
    // pois o tooltip agora é renderizado como SvgText e SvgCircle diretamente no SVG
    // Mantido aqui para referência caso queira um tooltip fora do SVG novamente.
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  tooltipEmotion: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tooltipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
});