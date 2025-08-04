# Changelog - Nexus Leads

## [2024-01-XX] - Correção do Filtro de Período e Remoção de Dados Mock

### Mudanças Realizadas

#### 1. Correção do Filtro de Período

- **Problema identificado:** As datas estavam sendo enviadas no formato JavaScript Date object com timezone, causando erro na API
- **Solução implementada:**
  - Adicionada função `formatDateForAPI` que converte datas para formato `YYYY-MM-DD`
  - Modificada interface `UIFilters` para usar `Date` em vez de `string`
  - Corrigida conversão de datas nos filtros de leads e totais
  - Aplicação automática de filtros quando datas são alteradas

#### 2. Remoção Completa dos Dados Mock

- **Arquivos removidos:**
  - `src/data/mockLeads.ts`
  - `src/data/mockDropdowns.ts`
  - Diretório `src/data/` (agora vazio)

#### 3. Modificação dos Hooks de Dados

- **`src/hooks/use-leads.ts`:**

  - Removidas importações de dados mock
  - Removido fallback para dados mock em caso de erro
  - Melhorado tratamento de erros para limpar dados em caso de falha
  - Corrigido `useEffect` para evitar loops infinitos

- **`src/hooks/use-leads-totais.ts`:**

  - Removidos dados mock hardcoded
  - Removido fallback para dados mock em caso de erro
  - Melhorado tratamento de erros
  - Corrigido `useEffect` para evitar loops infinitos

- **`src/hooks/use-dropdowns.ts`:**
  - Removidas importações de dados mock
  - Removido fallback para dados mock em caso de erro
  - Melhorado tratamento de erros para limpar dados em caso de falha
  - Corrigido `useEffect` para evitar loops infinitos

#### 4. Melhorias no HttpClient

- **`src/services/httpClient.ts`:**
  - Melhorado tratamento de erros de rede
  - Adicionadas mensagens de erro mais específicas
  - Melhor logging para debugging

#### 5. Melhorias na Aplicação de Filtros

- **`src/pages/Index.tsx`:**

  - Adicionado `useEffect` para aplicar filtros automaticamente
  - Melhorada sincronização entre filtros de leads e totais
  - Aplicação automática de filtros quando mudam
  - **Correção das datas:** Formatação correta para API (`YYYY-MM-DD`)

- **`src/components/dashboard/FilterSection.tsx`:**
  - Aplicação automática de filtros quando qualquer filtro muda
  - Removido botão "Aplicar Filtros" (agora automático)
  - Melhorada experiência do usuário

### Comportamento Atual

1. **Busca de Dados:**

   - Todos os dados são buscados exclusivamente da API
   - Não há mais fallback para dados mock
   - Em caso de erro da API, os dados são limpos (arrays vazios)

2. **Tratamento de Erros:**

   - Erros de rede são tratados com mensagens específicas
   - Interface mostra mensagens de erro claras
   - Botão "Tentar novamente" disponível em caso de falha

3. **Filtros:**
   - **Filtro de período corrigido:** Datas enviadas no formato correto (`YYYY-MM-DD`)
   - Filtros são aplicados automaticamente quando mudam
   - Sincronização entre filtros de leads e totais
   - Busca em tempo real conforme filtros são alterados

### Configuração da API

A URL da API é configurada através da variável de ambiente `VITE_API_BASE_URL`:

- **Padrão:** `http://localhost:8001`
- **Configuração:** Criar arquivo `.env` na raiz do projeto com:
  ```
  VITE_API_BASE_URL=http://localhost:8001
  ```

### Próximos Passos

1. **Configurar a URL da API** no arquivo `.env`
2. **Verificar se o servidor da API está rodando** na porta configurada
3. **Testar a aplicação** para garantir que os dados estão sendo carregados corretamente
4. **Testar o filtro de período** para confirmar que as datas estão sendo enviadas corretamente

### Notas Importantes

- A aplicação agora depende exclusivamente da API
- Em caso de falha da API, a interface mostrará mensagens de erro
- Não há mais dados de demonstração disponíveis
- Todos os filtros funcionam em tempo real com a API
- **Filtro de período corrigido:** Agora envia datas no formato `YYYY-MM-DD` que a API espera
