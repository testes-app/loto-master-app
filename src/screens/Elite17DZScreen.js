// Elite17DZScreen.js — versão corrigida
// src/screens/Elite17DZScreen.js

import { useState, useEffect } from "react";
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, Dimensions, StatusBar, ActivityIndicator,
} from "react-native";
import LotofacilAPI from "../services/LotofacilAPI";

const { width: SW } = Dimensions.get("window");
const BALL_SIZE = 11;

const CORNELIO_DZ = [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 13, 14, 15, 20, 23, 24, 25];

const CORNELIO_DZ_SET = new Set(CORNELIO_DZ);

// Ranks padrão (atualizado dinamicamente)
const RANKS_PADRAO = {
    "15": "#1", "14": "#26.551", "13": "#423.043", "12": "#2.627", "11": "#423.405"
};

const CATS = {
    "15": { label: "TOP =15 ACERTOS", icon: "🏆", color: "#ffd700" },
    "14": { label: "TOP =14 ACERTOS", icon: "💎", color: "#00e07a" },
    "13": { label: "TOP =13 ACERTOS", icon: "⚡", color: "#00c8ff" },
    "12": { label: "TOP =12 ACERTOS", icon: "🔮", color: "#b06df0" },
    "11": { label: "TOP =11 ACERTOS", icon: "🔥", color: "#ff9500" },
};

