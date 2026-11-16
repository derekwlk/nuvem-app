import * as SQLite from 'expo-sqlite';
 
export type StatusCheckin = 'pendente' | 'enviado' | 'erro';
 
export interface CheckinLocal {
  id: string;              // id gerado no celular (também vai ao servidor)
  usuario_id: string;
  emoji: string;
  texto_livre: string;
  criado_em: string;       // data/hora ISO do momento em que a criança enviou
  status: StatusCheckin;
  tentativas: number;
}
 
let bancoPromise: Promise<SQLite.SQLiteDatabase> | null = null;
 
// Abre o banco UMA vez e cria a tabela se ela ainda não existir
export function abrirBanco() {
  if (!bancoPromise) {
    bancoPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('nuvinha.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS checkins_locais (
          id          TEXT PRIMARY KEY NOT NULL,
          usuario_id  TEXT NOT NULL,
          emoji       TEXT NOT NULL,
          texto_livre TEXT NOT NULL DEFAULT '',
          criado_em   TEXT NOT NULL,
          status      TEXT NOT NULL DEFAULT 'pendente',
          tentativas  INTEGER NOT NULL DEFAULT 0
        );
      `);
      return db;
    })();
  }
  return bancoPromise;
}
 
// Grava um check-in novo (sempre começa como "pendente")
export async function inserirCheckin(c: Omit<CheckinLocal, 'status' | 'tentativas'>) {
  const db = await abrirBanco();
  await db.runAsync(
    'INSERT INTO checkins_locais (id, usuario_id, emoji, texto_livre, criado_em) VALUES (?, ?, ?, ?, ?)',
    [c.id, c.usuario_id, c.emoji, c.texto_livre, c.criado_em],
  );
}
 
// Tudo que ainda não foi enviado, do mais antigo ao mais novo
export async function listarPendentes(): Promise<CheckinLocal[]> {
  const db = await abrirBanco();
  return db.getAllAsync<CheckinLocal>(
    "SELECT * FROM checkins_locais WHERE status != 'enviado' ORDER BY criado_em ASC",
  );
}
 
// Todos os registros (usado para gerar evidências)
export async function listarTodos(): Promise<CheckinLocal[]> {
  const db = await abrirBanco();
  return db.getAllAsync<CheckinLocal>('SELECT * FROM checkins_locais ORDER BY criado_em DESC');
}
 
export async function marcarEnviado(id: string) {
  const db = await abrirBanco();
  await db.runAsync("UPDATE checkins_locais SET status = 'enviado' WHERE id = ?", [id]);
}
 
export async function registrarFalha(id: string) {
  const db = await abrirBanco();
  await db.runAsync(
    "UPDATE checkins_locais SET status = 'erro', tentativas = tentativas + 1 WHERE id = ?",
    [id],
  );
}
 
export async function contarPendentes(): Promise<number> {
  const db = await abrirBanco();
  const linha = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) AS n FROM checkins_locais WHERE status != 'enviado'",
  );
  return linha?.n ?? 0;
}