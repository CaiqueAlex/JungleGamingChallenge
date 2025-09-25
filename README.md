Visão Geral
Este projeto foi criado do back‑end pro front‑end (Backend‑First) e segue exatamente as especificações da vaga

NestJS (TypeORM + RabbitMQ) para auth‑service, tasks‑service e notifications‑service
React + TanStack Router + shadcn/ui + Tailwind para web
Monorepo gerido com pnpm e Turborepo
Docker + docker‑compose para todos os containers (db, rabbitmq, serviços, gateway & frontend)

O debug foi feito com emojis e logs detalhados, pra facilitar a localização de bugs, isso é um jeito pessoal de debugar.

--- Arquitetura ---

┌─────────────────┐    ┌─────────────────┐
│   React Web     │    │  API Gateway    │
│  (Frontend)     │◄──►│   (NestJS)      │
│  Port: 5173     │    │   Port: 3001    │
└─────────────────┘    └─────────────────┘
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
         ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
         │  Auth Service   │ │  Tasks Service  │ │ Notifications   │
         │   (NestJS)      │ │   (NestJS)      │ │   (NestJS)      │
         │   Port: 3002    │ │   Port: 3003    │ │   Port: 3004    │
         └─────────────────┘ └─────────────────┘ └─────────────────┘
                    │           │                         │
                    └───────────┼─────────────────────────┘
                                ▼
              ┌─────────────────────────────────────┐
              │           RabbitMQ                  │
              │        (Message Broker)             │
              │        Port: 5672/15672             │
              └─────────────────────────────────────┘
                                │
                                ▼
              ┌─────────────────────────────────────┐
              │         PostgreSQL                  │
              │        (Database)                   │
              │         Port: 5432                  │
              └─────────────────────────────────────┘

Fluxo de Dados
Frontend → API Gateway → RabbitMQ → Microserviços → PostgreSQL
WebSocket ← Notifications Service ← RabbitMQ ← Tasks/Auth Services

Decisões Técnicas

Decidi começar pelo backend porque a arquitetura de microserviços era mais complexa. Escolhi certo, pois consegui validar toda a comunicação entre serviços antes de partir pro frontend.
Optei pelo pnpm ao invés do npm/yarn pela performance superior em monorepos, Economia de espaço em disco com link e melhor gerenciamento de dependências compartilhadas

TypeORM com PostgreSQL é uma escolha obrigatória do desafio, mas que fez total sentido pois as migrations são automáticas para versionamento do schema, possui relations bem definidas entre User, Task, Comment e type safety completo com TypeScript

Problemas Conhecidos
Conflitos de Biblioteca (Resolvido)
Problema: Versões conflitantes entre microserviços
Solução: Padronização no package.json raiz e uso correto do pnpm workspac

JWT Expiration
No momento os tokens expiram em 15min, mas não há refresh automático
Para melhorar dava para implementar interceptor para refresh automático, não fiz isso por falta de tempo.

O que melhoraria com mais tempo
Testes unitários/e2e - coverage zero no momento
Rate limiting mais granular - atualmente só básico
Logs estruturados
Health checks completos para cada microserviço
tratamento melhor de erros React
Testes - React Testing Library com Jest
Dark/Light theme - para deixar mais bonito
Prometheus + Grafana seria complexo porem bem profissional
Kubernetes

Tempo de Desenvolvimento

13 dias trabalhando nas horas vagas e nos fins de semana
Obs importante: Fiquei 3 dias sem energia em casa, então teve uma pausa forçada no meio do projeto

Backend (10 dias)
API Gateway: 3 dias (conflitos de rota, CORS, JWT, configração do proxy)
Tasks Service: Quase 4 dias (RabbitMQ, TypeORM relations, validações, comentários)
Auth Service: 1 dia (bcrypt, JWT, mais tranquilo)
Notifications: 1 dia (WebSocket + RabbitMQ consumer)
Docker Setup: Quase 2 dias (networks, volumes, dependências entre containers)

Frontend (3 dias)
Setup inicial: 1 dia (TanStack Router, shadcn/ui, configurar tudo)
Páginas principais: 1 dia (login, lista de tasks, task detail)
WebSocket integration: (conexão, eventos, notificações) e Polish geral: (loading states, toasts, animações, responsivo) - tudo no mesmo dia

Onde travei mais
Conflitos de versão no monorepo - foi mmt tempo quebrando a cabeça com pnpm
RabbitMQ configuration - documentação confusa, muito trial e erros
TypeORM relations
Route parameters - endpoints no API Gateway

Como Rodar

O que você precisa ter
Docker Desktop
Node.js 18+
PNPM

Primeiro, clona o repositório:
git clone https://github.com/CaiqueAlex/Sistema-de-Gest-o-de-Tarefas-Colaborativo.git

Entra na pasta:
cd Sistema-de-Gest-o-de-Tarefas-Colaborativo

Então use isso para instalar as dependencias:
pnpm install

Agora usa o Docker Compose pra subir tudo de uma vez:
docker-compose up --build

Depois vá na pasta apps/web/ e use pnpm run dev para iniciar a interface grafica

URLs pra acessar:

Frontend: http://localhost:5173 (a interface bonitinha)
API Gateway: http://localhost:3001 (onde o frontend conversa)
Documentação Swagger: http://localhost:3001/api/docs (pra ver todos os endpoints)
RabbitMQ Management: http://localhost:15672 (usuário: admin, senha: admin)




O que tá funcionando resumidamente
Sistema de login/registro completo com JWT
CRUD de tarefas - criar, editar, deletar, listar com paginação
Sistema de comentários - adicionar, editar e deletar
Notificações em tempo real via WebSocket
Paginação nas listas pra não quebrar a interface
Interface responsiva com shadcn/ui (ficou bem bonitinha)
Documentação completa no Swagger
Docker pra subir tudo fácil
Debug com emojis pra localizar problemas rapidinho
