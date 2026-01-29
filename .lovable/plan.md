
# Plano: Migração para Umbler Talk (uTalk) 

## Resumo
Atualizar a integração WhatsApp para usar a API da Umbler Talk em vez de Z-API, mantendo todas as funcionalidades existentes (templates de mensagem, disparo automático de compra de MultiPass, lembrete de parque, etc).

---

## O que será feito

### 1. Atualizar Edge Function `send-whatsapp`
Modificar a função para usar a API simplificada da Umbler Talk:

**Endpoint**: `POST https://app-utalk.umbler.com/api/v1/messages/simplified`

**Estrutura da requisição**:
```text
┌─────────────────────────────────────────────┐
│  Headers                                    │
│  ├─ Authorization: Bearer {UTALK_TOKEN}     │
│  └─ Content-Type: application/json          │
├─────────────────────────────────────────────┤
│  Body (JSON)                                │
│  ├─ organizationId: "{UTALK_ORG_ID}"        │
│  ├─ channelType: "WhatsAppStarter"          │
│  ├─ phone: "5511999999999"                  │
│  └─ text: "Mensagem aqui"                   │
└─────────────────────────────────────────────┘
```

### 2. Secrets necessários (substituem os anteriores)
| Variável | Descrição |
|----------|-----------|
| `UTALK_TOKEN` | Token de API gerado no painel Umbler Talk |
| `UTALK_ORG_ID` | ID da organização no Umbler Talk |

### 3. Compatibilidade mantida
- ✅ Templates existentes (`multipass_purchased`, `park_reminder`, `custom`)
- ✅ Busca automática de telefone via `user_id`
- ✅ Formatação de número brasileiro
- ✅ Integração com `useMultipassStatus`
- ✅ Cron job de lembrete de parque

---

## Detalhes Técnicos

### Arquivo modificado
**`supabase/functions/send-whatsapp/index.ts`**

**Mudanças principais**:
1. Trocar constantes de `ZAPI_*` para `UTALK_*`
2. Atualizar função `sendUtalkMessage()` com novo endpoint
3. Ajustar estrutura do body para formato uTalk
4. Atualizar tratamento de erros para response da API

### Código da nova função de envio
```typescript
async function sendUtalkMessage(
  phone: string, 
  message: string
): Promise<{ success: boolean; error?: string }> {
  const UTALK_TOKEN = Deno.env.get("UTALK_TOKEN");
  const UTALK_ORG_ID = Deno.env.get("UTALK_ORG_ID");

  if (!UTALK_TOKEN || !UTALK_ORG_ID) {
    return { success: false, error: 'Umbler Talk credentials not configured' };
  }

  // Formatar telefone (garantir código do país)
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

  const response = await fetch(
    'https://app-utalk.umbler.com/api/v1/messages/simplified',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UTALK_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationId: UTALK_ORG_ID,
        channelType: 'WhatsAppStarter',
        phone: formattedPhone,
        text: message,
      }),
    }
  );
  // ... tratamento de resposta
}
```

---

## Fluxo de notificações (inalterado)

```text
┌──────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Usuário confirma │────▶│ useMultipassStatus│────▶│ send-whatsapp   │
│ compra MultiPass │     │ dispara invoke   │     │ (Edge Function) │
└──────────────────┘     └──────────────────┘     └────────┬────────┘
                                                           │
                                                           ▼
                                              ┌─────────────────────────┐
                                              │  Umbler Talk API        │
                                              │  POST /v1/messages/     │
                                              │       simplified        │
                                              └─────────────────────────┘
```

---

## Próximos passos após aprovação

1. **Editar** a edge function `send-whatsapp`
2. **Solicitar** suas credenciais do Umbler Talk:
   - Token de API
   - ID da organização
3. **Testar** o envio de mensagem

---

## Como obter as credenciais no Umbler Talk

1. Acesse o painel do Umbler Talk
2. Vá em **Configurações** → **API**
3. Clique em "Novo Token" e copie o valor
4. O ID da organização está na URL do painel ou em **Configurações** → **Organização**
