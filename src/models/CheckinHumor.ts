// MODEL: forma dos dados de um check-in de humor.
export interface CheckinHumor {
  usuario_id: string;
  emoji: string;
  texto_livre?: string;
}