const TOPS = {
    "15": [
        { pos: 1, e15: 5, e14: 2, e13: 78, e12: 351, e11: 1014, dz: [1, 2, 3, 5, 7, 8, 9, 11, 12, 14, 15, 16, 18, 20, 21, 23, 25], a15: 1385, a14: 1305, a13: 3, a12: 1, a11: 4, corn: false },
        { pos: 2, e15: 4, e14: 11, e13: 77, e12: 454, e11: 984, dz: [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 13, 14, 15, 20, 23, 24, 25], a15: 301, a14: 6, a13: 125, a12: 12, a11: 0, corn: true },
        { pos: 3, e15: 4, e14: 8, e13: 95, e12: 406, e11: 1050, dz: [1, 2, 3, 6, 9, 10, 11, 12, 13, 14, 15, 18, 19, 20, 22, 24, 25], a15: 366, a14: 276, a13: 46, a12: 7, a11: 0, corn: false },
        { pos: 4, e15: 4, e14: 8, e13: 72, e12: 438, e11: 943, dz: [1, 2, 5, 7, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 25], a15: 823, a14: 713, a13: 87, a12: 3, a11: 0, corn: false },
        { pos: 5, e15: 4, e14: 6, e13: 96, e12: 391, e11: 1023, dz: [1, 2, 3, 4, 6, 9, 10, 11, 12, 13, 16, 18, 19, 20, 22, 23, 25], a15: 271, a14: 227, a13: 19, a12: 0, a11: 6, corn: false },
    ],
    "14": [
        { pos: 1, e15: 0, e14: 22, e13: 72, e12: 387, e11: 948, dz: [3, 4, 5, 6, 7, 8, 9, 10, 11, 16, 18, 19, 20, 21, 22, 24, 25], a15: null, a14: 430, a13: 47, a12: 1, a11: 6, corn: false },
        { pos: 2, e15: 0, e14: 21, e13: 88, e12: 399, e11: 994, dz: [1, 2, 3, 4, 6, 9, 10, 12, 13, 14, 15, 17, 19, 22, 23, 24, 25], a15: null, a14: 101, a13: 21, a12: 7, a11: 9, corn: false },
        { pos: 3, e15: 0, e14: 21, e13: 71, e12: 383, e11: 1010, dz: [1, 2, 4, 5, 7, 10, 11, 12, 14, 15, 16, 17, 19, 20, 21, 23, 25], a15: null, a14: 87, a13: 3, a12: 18, a11: 1, corn: false },
        { pos: 4, e15: 0, e14: 21, e13: 64, e12: 406, e11: 1002, dz: [1, 2, 3, 4, 6, 9, 10, 11, 12, 13, 15, 16, 17, 18, 20, 22, 25], a15: null, a14: 199, a13: 48, a12: 11, a11: 0, corn: false },
        { pos: 5, e15: 1, e14: 20, e13: 91, e12: 412, e11: 945, dz: [1, 2, 3, 4, 6, 9, 12, 13, 14, 15, 17, 18, 19, 20, 22, 24, 25], a15: 3332, a14: 172, a13: 48, a12: 21, a11: 7, corn: false },
    ],
    "13": [
        { pos: 1, e15: 0, e14: 6, e13: 124, e12: 414, e11: 1002, dz: [1, 3, 4, 6, 9, 10, 11, 12, 13, 15, 17, 18, 19, 20, 21, 24, 25], a15: null, a14: 121, a13: 0, a12: 11, a11: 2, corn: false },
        { pos: 2, e15: 0, e14: 7, e13: 123, e12: 406, e11: 958, dz: [1, 2, 3, 4, 6, 9, 10, 11, 12, 13, 17, 18, 20, 21, 23, 24, 25], a15: null, a14: 665, a13: 0, a12: 2, a11: 5, corn: false },
        { pos: 3, e15: 0, e14: 5, e13: 123, e12: 421, e11: 985, dz: [1, 2, 5, 7, 8, 10, 11, 12, 13, 14, 15, 18, 20, 22, 23, 24, 25], a15: null, a14: 1104, a13: 24, a12: 5, a11: 1, corn: false },
        { pos: 4, e15: 0, e14: 6, e13: 120, e12: 393, e11: 962, dz: [1, 5, 7, 8, 10, 11, 12, 13, 14, 17, 18, 19, 20, 21, 22, 24, 25], a15: null, a14: 406, a13: 51, a12: 2, a11: 0, corn: false },
        { pos: 5, e15: 0, e14: 4, e13: 120, e12: 387, e11: 983, dz: [2, 3, 4, 6, 9, 10, 12, 13, 14, 15, 17, 18, 19, 20, 21, 24, 25], a15: null, a14: 1518, a13: 35, a12: 28, a11: 0, corn: false },
    ],
    "12": [
        { pos: 1, e15: 0, e14: 8, e13: 64, e12: 494, e11: 965, dz: [2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14, 17, 18, 20, 22, 24, 25], a15: null, a14: 113, a13: 26, a12: 2, a11: 0, corn: false },
        { pos: 2, e15: 0, e14: 4, e13: 77, e12: 491, e11: 981, dz: [1, 4, 5, 9, 10, 11, 12, 13, 15, 17, 18, 19, 20, 21, 22, 24, 25], a15: null, a14: 906, a13: 2, a12: 0, a11: 3, corn: false },
        { pos: 3, e15: 0, e14: 10, e13: 64, e12: 489, e11: 978, dz: [1, 3, 4, 5, 6, 9, 10, 11, 13, 14, 15, 17, 18, 19, 20, 21, 25], a15: null, a14: 604, a13: 0, a12: 13, a11: 6, corn: false },
        { pos: 4, e15: 0, e14: 4, e13: 86, e12: 488, e11: 960, dz: [1, 3, 4, 6, 9, 10, 11, 12, 13, 14, 17, 19, 20, 21, 22, 24, 25], a15: null, a14: 335, a13: 21, a12: 0, a11: 2, corn: false },
        { pos: 5, e15: 0, e14: 8, e13: 76, e12: 487, e11: 954, dz: [1, 2, 4, 5, 6, 9, 10, 12, 13, 14, 15, 17, 19, 20, 21, 24, 25], a15: null, a14: 202, a13: 81, a12: 21, a11: 0, corn: false },
    ],
    "11": [
        { pos: 1, e15: 0, e14: 7, e13: 75, e12: 421, e11: 1128, dz: [1, 4, 5, 6, 9, 10, 11, 12, 13, 14, 15, 18, 20, 21, 22, 24, 25], a15: null, a14: 219, a13: 35, a12: 2, a11: 0, corn: false },
        { pos: 2, e15: 0, e14: 10, e13: 70, e12: 385, e11: 1128, dz: [1, 4, 5, 7, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 23, 25], a15: null, a14: 185, a13: 22, a12: 0, a11: 2, corn: false },
        { pos: 3, e15: 0, e14: 6, e13: 84, e12: 371, e11: 1122, dz: [1, 4, 7, 9, 10, 11, 13, 14, 15, 17, 18, 19, 20, 22, 23, 24, 25], a15: null, a14: 282, a13: 40, a12: 27, a11: 2, corn: false },
        { pos: 4, e15: 0, e14: 4, e13: 81, e12: 390, e11: 1116, dz: [4, 6, 7, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 24, 25], a15: null, a14: 1620, a13: 28, a12: 44, a11: 2, corn: false },
        { pos: 5, e15: 0, e14: 0, e13: 89, e12: 354, e11: 1114, dz: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 19, 20, 21, 24], a15: null, a14: null, a13: 85, a12: 0, a11: 4, corn: false },
    ],
};

