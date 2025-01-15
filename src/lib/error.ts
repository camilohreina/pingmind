import { ZodError } from "zod";
import { fromError } from "zod-validation-error";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "connectionError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "notFoundError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "unauthorizedError";
  }
}

export class forbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "forbiddenError";
  }
}

export class badRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "badRequestError";
  }
}

export class internalServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "internalServerError";
  }
}

export class conflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "conflictError";
  }
}

export class notImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "notImplementedError";
  }
}

export class serviceUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "serviceUnavailableError";
  }
}

export class gatewayTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "gatewayTimeoutError";
  }
}

export class ValidationDataError extends Error {
  errors: ZodError;

  constructor(errors: ZodError, message = "Error de validación en los datos") {
    super(fromError(errors).toString());
    this.name = "ValidationDataError";
    this.errors = errors;
  }
}
