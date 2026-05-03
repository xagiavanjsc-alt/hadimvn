/**
 * Centralized error handling utility
 * Provides consistent error logging and user-facing error messages
 */

export interface AppError {
  message: string;
  code?: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Log error to console with context
 * In production, this would send to a logging service (Sentry, LogRocket, etc.)
 */
export function logError(error: Error | unknown, context?: Record<string, unknown>): void {
  const errorObj: AppError = {
    message: error instanceof Error ? error.message : String(error),
    timestamp: new Date().toISOString(),
    context,
  };

  if (error instanceof Error) {
    errorObj.code = (error as any).code;
  }

  console.error("[Error]", errorObj);

  // In production, send to logging service
  if (import.meta.env.PROD) {
    // Example: sendToLoggingService(errorObj);
  }
}

/**
 * Handle Supabase errors and return user-friendly message
 */
export function handleSupabaseError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes("jwt")) {
      return "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
    }
    if (message.includes("permission") || message.includes("policy")) {
      return "Bạn không có quyền thực hiện hành động này.";
    }
    if (message.includes("duplicate")) {
      return "Dữ liệu đã tồn tại.";
    }
    if (message.includes("network")) {
      return "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.";
    }
    if (message.includes("timeout")) {
      return "Yêu cầu bị timeout. Vui lòng thử lại.";
    }
    
    return error.message;
  }
  
  return "Đã xảy ra lỗi không xác định.";
}

/**
 * Handle API errors and return user-friendly message
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes("network") || message.includes("fetch")) {
      return "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.";
    }
    if (message.includes("timeout")) {
      return "Yêu cầu bị timeout. Vui lòng thử lại.";
    }
    if (message.includes("500")) {
      return "Lỗi máy chủ. Vui lòng thử lại sau.";
    }
    if (message.includes("401") || message.includes("403")) {
      return "Bạn không có quyền truy cập.";
    }
    if (message.includes("404")) {
      return "Không tìm thấy dữ liệu.";
    }
    
    return error.message;
  }
  
  return "Đã xảy ra lỗi không xác định.";
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  errorHandler?: (error: unknown) => void
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (errorHandler) {
        errorHandler(error);
      } else {
        logError(error);
      }
      throw error;
    }
  }) as T;
}

/**
 * Create a safe version of a function that returns null on error
 */
export function safe<T extends (...args: unknown[]) => unknown>(fn: T): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error);
      return null;
    }
  }) as T;
}
