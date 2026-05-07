# Economizei Bot

Bot de WhatsApp que lê cupons fiscais via foto, extrai os dados com Gemini Vision e salva no Supabase.

## Pré-requisitos

- Node.js >= 18
- Conta na [Z-API](https://z-api.io)
- Chave de API do [Google Gemini](https://aistudio.google.com)
- Projeto no [Supabase](https://supabase.com)

## Instalação

```bash
npm install
cp .env.example .env
# Preencha as variáveis no .env
```

## Executar

```bash
npm start
```

## Variáveis de ambiente

| Variável           | Descrição                              |
|--------------------|----------------------------------------|
| GEMINI_API_KEY     | Chave da API do Google Gemini          |
| SUPABASE_URL       | URL do projeto Supabase                |
| SUPABASE_ANON_KEY  | Chave anon do Supabase                 |
| ZAPI_INSTANCE_ID   | ID da instância Z-API                  |
| ZAPI_TOKEN         | Token da instância Z-API               |
| ZAPI_CLIENT_TOKEN  | Client-Token de segurança da Z-API     |
| PORT               | Porta do servidor (padrão: 3000)       |

## Endpoints

- `GET /health` — verifica se o servidor está no ar
- `POST /webhook` — recebe eventos do Z-API
