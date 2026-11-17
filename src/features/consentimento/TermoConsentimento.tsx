
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { COLORS, SOMBRA } from './cores';
import { CARTOES, TERMO_COMPLETO } from './textos';
import CartaoInfo from './CartaoInfo';
import LinhaCheckbox from './LinhaCheckbox';

interface TermoConsentimentoProps {
  nome: string;
  setNome: (nome: string) => void;
  aceiteUso: boolean;
  setAceiteUso: (valor: boolean) => void;
  aceiteCrianca: boolean;
  setAceiteCrianca: (valor: boolean) => void;
  termoAberto: boolean;
  setTermoAberto: (valor: boolean) => void;
  podeContinuar: boolean;
  onAceitar: () => void;
  onRecusar: () => void;
}

export default function TermoConsentimento({
  nome,
  setNome,
  aceiteUso,
  setAceiteUso,
  aceiteCrianca,
  setAceiteCrianca,
  termoAberto,
  setTermoAberto,
  podeContinuar,
  onAceitar,
  onRecusar,
}: TermoConsentimentoProps) {
  return (
    <View style={styles.container}>
      {/* Identifica o ambiente de demonstração. */}
      <Text style={styles.etiqueta}>
        DEMONSTRAÇÃO · dados fictícios
      </Text>

      <Text style={styles.titulo}>
        Autorização do responsável
      </Text>

      <Text style={styles.subtitulo}>
        Conheça o aplicativo antes de autorizar o uso.
      </Text>

      {/* Exibe os cinco cartões definidos em textos.ts. */}
      {CARTOES.map((cartao) => (
        <CartaoInfo
          key={cartao.id}
          icone={cartao.icone}
          titulo={cartao.titulo}
          texto={cartao.texto}
        />
      ))}

      {/* Abre ou fecha o conteúdo do termo completo. */}
      <TouchableOpacity
        style={styles.linkTermo}
        onPress={() => setTermoAberto(!termoAberto)}
        accessibilityRole="button"
        accessibilityLabel={
          termoAberto
            ? 'Fechar termo completo'
            : 'Ler o termo completo'
        }
      >
        <Text style={styles.textoLink}>
          {termoAberto
            ? 'Ler o termo completo ▴'
            : 'Ler o termo completo ▾'}
        </Text>
      </TouchableOpacity>

      {termoAberto && (
        <View style={styles.cartaoTermo}>
          <Text style={styles.textoTermo}>
            {TERMO_COMPLETO}
          </Text>
        </View>
      )}

      {/* As duas autorizações são independentes. */}
      <View style={styles.cartaoAceites}>
        <LinhaCheckbox
          marcado={aceiteUso}
          texto="Li e entendi como os dados são usados"
          onAlternar={() => setAceiteUso(!aceiteUso)}
        />

        <LinhaCheckbox
          marcado={aceiteCrianca}
          texto="Autorizo a criança a usar o aplicativo"
          onAlternar={() => setAceiteCrianca(!aceiteCrianca)}
        />
      </View>

      {/* Campo de texto para o nome do responsável. */}
      <Text style={styles.rotulo}>
        Nome do responsável
      </Text>

      <TextInput
        style={styles.campo}
        value={nome}
        onChangeText={setNome}
        placeholder="Digite seu nome"
        placeholderTextColor={COLORS.textoSecundario}
        accessibilityLabel="Nome do responsável"
        autoCapitalize="words"
        returnKeyType="done"
      />

      {/* Só permite continuar quando os três requisitos forem cumpridos. */}
      <TouchableOpacity
        style={[
          styles.botao,
          !podeContinuar && styles.botaoDesabilitado,
        ]}
        onPress={onAceitar}
        disabled={!podeContinuar}
        accessibilityRole="button"
        accessibilityState={{ disabled: !podeContinuar }}
        accessibilityLabel="Concordo e continuar"
      >
        <Text style={styles.textoBotao}>
          Concordo e continuar
        </Text>
      </TouchableOpacity>

      {/* A recusa pede confirmação no componente que controla o fluxo. */}
      <TouchableOpacity
        style={styles.botaoRecusar}
        onPress={onRecusar}
        accessibilityRole="button"
        accessibilityLabel="Não concordo"
      >
        <Text style={styles.textoRecusar}>
          Não concordo
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 32,
  },
  etiqueta: {
    color: COLORS.coralEscuro,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  titulo: {
    color: COLORS.textoPrincipal,
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    color: COLORS.textoSecundario,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  linkTermo: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  textoLink: {
    color: COLORS.coralEscuro,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartaoTermo: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    ...SOMBRA,
  },
  textoTermo: {
    color: COLORS.textoPrincipal,
    fontSize: 15,
    lineHeight: 24,
  },
  cartaoAceites: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 12,
    marginTop: 8,
    marginBottom: 20,
    ...SOMBRA,
  },
  rotulo: {
    color: COLORS.textoPrincipal,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  campo: {
    minHeight: 52,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    color: COLORS.textoPrincipal,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.trilho,
    marginBottom: 20,
  },
  botao: {
    minHeight: 52,
    backgroundColor: COLORS.coral,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  botaoDesabilitado: {
    backgroundColor: COLORS.trilho,
  },
  textoBotao: {
    color: COLORS.textoPrincipal,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  botaoRecusar: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  textoRecusar: {
    color: COLORS.coralEscuro,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
