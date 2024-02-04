FROM golang:1.21.6

ENV CGO_ENABLED=0

WORKDIR /app
COPY go.* ./
COPY cmd cmd
COPY internal internal
COPY proto proto
RUN --mount=type=cache,target=/root/.cache/go-build \
    --mount=type=cache,target=/go/pkg/mod \
        go build \
            -ldflags="-w -s" \
            -o delimydro_api \
            cmd/api/main.go

CMD ["/app/delimydro_api"]