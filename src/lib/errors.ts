import { isAxiosError } from "axios";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleApiError(error: unknown): AppError {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const message =
      (error.response?.data as { message?: string })?.message ?? error.message;
    return new AppError(message, status);
  }
  if (error instanceof Error) {
    return new AppError(error.message);
  }
  return new AppError("An unexpected error occurred");
}
