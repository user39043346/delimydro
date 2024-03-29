package main

import (
	"context"
	"errors"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.opentelemetry.io/otel"
	"go.uber.org/zap"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	pb "github.com/user39043346/delimydro/proto/api"

	"github.com/user39043346/delimydro/internal/proxy"
	"github.com/user39043346/delimydro/internal/server"
	"github.com/user39043346/delimydro/internal/tracer"

	grpcprom "github.com/grpc-ecosystem/go-grpc-middleware/providers/prometheus"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var addr = flag.String("addr", "0.0.0.0:1234", "Address to serve on")

func main() {
	flag.Parse()

	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatalf("logger error: %v", err)
	}

	tp := tracer.NewTracerProvider(context.Background())
	otel.SetTracerProvider(tp)
	tracer := tp.Tracer("api")

	db, err := sqlx.Open("postgres", os.Getenv("PG_DSN"))
	if err != nil {
		log.Fatalf("db connect error: %v", err)
	}
	if err := db.Ping(); err != nil {
		log.Fatalf("db connect error: %v", err)
	}
	db.SetMaxOpenConns(64)
	db.SetMaxIdleConns(64)

	metrics := grpcprom.NewServerMetrics(
		grpcprom.WithServerHandlingTimeHistogram(
			grpcprom.WithHistogramBuckets([]float64{0.001, 0.01, 0.1, 0.3, 0.6, 1, 3, 6, 9, 20, 30, 60, 90, 120}),
		),
	)
	reg := prometheus.NewRegistry()
	reg.MustRegister(
		metrics,
		collectors.NewGoCollector(),
		collectors.NewDBStatsCollector(db.DB, "app"),
	)

	srv := server.NewServer(db, os.Getenv("JWT_SECRET_KEY"), tracer, logger)
	s := grpc.NewServer(
		grpc.StatsHandler(otelgrpc.NewServerHandler()),
		grpc.ChainUnaryInterceptor(
			server.TimeoutInterceptor,
			server.TracerInterceptor,
			metrics.UnaryServerInterceptor(),
			srv.AuthInterceptor(),
		))
	pb.RegisterServiceServer(s, srv)
	reflection.Register(s)

	proxyHandler := proxy.NewProxy(s)
	httpServer := http.Server{
		Handler: proxyHandler,
		Addr:    *addr,
	}

	metricsHandler := http.NewServeMux()
	metricsHandler.Handle("/metrics", promhttp.HandlerFor(reg, promhttp.HandlerOpts{Registry: reg}))
	metricsServer := http.Server{
		Handler: metricsHandler,
		Addr:    os.Getenv("METRICS_ADDR"),
	}

	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	wg := sync.WaitGroup{}
	wg.Add(3)

	go func() {
		defer wg.Done()
		log.Println("Starting metrics server")
		if err := metricsServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("Failed to serve metrics: %v", err)
		}
	}()

	go func() {
		defer wg.Done()
		<-ctx.Done()
		log.Println("Stopping server")

		logger.Sync()

		ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
		defer cancel()
		ctx, cancel = context.WithTimeout(ctx, time.Second*5)
		defer cancel()

		if err := httpServer.Shutdown(ctx); err != nil {
			log.Fatalf("Failed to shutdown http server: %v", err)
		}
		if err := metricsServer.Shutdown(ctx); err != nil {
			log.Fatalf("Failed to shutdown metrics server: %v", err)
		}
		if err := tp.Shutdown(ctx); err != nil {
			log.Fatalf("Failed to shutdown tracer provider: %v", err)
		}

	}()
	go func() {
		defer wg.Done()
		<-ctx.Done()

		if err := db.Close(); err != nil {
			log.Printf("err closing db: %v\n", err)
		} else {
			log.Println("db closed")
		}
	}()

	log.Println("Starting http server")
	if err := httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("failed to serve: %v", err)
	}

	select {
	case <-waitWg(&wg):
		log.Println("Succesfully shutdown")
	case <-time.After(time.Second * 5):
		log.Println("Shutdown timeout")
	}
}

func waitWg(wg *sync.WaitGroup) <-chan struct{} {
	ch := make(chan struct{})
	go func() {
		wg.Wait()
		close(ch)
	}()
	return ch
}
