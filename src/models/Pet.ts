// MODEL: aqui não existe nenhuma lógica, só a FORMA dos dados.
// Os campos abaixo são exatamente os mesmos que já existem no
// model Pet do Django (pets/models.py).

export interface Pet {
  id: string;
  usuario: string;
  nome: string;
  nivel: number;
  xp: number;
  moedas: number;
}