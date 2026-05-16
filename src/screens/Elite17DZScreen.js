// Elite17DZScreen.js — versão dinâmica completa
// src/screens/Elite17DZScreen.js

import { useState, useEffect } from "react";
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, Dimensions, StatusBar, ActivityIndicator, Alert,
} from "react-native";
import LotofacilAPI from "../services/LotofacilAPI";

const { width: SW } = Dimensions.get("window");
const BALL_SIZE = 11;

const CORNELIO_DZ = [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 13, 14, 15, 20, 23, 24, 25];
const CORNELIO_DZ_KEY = JSON.stringify(CORNELIO_DZ);

const CATS = {
    "15": { label: "TOP =15 ACERTOS", icon: "🏆", color: "#ffd700" },
    "14": { label: "TOP =14 ACERTOS", icon: "💎", color: "#00e07a" },
    "13": { label: "TOP =13 ACERTOS", icon: "⚡", color: "#00c8ff" },
    "12": { label: "TOP =12 ACERTOS", icon: "🔮", color: "#b06df0" },
    "11": { label: "TOP =11 ACERTOS", icon: "🔥", color: "#ff9500" },
};

function atColor(val) {
    if (val === null || val === undefined || val >= 9999) return "#2a3f55";
    if (val <= 20) return "#00e07a";
    if (val <= 100) return "#ffd700";
    if (val <= 500) return "#ff9500";
    return "#ff4466";
}

function atLabel(val) {
    if (val === null || val === undefined || val >= 9999) return "\u221e nunca";
    if (val === 0) return "\u2726 atual";
    return "\u23f1 " + val + "c";
}

function Ball({ num, active, color, size }) {
    return (
        <View style={[st.ball, { width: size, height: size },
        active ? { backgroundColor: color + "33" } : { backgroundColor: "transparent" }]}>
            <Text style={[st.ballText, { fontSize: size * 0.72, color: active ? color : "#2a3f55" }]}>
                {num}
            </Text>
        </View>
    );
}

function ScoreCell({ label, val, atraso, color }) {
    return (
        <View style={st.scoreCell}>
            <Text style={st.scoreLbl}>{label}</Text>
            <Text style={[st.scoreVal, { color: color }]}>{val}</Text>
            <Text style={[st.scoreAt, { color: atColor(atraso) }]}>{atLabel(atraso)}</Text>
        </View>
    );
}

function BallRow({ dz, color, size }) {
    return (
        <View style={st.ballRow}>
            {Array.from({ length: 25 }, (_, i) => i + 1).map(d => (
                <Ball key={d} num={d} active={dz.includes(d)} color={color} size={size} />
            ))}
        </View>
    );
}

function GameCard({ item, color, rank, isMine }) {
    const rankColors = ["#ffd700", "#c0c0c0", "#cd7f32", "#4a5568", "#4a5568"];
    const cardStyle = isMine
        ? [st.gameCard, { borderColor: "#ffd700", borderWidth: 1.5 }]
        : [st.gameCard];

    const c = item.counts || {};
    const e15 = c["15"] || 0;
    const e14 = c["14"] || 0;
    const e13 = c["13"] || 0;
    const e12 = c["12"] || 0;
    const e11 = c["11"] || 0;
    const ats = item.atrasos || {};

    return (
        <View style={cardStyle}>
            {isMine ? <Text style={st.cornBadge}>★ SEU JOGO</Text> : null}
            <View style={st.gameTop}>
                <Text style={[st.rankNum, { color: rankColors[rank - 1] || "#4a5568" }]}>#{rank}</Text>
                <BallRow dz={item.dezenas} color={color} size={BALL_SIZE} />
            </View>
            <View style={st.scoresRow}>
                <ScoreCell label="=15" val={e15} atraso={ats["15"] ?? null} color="#ffd700" />
                <ScoreCell label="=14" val={e14} atraso={ats["14"] ?? null} color="#00e07a" />
                <ScoreCell label="=13" val={e13} atraso={ats["13"] ?? null} color="#00c8ff" />
                <ScoreCell label="=12" val={e12} atraso={ats["12"] ?? null} color="#b06df0" />
                <ScoreCell label="=11" val={e11} atraso={ats["11"] ?? null} color="#ff9500" />
            </View>
        </View>
    );
}

