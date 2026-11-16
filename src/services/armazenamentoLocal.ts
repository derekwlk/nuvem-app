import AsyncStorage from '@react-native-async-storage/async-storage';
 
// Todas as chaves ficam aqui, num só lugar (evita erro de digitação)
export const CHAVES = {
  ultimoPet: 'nuvinha:ultimoPet',              // cache do pet (JSON)
  usuarioId: 'nuvinha:usuarioId',              // quem está usando o app
  consentimento: 'nuvinha:consentimento',      // aceite do responsável + data
  ultimaSync: 'nuvinha:ultimaSincronizacao',   // data/hora do último envio
} as const;
 
// O AsyncStorage só guarda TEXTO; por isso convertemos de/para JSON
export async function salvarJSON<T>(chave: string, valor: T): Promise<void> {
  await AsyncStorage.setItem(chave, JSON.stringify(valor));
}
 
export async function lerJSON<T>(chave: string): Promise<T | null> {
  const bruto = await AsyncStorage.getItem(chave);
  return bruto ? (JSON.parse(bruto) as T) : null;
}
 
export async function removerChave(chave: string): Promise<void> {
  await AsyncStorage.removeItem(chave);
}
 