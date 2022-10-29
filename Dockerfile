FROM jarredsumner/bun:edge as builder

WORKDIR /

COPY package.json bun.lockb tsconfig.json ./

COPY src src

RUN bun install && bun run build

FROM astefanutti/scratch-node as run

COPY --from=builder /dist /

ENTRYPOINT ["node", "app.js"]