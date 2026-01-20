# 🛒 Checkout Flow - Sistema de Checkout Moderno

Um sistema de checkout completo e moderno desenvolvido com Next.js 16, React, TypeScript e Tailwind CSS. Oferece uma experiência de usuário fluida e intuitiva com animações 3D, internacionalização e alta customização.

![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)

## ✨ Funcionalidades

### 🎯 Checkout Multi-Etapas
- **4 etapas otimizadas**: Dados Pessoais → Entrega → Pagamento → Revisão
- Validação em tempo real com feedback visual
- Navegação fluida entre etapas
- Indicador de progresso visual

### 💳 Cartão de Crédito 3D Interativo
- **Flip card animado** com rotação 3D realista
- Visualização da frente (chip, número, nome, validade)
- Visualização do verso (tarja magnética, CVV, assinatura)
- Detecção automática de bandeira do cartão
- Suporte para: Visa, Mastercard, Amex, Elo, Hipercard

### 🌍 Internacionalização (i18n)
- Suporte completo para **Português** e **Inglês**
- Switch moderno de idiomas no header
- Todas as mensagens, labels e validações traduzidas
- Persistência de preferência no localStorage

### 💰 Métodos de Pagamento
- **Cartão de Crédito** com parcelamento em até 12x
- **Cartão de Débito** para pagamento à vista
- **PIX** com desconto de 10%
- **Boleto Bancário** com vencimento em 3 dias

### ⚙️ Sistema de Configuração
Todas as features são customizáveis através do arquivo `/src/config/checkout.ts`:

```typescript
export const checkoutConfig = {
  features: {
    enableCoupon: true,           // Ativar/desativar cupons
    enableShipping: true,          // Ativar/desativar frete
    enableInstallments: true,      // Ativar/desativar parcelamento
  },
  paymentMethods: {
    credit: true,                  // Cartão de crédito
    debit: true,                   // Cartão de débito
    pix: true,                     // PIX
    boleto: true,                  // Boleto
  },
  cardBrands: ['visa', 'mastercard', 'amex', 'elo', 'hipercard'],
  installments: {
    maxInstallments: 12,           // Máximo de parcelas
    minInstallmentValue: 30,       // Valor mínimo da parcela
  },
  pixDiscount: {
    enabled: true,
    percentage: 10,                // Desconto no PIX
  },
};
```

### 🎨 Tema Customizável
Sistema completo de temas com **52+ variáveis CSS** personalizáveis:

- Cores primárias, secundárias e de destaque
- Estados hover, active e focus
- Feedback visual (success, warning, error)
- Bordas, sombras e raios de borda
- Transições e animações

Edite as variáveis no arquivo `/src/app/globals.css` para customizar todo o visual.

### 📱 Design Responsivo
- Layout otimizado para mobile, tablet e desktop
- Componentes adaptativos
- Touch-friendly para dispositivos móveis
- Grid system flexível

### 🔒 Segurança
- Validação robusta de dados do cartão (Luhn algorithm)
- Mascaramento de campos sensíveis (CVV como password)
- Sanitização de inputs
- Feedback visual de erros

## 🚀 Tecnologias

