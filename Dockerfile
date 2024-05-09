# DEPENDENCIES
FROM node:18-alpine AS fulldeps

RUN apk update && \
    apk add --update git && \
    apk add --update openssh

RUN mkdir -p /home/project

WORKDIR /home/project

COPY package*.json ./

RUN npm install

# BUILDER
FROM node:18-alpine AS builder

RUN mkdir -p /home/project

WORKDIR /home/project

COPY --from=fulldeps /home/project/node_modules ./node_modules

COPY . .

RUN npm run build

# RUNNER
FROM node:18-alpine AS runner

RUN mkdir -p /home/project

WORKDIR /home/project

COPY --from=builder /home/project/node_modules ./node_modules
COPY --from=builder /home/project/dist ./dist
COPY --from=builder /home/project/.env ./.env

EXPOSE 8080

CMD ["node", "dist/main"]