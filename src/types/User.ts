export interface User {
  id: string;
  nome: string;
  cargo: string;
  status: string;
  tipo: string;
  gam_guid: string;
  id_vendedor_vinculado?: number | null;
  id_cliente_vinculado?: number | null;
  id_operador?: number | null;
}

// Enum para status do usuário
export enum UsuarioStatus {
  ATIVO = "ativo",
  INATIVO = "inativo",
  SUSPENSO = "suspenso",
}

// Enum para tipos de usuário
export enum UsuarioTipo {
  ADMIN = "admin",
  VENDEDOR = "vendedor",
  CONSULTOR = "consultor",
  OPERADOR = "operador",
}