- **[Next.js 16.1.4](https://nextjs.org/)** - Framework React com SSR e App Router
- **[React 19](https://react.dev/)** - Biblioteca JavaScript para UI
- **[TypeScript](https://www.typescriptlang.org/)** - Superset tipado do JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Lucide Icons](https://lucide.dev/)** - Biblioteca de ícones moderna
- **[clsx](https://github.com/lukeed/clsx)** - Utilitário para classes condicionais
- **Context API** - Gerenciamento de estado global

## 📦 Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd checkout

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📁 Estrutura do Projeto

```
checkout/
├── src/
│   ├── app/                      # App Router do Next.js
│   │   ├── globals.css          # Estilos globais e variáveis CSS
│   │   ├── layout.tsx           # Layout raiz
│   │   └── page.tsx             # Página principal
│   ├── components/
│   │   ├── checkout/            # Componentes do fluxo de checkout
│   │   │   ├── CheckoutSteps.tsx      # Gerenciador de etapas
│   │   │   ├── CustomerForm.tsx       # Formulário de dados pessoais
│   │   │   ├── ShippingForm.tsx       # Formulário de entrega
│   │   │   ├── PaymentForm.tsx        # Formulário de pagamento (com flip card)
│   │   │   ├── ReviewOrder.tsx        # Revisão e confirmação
│   │   │   ├── OrderSummary.tsx       # Resumo do pedido
│   │   │   └── StepIndicator.tsx      # Indicador visual de progresso
│   │   └── ui/                  # Componentes UI reutilizáveis
│   │       ├── Button.tsx             # Botão customizável
│   │       ├── Input.tsx              # Input com validação
│   │       └── LanguageSwitch.tsx     # Switch de idiomas
│   ├── contexts/
│   │   └── CheckoutContext.tsx  # Context API do checkout
│   ├── i18n/                    # Sistema de internacionalização
│   │   ├── translations.ts      # Dicionário PT/EN
│   │   ├── I18nContext.tsx      # Context do i18n
│   │   └── index.ts
│   ├── services/
│   │   └── api.ts               # Mock API e utilitários
│   ├── types/
│   │   └── checkout.ts          # TypeScript types
│   └── config/
│       └── checkout.ts          # Configurações customizáveis
├── public/                      # Assets estáticos
├── next.config.ts               # Configuração do Next.js
├── tailwind.config.ts           # Configuração do Tailwind
├── tsconfig.json                # Configuração do TypeScript
└── package.json
```

## 🎯 Componentes Principais

### CheckoutContext
Gerencia todo o estado do checkout:
- Dados do cliente
- Endereço de entrega
- Informações de pagamento
- Navegação entre etapas
- Validação de formulários

### PaymentForm (Flip Card 3D)
Componente estrela com animação de flip card:
- Rotação 3D suave (700ms)
- Detecção automática de bandeira
- Máscara de entrada para número do cartão
- Validação em tempo real
- Suporte a parcelamento

### I18nContext
Sistema de internacionalização:
- Hook `useI18n()` para acessar traduções
- Persistência da preferência de idioma
- Troca dinâmica sem reload

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor com Turbopack

# Build
npm run build        # Cria build de produção
npm start            # Inicia servidor de produção

# Linting
npm run lint         # Executa ESLint
```

## 🎨 Customização

### Alterar Cores do Tema
Edite as variáveis CSS em `/src/app/globals.css`:

```css
:root {
  --theme-primary: 79 70 229;      /* Indigo-600 */
  --theme-primary-hover: 67 56 202; /* Indigo-700 */
  --theme-success: 34 197 94;       /* Green-500 */
  /* ... mais variáveis */
}
```

### Configurar Features do Checkout
Edite `/src/config/checkout.ts` para ativar/desativar features:

```typescript
export const checkoutConfig = {
  features: {
    enableCoupon: false,        // Desativa cupons
    enableShipping: true,
    enableInstallments: false,  // Remove parcelamento
  },
  // ...
};
```

### Adicionar Novos Produtos
Edite `MOCK_PRODUCTS` em `/src/services/api.ts`:

```typescript
export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Produto Novo',
    price: 1999.99,
    image: 'https://images.unsplash.com/...',
    quantity: 1,
  },
];
```

## 🌐 Adicionar Novo Idioma

1. Edite `/src/i18n/translations.ts`:
```typescript
export type Locale = 'pt' | 'en' | 'es';

export const translations = {
  // ... pt, en
  es: {
    header: { checkout: 'Compra' },
    // ... traduções em espanhol
  }
};
```

2. Atualize o LanguageSwitch para incluir o novo idioma

## 📝 Validações Implementadas

### Cartão de Crédito
- ✅ Algoritmo de Luhn para validação do número
- ✅ Validação de data de expiração
- ✅ CVV com 3-4 dígitos
- ✅ Nome mínimo no cartão

### Dados Pessoais
- ✅ Email com regex RFC 5322
- ✅ Telefone brasileiro formatado
- ✅ Nome e sobrenome obrigatórios

### Endereço
- ✅ CEP com busca automática (mock)
- ✅ Campos obrigatórios validados
- ✅ Seleção de frete obrigatória

## 🎬 Animações

- **Flip Card 3D**: `transform: rotateY()` com `perspective: 1000px`
- **Transições suaves**: 200-300ms para hover states
- **Fade in/out**: Componentes condicionais
- **Scale on hover**: Botões e cards interativos

## 🔐 Segurança

- Dados sensíveis não são persistidos
- CVV mascarado como password
- Validação client-side + server-side ready
- Sanitização de inputs
- Content Security Policy configurado

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md/lg)
- **Desktop**: > 1024px (xl/2xl)

### Otimizações Mobile
- Touch targets mínimos de 44x44px
- Teclado numérico para campos de número
- Inputs otimizados para mobile
- Scroll suave e natural

## 🚀 Performance

- ⚡ Turbopack para builds rápidos
- 🖼️ Next.js Image para otimização automática
- 📦 Code splitting automático
- 🎯 Lazy loading de componentes
- 💾 Memoização com useMemo/useCallback

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ usando as melhores práticas de desenvolvimento web moderno.

---

## 🎯 Roadmap Futuro

- [ ] Integração com gateways de pagamento reais (Stripe, PayPal, PagSeguro)
- [ ] Autenticação de usuários
- [ ] Histórico de pedidos
- [ ] Notificações por email
- [ ] Dashboard administrativo
- [ ] Testes unitários e E2E
- [ ] Modo escuro (dark mode)
- [ ] PWA (Progressive Web App)
- [ ] Análise e tracking de conversão
- [ ] A/B testing framework

## 📞 Suporte

Para reportar bugs ou solicitar features, abra uma issue no repositório.

---

**Desenvolvido com Next.js 16 🚀 | React 19 ⚛️ | TypeScript 💙 | Tailwind CSS 🎨**

