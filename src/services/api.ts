// SERVICE: essa é a ÚNICA parte do app que sabe o endereço da API.
import axios from 'axios';

// ATENÇÃO: use o IP da sua máquina na rede (o mesmo que aparece
// no terminal quando você roda "npx expo start", tipo "10.0.0.107"),
// nunca "localhost" — no celular físico, "localhost" não funciona.
const BASE_URL = 'http://192.168.100.9:8000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});