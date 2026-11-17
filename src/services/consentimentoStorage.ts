import * as FileSystem from 'expo-file-system/legacy';
import type { DadosConsentimento } from '@/features/consentimento/tipos';

export type ConsentimentoRegistrado = DadosConsentimento & {
  aceitoEm: string;
  versaoTermo: string;
};

const CONSENTIMENTO_FILE = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}nuvinha-consentimento.json`
  : null;
const WEB_CONSENTIMENTO_KEY = 'nuvinha-consentimento.v1';

export async function lerConsentimento(): Promise<ConsentimentoRegistrado | null> {
  try {
    let raw: string | null = null;

    if (!CONSENTIMENTO_FILE) {
      if (typeof localStorage === 'undefined') return null;
      raw = localStorage.getItem(WEB_CONSENTIMENTO_KEY);
    } else {
      const info = await FileSystem.getInfoAsync(CONSENTIMENTO_FILE);
      if (!info.exists) return null;
      raw = await FileSystem.readAsStringAsync(CONSENTIMENTO_FILE);
    }

    if (!raw) return null;
    return validarConsentimento(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function salvarConsentimento(
  consentimento: ConsentimentoRegistrado,
): Promise<void> {
  const conteudo = JSON.stringify(consentimento);

  if (!CONSENTIMENTO_FILE) {
    if (typeof localStorage === 'undefined') {
      throw new Error('O armazenamento local não está disponível.');
    }
    localStorage.setItem(WEB_CONSENTIMENTO_KEY, conteudo);
    return;
  }

  await FileSystem.writeAsStringAsync(CONSENTIMENTO_FILE, conteudo);
}

function validarConsentimento(value: unknown): ConsentimentoRegistrado | null {
  if (!value || typeof value !== 'object') return null;

  const registro = value as Partial<ConsentimentoRegistrado>;
  if (
    typeof registro.nomeResponsavel !== 'string' ||
    registro.nomeResponsavel.trim().length < 3 ||
    registro.aceiteUso !== true ||
    registro.aceiteCrianca !== true ||
    typeof registro.aceitoEm !== 'string' ||
    typeof registro.versaoTermo !== 'string'
  ) {
    return null;
  }

  return {
    nomeResponsavel: registro.nomeResponsavel.trim(),
    aceiteUso: true,
    aceiteCrianca: true,
    aceitoEm: registro.aceitoEm,
    versaoTermo: registro.versaoTermo,
  };
}
