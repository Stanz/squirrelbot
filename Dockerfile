FROM jarredsumner/bun:edge as builder

WORKDIR /

COPY package.json bun.lockb tsconfig.json ./

COPY src src

RUN bun install && bun run build

FROM astefanutti/scratch-node as run

COPY --from=builder /dist /

COPY --from=builder /node_modules /node_modules

ENTRYPOINT ["node", "app.mjs"]