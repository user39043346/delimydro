package tracer

import (
	"context"
	"fmt"
	"log"
	"os"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.24.0"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

func NewTracerProvider(ctx context.Context) *sdktrace.TracerProvider {
	exp, err := otlptracegrpc.New(ctx, otlptracegrpc.WithEndpoint(os.Getenv("JAEGER_ADDR")), otlptracegrpc.WithInsecure())
	if err != nil {
		log.Fatalf("couldn't connect to jaeger (addr: %s): %v", os.Getenv("JAEGER_ADDR"), err)
	}

	r, err := resource.Merge(
		resource.Default(),
		resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceName("ApiService"),
		),
	)
	if err != nil {
		log.Fatalf("couldn't create resource: %v", err)
	}

	return sdktrace.NewTracerProvider(sdktrace.WithBatcher(exp), sdktrace.WithResource(r))
}

func NewTracer(t trace.Tracer, logger *zap.Logger) *Tracer {
	return &Tracer{t: t, logger: logger.Sugar()}
}

func (t *Tracer) Frame(ctx context.Context, name string) (context.Context, Frame) {
	ctx, span := t.t.Start(ctx, name)
	t.logger.Infow(fmt.Sprintf("start frame %s", name), "trace_id", span.SpanContext().TraceID())
	return ctx, Frame{Span: span, logger: t.logger}
}

type Tracer struct {
	t      trace.Tracer
	logger *zap.SugaredLogger
}

type Frame struct {
	logger *zap.SugaredLogger
	trace.Span
}

func (f *Frame) Errorf(format string, args ...any) {
	err := fmt.Errorf(format, args...)
	f.logger.Errorw(err.Error(), "trace_id", f.Span.SpanContext().TraceID())
	f.RecordError(err)
	f.SetStatus(codes.Error, err.Error())
}

func (f *Frame) Printf(args ...any) {
	attrs := make([]attribute.KeyValue, 0, len(args)/2)
	for i := 0; i < len(args); i += 2 {
		k := fmt.Sprintf("%v", args[i])
		v := fmt.Sprintf("%v", args[i+1])
		attrs = append(attrs, attribute.String(k, v))
	}
	f.AddEvent("log", trace.WithAttributes(attrs...))
	args = append(args, "trace_id", f.Span.SpanContext().TraceID())
	f.logger.Infow("info", args...)
}
