import { useContext, useMemo } from 'react';
import { Metadata, WebsocketTransport, createChannel, createClient, createClientFactory } from 'nice-grpc-web';
import { ServiceClient, ServiceDefinition } from '@/proto/api';
import { AuthContext } from '@/routes/auth';

const channel = createChannel('ws://localhost:1234', WebsocketTransport());

export const serviceUnauthorizedClient: ServiceClient = createClient(ServiceDefinition, channel);

export function useServiceAuthorizedClient(): ServiceClient {
  const authContext = useContext(AuthContext);
  return useMemo(
    () =>
      createClientFactory()
        .use((call, options) =>
          call.next(call.request, {
            ...options,
            metadata: {
              ...options.metadata,
              ...(authContext?.metadata ?? new Metadata()),
            },
          }),
        )
        .create(ServiceDefinition, channel),
    [authContext],
  );
}