// O objeto CORNELIO_RANKS agora é dinâmico (ranks) no componente

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
    const activeStyle = { backgroundColor: color + "33" };
    const inactiveStyle = { backgroundColor: "transparent" };
    return (
        <View style={[st.ball, { width: size, height: size }, active ? activeStyle : inactiveStyle]}>
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

function GameCard({ game, color, rank }) {
    const rankColors = ["#ffd700", "#c0c0c0", "#cd7f32", "#4a5568", "#4a5568"];
    const cardStyle = game.corn
        ? [st.gameCard, { borderColor: "#ffd700", borderWidth: 1.5 }]
        : [st.gameCard];

    return (
        <View style={cardStyle}>
            {game.corn ? <Text style={st.cornBadge}>★ SEU JOGO</Text> : null}
            <View style={st.gameTop}>
                <Text style={[st.rankNum, { color: rankColors[rank - 1] || "#4a5568" }]}>#{rank}</Text>
                <BallRow dz={game.dz} color={color} size={BALL_SIZE} />
            </View>
            <View style={st.scoresRow}>
                <ScoreCell label="=15" val={game.e15} atraso={game.a15} color="#ffd700" />
                <ScoreCell label="=14" val={game.e14} atraso={game.a14} color="#00e07a" />
                <ScoreCell label="=13" val={game.e13} atraso={game.a13} color="#00c8ff" />
                <ScoreCell label="=12" val={game.e12} atraso={game.a12} color="#b06df0" />
                <ScoreCell label="=11" val={game.e11} atraso={game.a11} color="#ff9500" />
            </View>
        </View>
    );
}

function Section({ catKey }) {
    const [open, setOpen] = useState(catKey === "15");
    const cat = CATS[catKey];
    const games = TOPS[catKey];
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
                    {games.map((g, i) => (
                        <GameCard key={i} game={g} color={cat.color} rank={g.pos} />
                    ))}
                </View>
            ) : null}
        </View>
    );
}

export default function Elite17DZScreen() {
    const [concurso, setConcurso] = useState(3685);
    const [meuJogo, setMeuJogo] = useState({
        e15: 4, e14: 11, e13: 77, e12: 454, e11: 984,
        a15: 301, a14: 6, a13: 125, a12: 12, a11: 0
    });
    const [ranks, setRanks] = useState(RANKS_PADRAO);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        atualizarDados();
    }, []);

    async function atualizarDados() {
        setLoading(true);
        try {
            // Buscar último concurso
            const resultados = await LotofacilAPI.buscarUltimosResultados(1);
            if (!resultados || resultados.length === 0) return;
            const ultimoConcurso = resultados[0].concurso;
            setConcurso(ultimoConcurso);

            // Buscar JSON do ranking 17dz
            const dados = await LotofacilAPI.fetchRemoteRankings(ultimoConcurso, 17);
            if (!dados) return;

            // Achar o jogo do Cornélio
            const meuJogoData = dados.find(item =>
                JSON.stringify(item.dezenas) === JSON.stringify(CORNELIO_DZ)
            );

            if (meuJogoData) {
                setMeuJogo({
                    e15: meuJogoData.counts["15"] || 0,
                    e14: meuJogoData.counts["14"] || 0,
                    e13: meuJogoData.counts["13"] || 0,
                    e12: meuJogoData.counts["12"] || 0,
                    e11: meuJogoData.counts["11"] || 0,
                    a15: meuJogoData.atraso,
                    a14: meuJogoData.atraso,
                    a13: meuJogoData.atraso,
                    a12: meuJogoData.atraso,
                    a11: meuJogoData.atraso,
                });

                // Calcular rank por categoria
                const novosRanks = {};
                ["15", "14", "13", "12", "11"].forEach(cat => {
                    const sorted = [...dados].sort((a, b) =>
                        (b.counts[cat] || 0) - (a.counts[cat] || 0)
                    );
                    const pos = sorted.findIndex(item =>
                        JSON.stringify(item.dezenas) === JSON.stringify(CORNELIO_DZ)
                    );
                    novosRanks[cat] = pos >= 0 ? `#${pos + 1}` : "?";
                });
                setRanks(novosRanks);
            }
        } catch (e) {
            console.log("Erro ao atualizar Elite17DZ:", e);
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
                    <Text style={st.headerMeta}>1.081.575 combinações · {concurso} concursos</Text>
                    <Text style={st.headerLast}>{`▶ ÚLTIMO: #${concurso} · Atraso = concursos sem aquele score`}</Text>
                    {loading ? <ActivityIndicator color="#00c8ff" style={{ marginTop: 6 }} /> : null}
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
                    <View style={[st.scoresRow, { marginTop: 10 }]}>
                        <ScoreCell label="=15" val={meuJogo.e15} atraso={meuJogo.a15} color="#ffd700" />
                        <ScoreCell label="=14" val={meuJogo.e14} atraso={meuJogo.a14} color="#00e07a" />
                        <ScoreCell label="=13" val={meuJogo.e13} atraso={meuJogo.a13} color="#00c8ff" />
                        <ScoreCell label="=12" val={meuJogo.e12} atraso={meuJogo.a12} color="#b06df0" />
                        <ScoreCell label="=11" val={meuJogo.e11} atraso={meuJogo.a11} color="#ff9500" />
                    </View>
                    <View style={st.ranksRow}>
                        {Object.entries(ranks).map(([cat, rank]) => (
                            <View key={cat} style={[st.rankChip, { borderColor: CATS[cat].color }]}>
                                <Text style={[st.rankChipText, { color: CATS[cat].color }]}>{rank} rank ={cat}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {Object.keys(CATS).map(k => <Section key={k} catKey={k} />)}

                <Text style={st.footer}>{`Lotofácil Concursos 1–${concurso} · LotoMatrix Elite 17DZ`}</Text>
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