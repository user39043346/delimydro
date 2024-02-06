import { ClientError, Status } from 'nice-grpc-common';

export default class RichClientError extends ClientError {
  traceId: string | null;

  constructor(path: string, code: Status, details: string, traceId: string | null) {
    super(path, code, details);

    this.name = 'RichClientError';
    this.traceId = traceId;
  }
}
