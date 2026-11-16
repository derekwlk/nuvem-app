// CONTROLLER: contém a LÓGICA de como buscar/atualizar dados.
import { api } from '../services/api';
import { Pet } from '../models/Pet';
import { salvarJSON, lerJSON, CHAVES } from '../services/armazenamentoLocal';

export async function buscarPrimeiroPet(): Promise<Pet | null> {
  const resposta = await api.get('/pets/');
  return resposta.data.length > 0 ? resposta.data[0] : null;
}
 
 // Tenta a API; se der certo, atualiza o cache. Se falhar (sem internet),
// devolve o último pet salvo e avisa que veio do cache.
export async function buscarPetComCache(): Promise<{ pet: Pet | null; deCache: boolean }> {
  try {
    const pet = await buscarPrimeiroPet();
    if (pet) {
      await salvarJSON(CHAVES.ultimoPet, pet);
      await salvarJSON(CHAVES.usuarioId, pet.usuario);
    }
    return { pet, deCache: false };
  } catch {
    const pet = await lerJSON<Pet>(CHAVES.ultimoPet);
    return { pet, deCache: true };
  }
}