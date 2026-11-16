// src/services/sincronizacao.ts — envia ao servidor o que ficou pendente
import NetInfo from '@react-native-community/netinfo';
import { api } from './api';
import { listarPendentes, marcarEnviado, registrarFalha } from './bancoLocal';
import { salvarJSON, CHAVES } from './armazenamentoLocal';

let sincronizando = false;   // evita duas sincronizações ao mesmo tempo

export async function sincronizarPendentes(): Promise<number> {
  if (sincronizando) return 0;
  sincronizando = true;
  let enviados = 0;
  try {
    const rede = await NetInfo.fetch();
    if (!rede.isConnected) return 0;               // sem internet: tenta depois

    for (const c of await listarPendentes()) {     // do mais antigo ao mais novo
      try {
        await api.post('/checkins-humor/', {
          id_cliente: c.id,                        // o servidor ignora duplicados
          usuario_id: c.usuario_id,
          emoji: c.emoji,
          texto_livre: c.texto_livre,
          criado_em: c.criado_em,
        });
        await marcarEnviado(c.id);
        enviados++;
      } catch {
        await registrarFalha(c.id);                // fica para a próxima rodada
      }
    }
    if (enviados > 0) await salvarJSON(CHAVES.ultimaSync, new Date().toISOString());
    return enviados;
  } finally {
    sincronizando = false;
  }
}

// Escuta a conexão: assim que a internet volta, sincroniza sozinho.
// Devolve a função que "desliga" a escuta (use no cleanup do useEffect).
export function iniciarSincronizacaoAutomatica() {
  return NetInfo.addEventListener((estado) => {
    if (estado.isConnected) sincronizarPendentes();
  });
}