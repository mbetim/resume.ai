export class HttpException extends Error {
  public status: number;

  constructor(message: string, options?: { status?: number }) {
    super(message);
    this.message = message;
    this.status = options?.status ?? 500;
  }
}

export const MethodNotImplementDefaultError = (): HttpException => {
  throw new HttpException("Method não implementado", { status: 404 });
};
