# Filtros Simplificados - Nexus Leads

## Resumo das Mudanças

O sistema de filtros foi completamente simplificado para seguir o padrão solicitado:

1. **Carrega dados iniciais**
2. **Usuário altera um filtro**
3. **Busca novamente no banco com os filtros setados**
4. **Retorna os dados filtrados**

## Arquivos Modificados

### 1. `src/hooks/use-leads.ts`

- **Simplificado:** Removido `refetch` desnecessário
- **Comportamento:** Carrega dados iniciais uma vez e permite busca com filtros
- **Interface:** `fetchLeads(filters)` para buscar com filtros específicos

### 2. `src/hooks/use-leads-totais.ts`

- **Simplificado:** Removida toda lógica complexa de filtros locais
- **Removido:** `applyFilters`, `useMemo` complexo, filtros dinâmicos
- **Comportamento:** Busca direta na API com filtros
- **Interface:** `fetchTotais(filters)` para buscar com filtros específicos

### 3. `src/pages/Index.tsx`

- **Simplificado:** Removidos `useEffect` automáticos complexos
- **Removido:** `useMemo` para filtros, aplicação automática
- **Comportamento:**
  - Carrega dados iniciais
  - Quando filtros mudam → chama `handleFiltersChange`
  - `handleFiltersChange` → busca leads e totais com novos filtros

### 4. `src/components/dashboard/FilterSection.tsx`

- **Restaurado:** Botão "Aplicar Filtros"
- **Removido:** Aplicação automática de filtros
- **Comportamento:** Usuário altera filtros → clica "Aplicar Filtros" → busca no banco

## Fluxo Atual

```
1. App inicia → Carrega dados iniciais (sem filtros)
   ↓
2. Usuário altera filtros na interface
   ↓
3. Usuário clica "Aplicar Filtros"
   ↓
4. handleFiltersChange() é chamado
   ↓
5. fetchLeads(filtros) + fetchTotais(filtros) são executados
   ↓
6. API retorna dados filtrados
   ↓
7. Interface atualiza com novos dados
```

## Vantagens da Simplificação

✅ **Controle total:** Usuário decide quando buscar
✅ **Performance:** Não faz buscas desnecessárias
✅ **Simplicidade:** Código mais direto e fácil de entender
✅ **Debugging:** Mais fácil identificar problemas
✅ **API-First:** Toda filtragem é feita no banco de dados

## Funcionamento dos Filtros

### Filtros de Leads (`ILeadsFilters`)

- `data_criacao_inicio` / `data_criacao_fim` (formato: YYYY-MM-DD)
- `situacao` (string com situações separadas por vírgula)
- `origem`
- `tipo_procura`
- `nome`
- `email`
- `id_consultor`
- `id_vendedor`

### Filtros de Totais (`ILeadsTotaisFilters`)

- `data_criacao_inicio` / `data_criacao_fim` (formato: YYYY-MM-DD)

## Teste do Sistema

Para testar se está funcionando:

1. **Abrir a aplicação** → Deve carregar dados iniciais
2. **Alterar qualquer filtro** → Não deve buscar automaticamente
3. **Clicar "Aplicar Filtros"** → Deve fazer nova busca na API
4. **Verificar no Network** → Deve mostrar requisições para `/leads` e `/leads/totais`
5. **Clicar "Limpar Filtros"** → Deve limpar filtros e buscar novamente

## Configuração

Certifique-se de que a API está configurada corretamente:

```env
VITE_API_BASE_URL=http://localhost:8001
```

O sistema agora está completamente simplificado e segue exatamente o padrão solicitado!
