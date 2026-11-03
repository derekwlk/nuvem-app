// CONTROLLER: contém a LÓGICA de como buscar/atualizar dados.
import { api } from '../services/api';
import { Pet } from '../models/Pet';

export async function buscarPrimeiroPet(): Promise<Pet | null> {
  const resposta = await api.get('/pets/');
  return resposta.data.length > 0 ? resposta.data[0] : null;
}