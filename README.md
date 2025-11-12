# Habitus - Frontend

Aplicação React com Tailwind CSS v4 para o projeto Habitus - uma plataforma de acompanhamento de hábitos e bem-estar.

## 🚀 Tecnologias

- **React** 19.2.0 com TypeScript
- **Tailwind CSS** v4 (Next)
- **Vite** 7.2.2
- **ESLint** para linting

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── MainLayout.tsx      # Layout principal da aplicação
│   └── index.ts           # Exportações dos componentes
├── pages/
│   ├── SignUp.tsx         # Página de cadastro
│   ├── Login.tsx          # Página de login  
│   ├── Dashboard.tsx      # Dashboard principal (objetivos)
│   ├── History.tsx        # Histórico de progresso
│   ├── Settings.tsx       # Configurações
│   └── index.ts           # Exportações das páginas
├── App.tsx                # Componente principal com navegação
└── main.tsx              # Ponto de entrada
```

## 🎯 Páginas Disponíveis

### 1. **SignUp** (`/signup`)
- Formulário de cadastro de usuário
- Campos: Nome, Email, Senha
- Design responsivo e acessível

### 2. **Login** (`/login`)  
- Formulário de autenticação
- Campos: Email, Senha
- Link para recuperação de senha

### 3. **Dashboard** (`/dashboard`)
- Página principal da aplicação
- Formulário para registrar novos objetivos
- Tabela com registros diários dos hábitos
- Layout usando MainLayout

### 4. **History** (`/history`)
- Histórico de progresso dos objetivos
- Abas para filtrar por tipo (Sono, Água, Atividade Física)
- Cards com métricas e gráficos (placeholder)
- Layout responsivo com grid

### 5. **Settings** (`/settings`)
- Configurações da conta e das metas
- Seções organizadas: "Minha Conta" e "Minhas Metas"
- Botão para logout

## 🎨 Design System

O projeto usa **Tailwind CSS v4** com as seguintes cores principais:

- **Primary**: Cyan (cyan-600, cyan-700)
- **Neutral**: Gray scale (gray-50 até gray-900)  
- **Danger**: Red (red-600, red-100)

### Componentes Base:
- Formulários com foco em cyan-500
- Botões com hover states
- Cards com bordas sutis (border-gray-200)
- Navigation com estados ativos

## 🚀 Como Executar

1. **Instalar dependências:**
```bash
npm install
```

2. **Executar em modo desenvolvimento:**
```bash
npm run dev
```

3. **Acessar:** http://localhost:5173

## 🧭 Navegação

Atualmente o projeto tem um sistema de navegação temporário no canto superior direito para testar todas as páginas. 

### Para implementar roteamento real:

1. Instalar React Router:
```bash
npm install react-router-dom @types/react-router-dom
```

2. Substituir a navegação no `App.tsx` por rotas do React Router

3. Descomentar os imports de `Link` e `NavLink` nos componentes

## 📦 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção  
- `npm run lint` - Verificar código com ESLint
- `npm run preview` - Visualizar build de produção

## 🎪 Features Implementadas

✅ Layout responsivo com Tailwind CSS v4  
✅ Componente MainLayout reutilizável  
✅ Sistema de navegação temporário para testes  
✅ Páginas de autenticação (Login/SignUp)  
✅ Dashboard com formulários e tabelas  
✅ Página de histórico com abas interativas  
✅ Configurações organizadas em seções  
✅ TypeScript configurado  
✅ ESLint configurado  

## 🚧 Próximos Passos

- [ ] Implementar React Router para roteamento real
- [ ] Adicionar biblioteca de ícones (Lucide React)
- [ ] Implementar gráficos reais (Chart.js ou Recharts)
- [ ] Conectar com API backend
- [ ] Adicionar validação de formulários
- [ ] Implementar autenticação real
- [ ] Adicionar testes unitários
