import { useContext, useMemo } from 'react';
import {
  ClientError,
  ClientMiddleware,
  Metadata,
  WebsocketTransport,
  createChannel,
  createClientFactory,
} from 'nice-grpc-web';
import { ServiceClient, ServiceDefinition } from '@/proto/api';
import { AuthContext } from '@/routes/auth';
import RichClientError from './richClientError';

const channel = createChannel('ws://localhost:1234', WebsocketTransport());

const errorDetailsClientMiddleware: ClientMiddleware = async function* errorDetailsClientMiddleware(call, options) {
  let traceId: string | null = null;
  try {
    return yield* call.next(call.request, {
      ...options,
      onTrailer(trailer) {
        traceId = trailer.get('x-trace-id') ?? null;

        options.onTrailer?.(trailer);
      },
    });
  } catch (err) {
    if (err instanceof ClientError) {
      throw new RichClientError(err.path, err.code, err.details, traceId);
    } else {
      console.log(err);
    }

    throw err;
  }
};

export const serviceUnauthorizedClient: ServiceClient = createClientFactory()
  .use(errorDetailsClientMiddleware)
  .create(ServiceDefinition, channel);

export function useServiceAuthorizedClient(): ServiceClient {
  const authContext = useContext(AuthContext);
  return useMemo(
    () =>
      createClientFactory()
        .use(errorDetailsClientMiddleware)
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