function Section({ catKey, topsByCat, cornelioDzKey }) {
    const [open, setOpen] = useState(catKey === "15");
    const cat = CATS[catKey];
    const games = topsByCat[catKey] || [];

    const headerStyle = open
        ? [st.sectionHeader, { borderColor: cat.color }]
        : [st.sectionHeader];
    const titleStyle = open
        ? [st.sectionTitle, { color: cat.color }]
        : [st.sectionTitle, { color: "#4a5568" }];
    const chevronStyle = open
        ? [st.chevron, { color: cat.color }]
        : [st.chevron, { color: "#2a3f55" }];

    return (
        <View style={st.section}>
            <TouchableOpacity onPress={() => setOpen(o => !o)} style={headerStyle} activeOpacity={0.8}>
                <View style={[st.sectionIcon, { borderColor: cat.color }]}>
                    <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
                </View>
                <Text style={titleStyle}>{cat.label}</Text>
                <Text style={chevronStyle}>{open ? "▲" : "▼"}</Text>
            </TouchableOpacity>

            {open ? (
                <View style={[st.sectionBody, { borderColor: cat.color }]}>
                    {games.length === 0
                        ? <Text style={{ color: "#4a5568", fontFamily: "monospace", fontSize: 10, padding: 10 }}>Carregando...</Text>
                        : games.map((g, i) => (
                            <GameCard
                                key={i}
                                item={g}
                                color={cat.color}
                                rank={i + 1}
                                isMine={JSON.stringify(g.dezenas) === cornelioDzKey}
                            />
                        ))
                    }
                </View>
            ) : null}
        </View>
    );
}

// Gera top-5 por categoria a partir do array bruto do JSON
function calcTopsByCat(dados) {
    const tops = {};
    ["15", "14", "13", "12", "11"].forEach(cat => {
        const sorted = [...dados].sort((a, b) =>
            (b.counts[cat] || 0) - (a.counts[cat] || 0)
        );
        tops[cat] = sorted.slice(0, 5);
    });
    return tops;
}

