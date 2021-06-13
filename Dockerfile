FROM node as installer

WORKDIR /app

RUN curl -sL https://unpkg.com/@pnpm/self-installer | node

FROM installer as builder

WORKDIR /app

COPY package.json pnpm-lock.yaml src/ ./

RUN pnpm install --prod

FROM astefanutti/scratch-node as run

COPY --from=builder /app /

ENTRYPOINT ["node", "app.js"]