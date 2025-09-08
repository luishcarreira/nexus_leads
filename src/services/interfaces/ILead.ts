export interface ILead {
  id: number;
  id_integracao: string;
  nome: string;
  telefone: string;
  telefone_tratado: string;
  email: string;
  tem_ponto: string | null;
  data_criacao: string;
  plataforma: string;
  formulario: string;
  procura_para: string | null;
  data_prevista_aquisicao: string | null;
  tem_academia_projeto: string | null;
  melhor_horario: string | null;
  como_contatar: string | null;
  uf: string;
  cidade: string | null;
  campanha: string;
  conjunto_anuncio: string | null;
  data_hora_inclusao: string;
  situacao: string;
  id_cliente: number | null;
  ultimo_pedido: number;
  consultor: string | null;
  vendedor: string | null;
  origem: string;
  etapa: string;
}

export interface ILeadsResponse {
  data: ILead[];
  total: number;
}

export interface ILeadsFilters {
  email?: string;
  telefone?: string;
  nome?: string;
  data_criacao_inicio?: string;
  data_criacao_fim?: string;
  hora_criacao_inicio?: string;
  hora_criacao_fim?: string;
  situacao?: string;
  origem?: string;
  tipo_procura?: string;
  uf?: string; // filtro por UF
  etapa?: string;
  id_consultor?: number;
  id_vendedor?: number;
  pagina?: number;
  limite?: number;
  order_by?: string;
  order_header?: string;
  transferido?: boolean | null; // Campo para filtrar transferidos/não transferidos
  somente_leads_convertidos?: boolean; // Novo filtro para Clientes
}

// Interfaces para os totais de leads
export interface ITotalPorOrigem {
  origem: string;
  total: number;
}

export interface ITotalPorTipoProcura {
  tipo_procura: string;
  total: number;
}

export interface ILeadsTotais {
  total_leads: number;
  total_por_origem: ITotalPorOrigem[];
  total_por_tipo_procura: ITotalPorTipoProcura[];
  total_transferidos: number;
  total_nao_transferidos: number;
}

// Interfaces para totais detalhados com leads
export interface ITotalPorOrigemDetalhado {
  origem: string;
  total: number;
  leads: {
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
    dados: ILeadTotal[];
  };
}

export interface ITotalPorTipoProcuraDetalhado {
  tipo_procura: string;
  total: number;
  leads: {
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
    dados: ILeadTotal[];
  };
}

export interface ILeadsTotaisDetalhados {
  total_leads: number;
  totais_por_origem: ITotalPorOrigemDetalhado[];
  total_por_tipo_procura: ITotalPorTipoProcuraDetalhado[];
  transferidos: {
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
    dados: ILeadTotal[];
  };
  nao_transferidos: {
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
    dados: ILeadTotal[];
  };
}

export interface ILeadsTotaisFilters {
  data_criacao_inicio?: string;
  data_criacao_fim?: string;
  hora_criacao_inicio?: string;
  hora_criacao_fim?: string;
  pagina?: number;
  limite?: number;
  origem?: string;
  tipo_procura?: string;
  transferidos?: boolean;
  nao_transferidos?: boolean;
  transferido?: boolean | null; // Novo campo para identificar transferido/não transferido ou totais
}

// Interfaces para os dropdowns
export interface IEtapaLead {
  id: number;
  descricao: string;
  ordem: string;
}

export interface ISituacaoLead {
  id: number;
  descricao: string;
}

export interface IConsultor {
  codigo: number;
  nome: string;
}

// Interface para leads dos totais (estrutura diferente da API)
export interface ILeadTotal {
  id: number;
  nome: string;
  telefone: string;
  email: string | null;
  cidade: string | null;
  uf: string | null;
  data_criacao: string;
  vendedor: string | null;
  consultor: string | null;
  situacao: string;
  origem: string;
  procura_para: string | null;
}

// Interface para atividades do lead
export interface ILeadAtividade {
  id: number;
  id_lead: number;
  assunto: string;
  detalhe: string;
  tipo: number;
  data_agenda: string;
  hora_agenda: string;
  detalhe_retorno: string;
}

// Interface para totais por vendedor com breakdown por tipo de procura
export interface ITotalPorVendedor {
  id_vendedor: number;
  vendedor: string;
  total: number;
  totais_por_tipo_procura: ITotalPorTipoProcura[];
}

export interface IVendedoresTotais {
  totais_por_vendedor: ITotalPorVendedor[];
  total_vendedores: number;
}

// Interface para leads convertidos em clientes (relatório de motivos de perda)
export interface ILeadConvertidoCliente {
  pessoa_codigo?: number;
  pessoa_status?: string;
  pessoa_data_cadastro?: string;
  pessoa_razao_social?: string;
  pessoa_nome_fantasia?: string;
  pessoa_telefone?: string;
  pessoa_email?: string;
  pessoa_endereco?: string;
  pessoa_complemento?: string;
  pessoa_bairro?: string;
  pessoa_cidade?: string;
  pessoa_uf?: string;
  pessoa_fisica_juridica?: string;
  pessoa_cnpj?: string;
  operador_id?: number;
  operador_nome?: string;
  representante_id?: number;
  representante_nome?: string;
  cliente_dt_ultima_fatura?: string;
  consultor_id?: number;
  consultor_nome?: string;
  pessoa_pes_sts?: string;
  pessoa_aniversario?: string;
  cliente_data_proxima_ligacao?: string;
  data_ultimo_pedido?: string;
  vendas_qtd_notas_periodo?: number;
  vendas_total_periodo?: number;
  total_vendas_ultimos_365?: number;
  qtd_pedidos_365?: number;
  status_cliente_vendas?: string;
  qtd_pedidos_ano_2?: number;
  valor_pedidos_ano_2?: number;
  qtd_pedidos_ano_1?: number;
  valor_pedidos_ano_1?: number;
  qtd_pedidos_ano?: number;
  valor_pedidos_ano?: number;
  ultimo_pedido_venda?: number;
  valor_ultimo_pedido?: number;
  data_prev_fecha?: string;
  procura_para?: string;
  data_aquisicao?: string;
  tem_projeto_academia?: string;
  melhor_horario_contato?: string;
  como_contactar?: string;
  data_hora_criacao?: string;
  source_name?: string;
  motivo_perda?: string;
}

export interface ILeadsConvertidosClientesResponse {
  data: ILeadConvertidoCliente[];
  total: number;
}

export interface ILeadsConvertidosClientesFilters {
  pessoa_codigo?: number;
  pessoa_status?: string;
  pessoa_data_cadastro_inicio?: string;
  pessoa_data_cadastro_fim?: string;
  pessoa_razao_social?: string;
  pessoa_nome_fantasia?: string;
  pessoa_telefone?: string;
  pessoa_email?: string;
  pessoa_cidade?: string;
  pessoa_uf?: string;
  pessoa_cnpj?: string;
  operador_id?: number;
  representante_id?: number;
  consultor_id?: number;
  pessoa_aniversario_inicio?: string;
  pessoa_aniversario_fim?: string;
  procura_para?: string;
  source_name?: string;
  motivo_perda?: string;
  pagina?: number;
  limite?: number;
  order_by?: string;
  order_header?: string;
}

// Interface para dropdown de motivos de perda
export interface IMotivoPerda {
  id: number;
  descricao: string;
}