export default function Elite17DZScreen() {
    const [concurso, setConcurso] = useState(null);
    const [meuJogo, setMeuJogo] = useState(null);
    const [ranks, setRanks] = useState({});
    const [topsByCat, setTopsByCat] = useState({});
    const [totalCombinacoes] = useState("1.081.575");
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        atualizarDados();
    }, []);

    async function forcarAtualizacao() {
        await LotofacilAPI.clearRankingsCache();
        await atualizarDados();
    }

    async function atualizarDados() {
        setLoading(true);
        setErro(null);
        try {
            // 1. Buscar último concurso
            const resultados = await LotofacilAPI.buscarUltimosResultados(1);
            if (!resultados || resultados.length === 0) {
                setErro("Sem conexão com a API da Caixa.");
                return;
            }
            const ultimoConcurso = resultados[0].concurso;
            setConcurso(ultimoConcurso);

            // 2. Buscar JSON do ranking 17dz
            const dados = await LotofacilAPI.fetchRemoteRankings(ultimoConcurso, 17);
            if (!dados || dados.length === 0) {
                setErro(`Ranking não encontrado para o concurso ${ultimoConcurso}.`);
                return;
            }

            // 3. Calcular tops por categoria
            const tops = calcTopsByCat(dados);
            setTopsByCat(tops);

            // 4. Achar o jogo do Cornélio
            const meuJogoData = dados.find(item =>
                JSON.stringify(item.dezenas) === CORNELIO_DZ_KEY
            );

            if (meuJogoData) {
                setMeuJogo({
                    e15: meuJogoData.counts["15"] || 0,
                    e14: meuJogoData.counts["14"] || 0,
                    e13: meuJogoData.counts["13"] || 0,
                    e12: meuJogoData.counts["12"] || 0,
                    e11: meuJogoData.counts["11"] || 0,
                    atraso: meuJogoData.atraso ?? 0,
                    atrasos: meuJogoData.atrasos || {},
                });

                // 5. Calcular rank por categoria
                const novosRanks = {};
                ["15", "14", "13", "12", "11"].forEach(cat => {
                    const sorted = [...dados].sort((a, b) =>
                        (b.counts[cat] || 0) - (a.counts[cat] || 0)
                    );
                    const pos = sorted.findIndex(item =>
                        JSON.stringify(item.dezenas) === CORNELIO_DZ_KEY
                    );
                    novosRanks[cat] = pos >= 0 ? `#${pos + 1}` : "?";
                });
                setRanks(novosRanks);
            }
        } catch (e) {
            console.log("Erro ao atualizar Elite17DZ:", e);
            setErro("Erro ao carregar dados.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={st.container}>
            <StatusBar barStyle="light-content" backgroundColor="#080c10" />
            <ScrollView style={st.scroll} contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>

                <View style={st.header}>
                    <Text style={st.headerTitle}>ELITE 17DZ</Text>
                    <Text style={st.headerSub}>RANKINGS SUPREMOS</Text>
                    <Text style={st.headerMeta}>
                        {totalCombinacoes} combinações · {concurso ? `${concurso} concursos` : "carregando..."}
                    </Text>
                    {concurso
                        ? <Text style={st.headerLast}>{`▶ ÚLTIMO: #${concurso} · Atraso = concursos sem aquele score`}</Text>
                        : null}
                    {loading ? <ActivityIndicator color="#00c8ff" style={{ marginTop: 6 }} /> : null}
                    <TouchableOpacity
                        onPress={forcarAtualizacao}
                        style={{ marginTop: 8, borderWidth: 1, borderColor: "#00c8ff", borderRadius: 6, paddingHorizontal: 14, paddingVertical: 4 }}
                    >
                        <Text style={{ color: "#00c8ff", fontSize: 9, fontFamily: "monospace" }}>
                            ↺ FORÇAR ATUALIZAÇÃO
                        </Text>
                    </TouchableOpacity>
                    {erro ? <Text style={{ color: "#ff4466", fontSize: 9, fontFamily: "monospace", marginTop: 6 }}>{erro}</Text> : null}
                </View>

                <View style={st.legend}>
                    <Text style={st.legendTitle}>LEGENDA DE ATRASO</Text>
                    <View style={st.legendRow}>
                        {[["#00e07a", "0–20 Recente"], ["#ffd700", "21–100 Moderado"], ["#ff9500", "101–500 Atrasado"], ["#ff4466", "500+ Crítico"], ["#2a3f55", "∞ Nunca"]].map(([c, l]) => (
                            <View key={l} style={st.legendItem}>
                                <View style={[st.legendDot, { backgroundColor: c }]} />
                                <Text style={[st.legendText, { color: c }]}>{l}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={st.cornelioCard}>
                    <View style={st.cornelioHeader}>
                        <Text style={st.cornelioTitle}>{"◈ SEU JOGO — REFERÊNCIA"}</Text>
                        <View style={st.cornelioBadge}><Text style={st.cornelioBadgeText}>17DZ</Text></View>
                    </View>
                    <BallRow dz={CORNELIO_DZ} color="#ffd700" size={11} />
                    {meuJogo ? (
                        <>
                            <View style={[st.scoresRow, { marginTop: 10 }]}>
                                <ScoreCell label="=15" val={meuJogo.e15} atraso={meuJogo.atrasos?.["15"] ?? null} color="#ffd700" />
                                <ScoreCell label="=14" val={meuJogo.e14} atraso={meuJogo.atrasos?.["14"] ?? null} color="#00e07a" />
                                <ScoreCell label="=13" val={meuJogo.e13} atraso={meuJogo.atrasos?.["13"] ?? null} color="#00c8ff" />
                                <ScoreCell label="=12" val={meuJogo.e12} atraso={meuJogo.atrasos?.["12"] ?? null} color="#b06df0" />
                                <ScoreCell label="=11" val={meuJogo.e11} atraso={meuJogo.atrasos?.["11"] ?? null} color="#ff9500" />
                            </View>
                            <View style={st.ranksRow}>
                                {Object.entries(ranks).map(([cat, rank]) => (
                                    <View key={cat} style={[st.rankChip, { borderColor: CATS[cat].color }]}>
                                        <Text style={[st.rankChipText, { color: CATS[cat].color }]}>{rank} rank ={cat}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    ) : (
                        <Text style={{ color: "#4a5568", fontSize: 9, fontFamily: "monospace", marginTop: 10 }}>
                            {loading ? "Carregando..." : "Jogo não encontrado no ranking."}
                        </Text>
                    )}
                </View>

                {Object.keys(CATS).map(k => (
                    <Section key={k} catKey={k} topsByCat={topsByCat} cornelioDzKey={CORNELIO_DZ_KEY} />
                ))}

                <Text style={st.footer}>{`Lotofácil Concursos 1–${concurso || "?"} · LotoMatrix Elite 17DZ`}</Text>
            </ScrollView>
        </View>
    );
}

const BG = "#080c10", SURFACE = "#0d1117", BORDER = "#1a2332", MONO = "monospace";

const st = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    scroll: { flex: 1 },
    content: { padding: 14, paddingBottom: 40 },
    header: { alignItems: "center", marginBottom: 20, paddingTop: 8 },
    headerTitle: { color: "#00c8ff", fontSize: 18, fontWeight: "900", letterSpacing: 4, fontFamily: MONO },
    headerSub: { color: "#00c8ff", fontSize: 11, letterSpacing: 3, fontFamily: MONO, opacity: 0.7 },
    headerMeta: { color: "#4a5568", fontSize: 10, fontFamily: MONO, marginTop: 6 },
    headerLast: { color: "#00e07a", fontSize: 9, fontFamily: MONO, marginTop: 4 },
    legend: { backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, borderRadius: 8, padding: 12, marginBottom: 16 },
    legendTitle: { color: "#4a5568", fontSize: 9, fontFamily: MONO, letterSpacing: 2, marginBottom: 8 },
    legendRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    legendDot: { width: 7, height: 7, borderRadius: 4 },
    legendText: { fontSize: 9, fontFamily: MONO },
    cornelioCard: { backgroundColor: "#0d1117", borderWidth: 1.5, borderColor: "#ffd700", borderRadius: 12, padding: 14, marginBottom: 20 },
    cornelioHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    cornelioTitle: { color: "#ffd700", fontSize: 10, fontFamily: MONO, letterSpacing: 2 },
    cornelioBadge: { backgroundColor: "rgba(255,215,0,0.1)", borderWidth: 1, borderColor: "#ffd700", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
    cornelioBadgeText: { color: "#ffd700", fontSize: 9, fontFamily: MONO },
    ballRow: { flexDirection: "row", flexWrap: "nowrap", gap: 2 },
    ball: { alignItems: "center", justifyContent: "center" },
    ballText: { fontFamily: MONO, fontWeight: "700" },
    ranksRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
    rankChip: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: "rgba(0,0,0,0.4)" },
    rankChipText: { fontSize: 9, fontFamily: MONO },
    section: { marginBottom: 12 },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, borderRadius: 10 },
    sectionIcon: { width: 34, height: 34, borderRadius: 6, borderWidth: 1, alignItems: "center", justifyContent: "center" },
    sectionTitle: { flex: 1, fontSize: 10, fontFamily: MONO, letterSpacing: 2 },
    chevron: { fontSize: 11, fontFamily: MONO },
    sectionBody: { borderWidth: 1, borderTopWidth: 0, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: BG, padding: 8 },
    gameCard: { backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, borderRadius: 8, padding: 10, marginBottom: 8 },
    cornBadge: { color: "#ffd700", fontSize: 8, fontFamily: MONO, letterSpacing: 1, textAlign: "right", marginBottom: 4 },
    gameTop: { flexDirection: "row", alignItems: "center", gap: 2, marginBottom: 8 },
    rankNum: { fontSize: 12, fontWeight: "900", fontFamily: MONO, width: 24 },
    scoresRow: { flexDirection: "row", gap: 4 },
    scoreCell: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", borderRadius: 6, padding: 6, alignItems: "center", borderWidth: 1, borderColor: BORDER },
    scoreLbl: { color: "#4a5568", fontSize: 9, fontFamily: MONO, marginBottom: 2 },
    scoreVal: { fontSize: 15, fontWeight: "700", fontFamily: MONO, lineHeight: 18 },
    scoreAt: { fontSize: 8, fontFamily: MONO, marginTop: 2 },
    footer: { textAlign: "center", color: "#1e2d3d", fontSize: 8, fontFamily: MONO, marginTop: 12 },
});