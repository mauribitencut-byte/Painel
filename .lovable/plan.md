
# Plano de Implementacao - CRM Imobiliario

## Resumo

Este plano cria um CRM imobiliario moderno usando React/Vite com Supabase como backend, baseado na analise dos documentos de auditoria do sistema legado.

## Problemas a Resolver Primeiro

Antes de comecar a implementacao, o projeto precisa de configuracoes basicas que estao faltando:
- Arquivo de configuracao do Vite (`vite.config.ts`)
- Script de build no arquivo de dependencias
- Estrutura de pastas e componentes do React

## Arquitetura do Sistema

```text
+------------------+
|    FRONTEND      |
|  React + Vite    |
|  Tailwind CSS    |
|  shadcn/ui       |
+--------+---------+
         |
         v
+--------+---------+
|   SUPABASE       |
|  PostgreSQL      |
|  Auth            |
|  Edge Functions  |
|  Storage         |
+------------------+
```

## Modulos Principais (baseados na analise do sistema legado)

### 1. Autenticacao e Usuarios
- Login/Logout com Supabase Auth
- Perfis de usuario (Master, Gerente, Corretor, Call Center, Estagiario)
- Sistema de permissoes granulares (tabela separada para roles)
- Controle de acesso por departamento (Vendas, Locacao, Ambos)

### 2. Gestao de Imoveis
- Cadastro completo de imoveis (multi-step wizard)
- Tipos: Apartamento, Casa, Comercial, Terreno
- Finalidades: Venda, Locacao, Ambos
- Upload de fotos com galeria
- Geocodificacao e mapa
- Status: Disponivel, Vendido, Locado, Reservado

### 3. Contratos de Locacao
- Cadastro de contratos
- Locatarios, Locadores, Fiadores
- Geracao automatica de mensalidades
- Calculo de reajustes (IGPM, IPCA, INPC)
- Tipos de garantia (Caucao, Fiador, Seguro)

### 4. CRM - Leads e Propostas
- Captura de leads
- Funil de vendas
- Propostas de compra/locacao
- Atendimento ao cliente (FAC)

### 5. Condominios
- Cadastro de condominios
- Torres e blocos
- Infraestrutura e amenidades

### 6. Dashboard e Relatorios
- Metricas principais
- Graficos de status
- Listagens rapidas

## Estrutura do Banco de Dados (Supabase)

Tabelas principais a serem criadas:

```text
TABELAS CORE:
- real_estates (imobiliarias)
- units (filiais)
- profiles (perfis de usuarios)
- user_roles (roles em tabela separada - OBRIGATORIO)
- permissions (permissoes)

IMOVEIS:
- property_types (tipos)
- properties (imoveis)
- property_photos (fotos)
- property_documents (documentos)

LOCACAO:
- rentals (contratos)
- rental_parties (locatarios, locadores, fiadores)
- rental_installments (mensalidades)

CRM:
- leads (leads)
- proposals (propostas)
- customer_services (atendimentos)

APOIO:
- condominiums (condominios)
- condominium_amenities (comodidades)
```

## Fases de Implementacao

### Fase 1: Infraestrutura Base
1. Configurar Vite corretamente
2. Instalar dependencias (shadcn/ui, react-router, tanstack-query, etc)
3. Configurar tema e design system
4. Criar layout principal com sidebar

### Fase 2: Autenticacao
1. Tabela profiles com trigger automatico
2. Tabela user_roles (separada - seguranca)
3. Paginas de login/registro
4. Contexto de autenticacao
5. Rotas protegidas

### Fase 3: Banco de Dados
1. Criar todas as tabelas via migracoes
2. Configurar RLS (Row Level Security)
3. Criar funcoes auxiliares
4. Seeds com dados de exemplo

### Fase 4: Modulo de Imoveis
1. Listagem com filtros e busca
2. Formulario de cadastro multi-step
3. Upload de fotos para Supabase Storage
4. Visualizacao de detalhes
5. Edicao e exclusao

### Fase 5: Modulo de Locacao
1. Listagem de contratos
2. Formulario de novo contrato
3. Cadastro de partes (locatario, locador, fiador)
4. Geracao de mensalidades
5. Controle de pagamentos

### Fase 6: CRM
1. Listagem e cadastro de leads
2. Funil de vendas visual
3. Propostas
4. Atendimento ao cliente

### Fase 7: Dashboard
1. Cards com metricas
2. Graficos
3. Listagens rapidas
4. Notificacoes

## Tecnologias e Bibliotecas

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- shadcn/ui (componentes)
- React Router DOM (rotas)
- TanStack Query (data fetching)
- React Hook Form + Zod (formularios)
- Recharts (graficos)
- date-fns (datas)
- Supabase JS SDK

## Seguranca

- RLS em todas as tabelas
- Roles em tabela separada (prevenir privilege escalation)
- Validacao client-side e server-side
- Autenticacao via Supabase Auth
- Storage policies para arquivos

## Status de Implementacao

### ✅ Fase 1: Infraestrutura Base - CONCLUÍDA
- [x] vite.config.ts configurado
- [x] Dependencias instaladas (shadcn/ui, react-router, tanstack-query, etc)
- [x] Design system configurado (tailwind.config.ts, index.css)
- [x] Layout principal com sidebar responsiva

### ✅ Fase 2: Autenticacao - CONCLUÍDA
- [x] Tabela profiles com trigger automatico
- [x] Tabela user_roles (separada - seguranca)
- [x] Paginas de login/registro
- [x] Contexto de autenticacao (AuthContext)
- [x] Rotas protegidas

### ✅ Fase 3: Banco de Dados - CONCLUÍDA
- [x] Todas as tabelas criadas via migracao
- [x] RLS configurado em todas as tabelas
- [x] Funcoes auxiliares (has_role, get_user_real_estate_id)
- [x] Triggers de updated_at e criacao de profile

### 🔲 Proximo Passo
Para comecar a usar o sistema:
1. Crie uma conta no login
2. Acesse o Supabase e associe seu usuario a uma imobiliaria (real_estate)
