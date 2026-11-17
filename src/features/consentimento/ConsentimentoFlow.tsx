
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';

import AvisoAdulto from './AvisoAdulto';
import TermoConsentimento from './TermoConsentimento';
import { COLORS } from './cores';
import {
  ConsentimentoProps,
} from './tipos';

type Passo = 'aviso' | 'termo';

export default function ConsentimentoFlow({
  onAceitar,
  onRecusar,
}: ConsentimentoProps) {
  // Controla qual das duas telas está visível.
  const [passo, setPasso] = useState<Passo>('aviso');

  // Guarda as respostas das duas caixas de seleção.
  const [aceiteUso, setAceiteUso] = useState(false);
  const [aceiteCrianca, setAceiteCrianca] = useState(false);

  // Guarda o nome digitado e o estado de expansão do termo.
  const [nome, setNome] = useState('');
  const [termoAberto, setTermoAberto] = useState(false);

  // O botão só fica habilitado quando tudo estiver preenchido.
  const podeContinuar =
    aceiteUso &&
    aceiteCrianca &&
    nome.trim().length >= 3;

  // Pede confirmação antes de registrar a recusa.
  function confirmarRecusa() {
    Alert.alert(
      'Sem a sua autorização...',
      'A criança não poderá usar o aplicativo. Quer mesmo sair?',
      [
        {
          text: 'Voltar',
          style: 'cancel',
        },
        {
          text: 'Não concordo',
          onPress: onRecusar,
        },
      ],
    );
  }

  // Ao aceitar, envia os dados para a função recebida por props.
  function aceitarTermo() {
    if (!podeContinuar) {
      return;
    }

    onAceitar({
      nomeResponsavel: nome.trim(),
      aceiteUso,
      aceiteCrianca,
    });
  }

  // Primeira etapa: aviso destinado ao adulto responsável.
  if (passo === 'aviso') {
    return (
      <AvisoAdulto
        onContinuar={() => setPasso('termo')}
      />
    );
  }

  // Segunda etapa: formulário rolável e adaptável ao teclado.
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TermoConsentimento
          nome={nome}
          setNome={setNome}
          aceiteUso={aceiteUso}
          setAceiteUso={setAceiteUso}
          aceiteCrianca={aceiteCrianca}
          setAceiteCrianca={setAceiteCrianca}
          termoAberto={termoAberto}
          setTermoAberto={setTermoAberto}
          podeContinuar={podeContinuar}
          onAceitar={aceitarTermo}
          onRecusar={confirmarRecusa}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.fundoSuave,
  },
  conteudo: {
    flexGrow: 1,
  },
});
