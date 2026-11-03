// CONTROLLER: lógica de como enviar um check-in de humor pro backend.
import { api } from '../services/api';
import { CheckinHumor } from '../models/CheckinHumor';

export async function enviarCheckinHumor(checkin: CheckinHumor) {
  const resposta = await api.post('/checkins-humor/', checkin);
  return resposta.data;
}