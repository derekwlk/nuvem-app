import type { DadosConsentimento } from '@/features/consentimento/tipos';

export type ConsentimentoRegistrado = DadosConsentimento & {
  aceitoEm: string;
  versaoTermo: string;
};

const STORAGE_KEY = 'nuvinha.consentimento.v1';

export async function lerConsentimento(): Promise<ConsentimentoRegistrado | null> {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const value = JSON.parse(raw) as Partial<ConsentimentoRegistrado>;
    if (
      typeof value.nomeResponsavel !== 'string' ||
      value.nomeResponsavel.trim().length < 3 ||
      value.aceiteUso !== true ||
      value.aceiteCrianca !== true ||
      typeof value.aceitoEm !== 'string' ||
      typeof value.versaoTermo !== 'string'
    ) {
      return null;
    }

    return {
      nomeResponsavel: value.nomeResponsavel.trim(),
      aceiteUso: true,
      aceiteCrianca: true,
      aceitoEm: value.aceitoEm,
      versaoTermo: value.versaoTermo,
    };
  } catch {
    return null;
  }
}

export async function salvarConsentimento(
  consentimento: ConsentimentoRegistrado,
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('O armazenamento local não está disponível.');
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consentimento));
}
