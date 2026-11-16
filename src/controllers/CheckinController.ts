// CONTROLLER: lógica de como enviar um check-in de humor pro backend.
import { api } from '../services/api';
import { CheckinHumor } from '../models/CheckinHumor';
import { inserirCheckin } from '../services/bancoLocal';
import { sincronizarPendentes } from '../services/sincronizacao';

export async function enviarCheckinHumor(checkin: CheckinHumor) {
  const resposta = await api.post('/checkins-humor/', checkin);
  return resposta.data;
}
  // OFFLINE-FIRST: grava no SQLite primeiro (nunca falha por falta de
// internet) e só depois tenta enviar ao servidor.
export async function registrarCheckin(usuarioId: string, emoji: string, textoLivre: string) {
  await inserirCheckin({
    id: novoIdLocal(),
    usuario_id: usuarioId,
    emoji,
    texto_livre: textoLivre,
    criado_em: new Date().toISOString(),
  });
  sincronizarPendentes();      // sem "await": roda em segundo plano
}

function novoIdLocal() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}