# Build stage
FROM denoland/deno:latest AS builder
WORKDIR /app
COPY . .
# Install dependencies (use just `deno install` if deno.json has imports)
RUN deno install --entrypoint main.ts

# Production stage
FROM denoland/deno:latest
WORKDIR /app
COPY --from=builder /app .
CMD ["deno", "run", "--allow-net", "--allow-read", "main.ts"]