FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm @nestjs/cli

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc* ./

COPY apps/*/package.json ./apps/

RUN pnpm install --frozen-lockfile

COPY . .