// 📍 ARQUIVO: src/config/legal.js

export const LEGAL_CONTENT = {
  terms: {
    title: 'Termos de Uso',
    lastUpdate: '15 de Janeiro de 2025',
    content: `# Termos de Uso - PixelIA

**Última atualização: 15 de Janeiro de 2025**

## 1. Aceitação dos Termos

Ao acessar e usar a PixelIA, você concorda com estes termos de uso. Se você não concordar, não utilize nossos serviços.

## 2. Descrição do Serviço

A PixelIA é uma plataforma de chat com inteligência artificial que utiliza modelos de linguagem avançados para fornecer respostas e assistência.

## 3. Uso Aceitável

Você concorda em:
- Usar o serviço de forma legal e ética
- Não tentar hackear, comprometer ou sobrecarregar nossos sistemas
- Não usar para fins ilegais, prejudiciais ou maliciosos
- Não compartilhar conteúdo ofensivo, discriminatório ou ilegal
- Não tentar extrair ou copiar nossos modelos de IA

## 4. Planos e Pagamentos

**Plano Essencial (Gratuito):**
- 50 mensagens por dia
- Histórico de 7 dias
- Sem custos

**Plano Avançado (Pago):**
- Mensagens ilimitadas
- Histórico completo
- R$ 19,90/mês ou R$ 199/ano
- Pagamentos processados via Stripe
- Renovação automática
- Cancele quando quiser sem multas

**Reembolsos:**
- Disponível dentro de 7 dias após a primeira cobrança
- Entre em contato: suporte@pixelia.ai

## 5. Privacidade e Dados

Consulte nossa Política de Privacidade para informações detalhadas sobre como tratamos seus dados.

## 6. Propriedade Intelectual

Todo o conteúdo, código, design e marca PixelIA são propriedade da Blockpixel Studios. Respostas geradas pela IA são de sua propriedade.

## 7. Limitações de Responsabilidade

A PixelIA não se responsabiliza por:
- Precisão ou confiabilidade das respostas da IA
- Decisões tomadas baseadas nas respostas
- Interrupções temporárias do serviço
- Perda de dados por problemas técnicos

**IMPORTANTE:** A IA pode cometer erros. Sempre verifique informações importantes.

## 8. Modificações

Podemos alterar estes termos a qualquer momento. Mudanças significativas serão notificadas por email.

## 9. Suspensão e Cancelamento

Podemos suspender ou cancelar contas que violem estes termos sem aviso prévio.

## 10. Lei Aplicável

Estes termos são regidos pelas leis brasileiras. Foro: Comarca de Pimenta Bueno, RO.

## 11. Contato

Dúvidas sobre estes termos?
- Email: suporte@pixelia.ai
- Chat: Disponível no site`
  },
  
  privacy: {
    title: 'Política de Privacidade',
    lastUpdate: '15 de Janeiro de 2025',
    content: `# Política de Privacidade - PixelIA

**Última atualização: 15 de Janeiro de 2025**

A PixelIA respeita sua privacidade e está comprometida em proteger seus dados pessoais de acordo com a LGPD (Lei Geral de Proteção de Dados).

## 1. Informações que Coletamos

**Dados de Cadastro:**
- Email
- Nome
- Senha (criptografada)

**Dados de Uso:**
- Conversas com a IA
- Histórico de mensagens
- Preferências e configurações
- Data e hora de acesso

**Dados de Pagamento:**
- Processados via Stripe (não armazenamos cartões)
- Histórico de transações
- Status da assinatura

**Dados Técnicos:**
- Endereço IP
- Navegador e dispositivo
- Cookies essenciais

## 2. Como Usamos suas Informações

Utilizamos seus dados para:
- Fornecer e melhorar o serviço
- Processar pagamentos e assinaturas
- Enviar atualizações importantes
- Suporte ao cliente
- Prevenir fraudes e abusos
- Análise e melhoria da IA

**NÃO usamos para:**
- Vender seus dados
- Spam ou marketing não solicitado
- Compartilhar com terceiros sem consentimento

## 3. Compartilhamento de Dados

Compartilhamos apenas com:

**Stripe:** Processamento de pagamentos (PCI-DSS compliant)
**GROQ:** Processamento de mensagens da IA (dados anonimizados)
**Supabase:** Hospedagem segura do banco de dados (criptografia em repouso)

Nunca vendemos ou alugamos seus dados!

## 4. Seus Direitos (LGPD)

Você tem direito a:
- **Acessar** seus dados
- **Corrigir** informações incorretas
- **Deletar** sua conta e dados
- **Exportar** seus dados em formato legível
- **Revogar** consentimento a qualquer momento
- **Portabilidade** de dados

Para exercer seus direitos: privacidade@pixelia.ai

## 5. Segurança

Implementamos medidas de segurança robustas:
- Criptografia SSL/TLS em todas as conexões
- Senhas com hash bcrypt
- Autenticação segura via Supabase
- Backups diários automáticos
- Acesso restrito aos dados
- Monitoramento 24/7

## 6. Cookies

Usamos cookies essenciais para:
- Manter você logado
- Lembrar preferências
- Garantir segurança

Você pode gerenciar cookies nas configurações do navegador.

## 7. Retenção de Dados

**Conta ativa:** Dados mantidos enquanto usar o serviço
**Conta deletada:** Dados removidos em até 30 dias
**Backups:** Mantidos por 90 dias para recuperação

## 8. Menores de Idade

Nosso serviço é para maiores de 18 anos. Não coletamos intencionalmente dados de menores.

## 9. Transferência Internacional

Seus dados podem ser processados em servidores nos EUA (Supabase, Stripe). Garantimos proteção adequada conforme LGPD.

## 10. Atualizações

Esta política pode ser atualizada. Mudanças importantes serão notificadas por email.

## 11. Contato

**Encarregado de Dados (DPO):**
- Email: privacidade@pixelia.ai
- Resposta em até 48h úteis`
  },
  
  cookies: {
    title: 'Política de Cookies',
    lastUpdate: '15 de Janeiro de 2025',
    content: `# Política de Cookies - PixelIA

**Última atualização: 15 de Janeiro de 2025**

## O que são Cookies?

Cookies são pequenos arquivos de texto armazenados no seu navegador quando você visita um site. Eles ajudam o site a lembrar suas preferências e melhorar sua experiência.

## Cookies que Usamos

### Cookies Essenciais (Necessários)

Estes cookies são necessários para o funcionamento do site e não podem ser desativados:

**sb-access-token**
- Propósito: Autenticação Supabase
- Duração: Sessão
- Tipo: Essencial

**sb-refresh-token**
- Propósito: Renovação automática de sessão
- Duração: 30 dias
- Tipo: Essencial

**cookie_consent**
- Propósito: Lembrar sua escolha sobre cookies
- Duração: 1 ano
- Tipo: Essencial

### Cookies de Preferências

**theme**
- Propósito: Lembrar preferência de tema (claro/escuro)
- Duração: 1 ano
- Tipo: Funcional

**language**
- Propósito: Idioma escolhido
- Duração: 1 ano
- Tipo: Funcional

### Cookies Analíticos (Opcional)

**_ga, _gid** (Google Analytics)
- Propósito: Entender como você usa o site
- Duração: 2 anos / 24 horas
- Tipo: Analítico
- Status: Você pode recusar

## Cookies de Terceiros

**Stripe**
- Usado durante o processo de pagamento
- Necessário para segurança

**Tawk.to**
- Chat de suporte ao vivo
- Apenas quando você usa o chat

## Como Gerenciar Cookies

### No Navegador:

**Chrome:**
Configurações > Privacidade e segurança > Cookies

**Firefox:**
Opções > Privacidade e segurança > Cookies

**Safari:**
Preferências > Privacidade > Cookies

**Edge:**
Configurações > Privacidade > Cookies

### No Site:

Você pode gerenciar preferências de cookies a qualquer momento nas configurações da sua conta.

## Cookies e Privacidade

- Cookies essenciais não rastreiam você
- Cookies analíticos são anonimizados
- Nunca vendemos dados de cookies
- Você tem controle total

## Duração dos Cookies

- **Sessão:** Deletados ao fechar o navegador
- **Persistentes:** Permanecem até expiração ou exclusão manual

## Atualizações

Esta política pode ser atualizada. A data da última atualização está no topo.

## Dúvidas?

Entre em contato: cookies@pixelia.ai`
  }
};
