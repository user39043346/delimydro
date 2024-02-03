package proxy

import (
	"log"
	"net/http"

	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
	"google.golang.org/grpc"
	"nhooyr.io/websocket"
)

func NewProxy(grpcServer *grpc.Server) http.Handler {
	return h2c.NewHandler(
		&Proxy{
			grpcServer: grpcServer,
			webServer: grpcweb.WrapServer(
				grpcServer,
				grpcweb.WithWebsockets(true),
				grpcweb.WithOriginFunc(func(string) bool {
					return true
				}),
				grpcweb.WithWebsocketOriginFunc(func(*http.Request) bool {
					return true
				}),
				grpcweb.WithWebsocketCompressionMode(websocket.CompressionDisabled),
			),
		},
		&http2.Server{},
	)
}

type Proxy struct {
	grpcServer *grpc.Server
	webServer  *grpcweb.WrappedGrpcServer
}

func (p *Proxy) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch {
	case r.ProtoMajor == 2 && r.Header.Get("Content-Type") == "application/grpc":
		p.grpcServer.ServeHTTP(w, r)
	case p.webServer.IsAcceptableGrpcCorsRequest(r) || p.webServer.IsGrpcWebRequest(r) || p.webServer.IsGrpcWebSocketRequest(r):
		p.webServer.ServeHTTP(w, r)
	default:
		log.Printf("unrecognized request in proxy: %s\n", r.URL.Path)
	}
}
