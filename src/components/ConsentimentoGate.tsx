import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ConsentimentoFlow from '@/features/consentimento/ConsentimentoFlow';
import { COLORS } from '@/features/consentimento/cores';
import type { DadosConsentimento } from '@/features/consentimento/tipos';
import { lerConsentimento, salvarConsentimento } from '@/services/consentimentoStorage';

type Estado = 'verificando' | 'pendente' | 'aceito' | 'recusado';

interface ConsentimentoGateProps {
  children: React.ReactNode;
}

const VERSAO_TERMO = '1.0';

export default function ConsentimentoGate({ children }: ConsentimentoGateProps) {
  const [estado, setEstado] = useState<Estado>('verificando');
  const [reinicio, setReinicio] = useState(0);

  useEffect(() => {
    let ativo = true;

    lerConsentimento().then((registro) => {
      if (ativo) setEstado(registro ? 'aceito' : 'pendente');
    });

    return () => {
      ativo = false;
    };
  }, []);

  async function aceitar(dados: DadosConsentimento) {
    try {
      await salvarConsentimento({
        ...dados,
        nomeResponsavel: dados.nomeResponsavel.trim(),
        aceitoEm: new Date().toISOString(),
        versaoTermo: VERSAO_TERMO,
      });
      setEstado('aceito');
    } catch {
      Alert.alert(
        'Não foi possível salvar',
        'A autorização não foi registrada. Verifique o armazenamento do dispositivo e tente novamente.',
      );
    }
  }

  function voltarAoConsentimento() {
    setReinicio((atual) => atual + 1);
    setEstado('pendente');
  }

  if (estado === 'verificando') {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator size="large" color={COLORS.coralEscuro} />
        <Text style={styles.textoCarregando}>Verificando autorização...</Text>
      </View>
    );
  }

  if (estado === 'pendente') {
    return (
      <ConsentimentoFlow
        key={reinicio}
        onAceitar={aceitar}
        onRecusar={() => setEstado('recusado')}
      />
    );
  }

  if (estado === 'recusado') {
    return (
      <View style={styles.recusado}>
        <Text style={styles.titulo}>Autorização não concedida</Text>
        <Text style={styles.mensagem}>
          O Nuvem App não pode ser utilizado sem a autorização do responsável.
          Nenhuma tela do aplicativo foi aberta.
        </Text>
        <Pressable
          style={styles.botao}
          onPress={voltarAoConsentimento}
          accessibilityRole="button"
        >
          <Text style={styles.textoBotao}>Revisar consentimento</Text>
        </Pressable>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  carregando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.fundoSuave,
    gap: 12,
  },
  textoCarregando: {
    color: COLORS.textoSecundario,
    fontSize: 15,
  },
  recusado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
    backgroundColor: COLORS.fundoSuave,
  },
  titulo: {
    color: COLORS.textoPrincipal,
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  mensagem: {
    color: COLORS.textoSecundario,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  botao: {
    minHeight: 52,
    width: '100%',
    borderRadius: 28,
    backgroundColor: COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  textoBotao: {
    color: COLORS.textoPrincipal,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
