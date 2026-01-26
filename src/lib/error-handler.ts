import { toast } from 'sonner';

// Centralized error handling utilities

interface ErrorOptions {
  title?: string;
  description?: string;
  duration?: number;
  showToast?: boolean;
}

// Map common error messages to user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Email ou senha incorretos.',
  'Email not confirmed': 'Por favor, confirme seu email antes de fazer login.',
  'User already registered': 'Este email já está cadastrado.',
  'Password is too short': 'A senha deve ter pelo menos 6 caracteres.',
  'Network request failed': 'Erro de conexão. Verifique sua internet.',
  'Failed to fetch': 'Erro de conexão. Verifique sua internet.',
  'Rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos.',
  'JWT expired': 'Sua sessão expirou. Faça login novamente.',
  'row-level security': 'Você não tem permissão para esta ação.',
  'duplicate key': 'Este registro já existe.',
  'violates foreign key': 'Não é possível excluir. Existem registros vinculados.',
  'null value in column': 'Preencha todos os campos obrigatórios.',
};

// Get user-friendly message from error
export function getErrorMessage(error: unknown): string {
  if (!error) return 'Ocorreu um erro desconhecido.';
  
  let message = '';
  
  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'object' && 'message' in error) {
    message = String((error as { message: unknown }).message);
  }
  
  // Check for known error patterns
  for (const [pattern, friendlyMessage] of Object.entries(ERROR_MESSAGES)) {
    if (message.toLowerCase().includes(pattern.toLowerCase())) {
      return friendlyMessage;
    }
  }
  
  // Return original message if no pattern matches (but clean it up)
  if (message.length > 100) {
    return 'Ocorreu um erro. Tente novamente.';
  }
  
  return message || 'Ocorreu um erro. Tente novamente.';
}

// Handle error with optional toast notification
export function handleError(error: unknown, options: ErrorOptions = {}): string {
  const {
    title = 'Erro',
    description,
    duration = 5000,
    showToast = true,
  } = options;
  
  const message = description || getErrorMessage(error);
  
  // Log to console for debugging
  console.error('[Error]', error);
  
  if (showToast) {
    toast.error(title, {
      description: message,
      duration,
    });
  }
  
  return message;
}

// Success notification helper
export function handleSuccess(message: string, options: { title?: string; duration?: number } = {}) {
  const { title = 'Sucesso', duration = 3000 } = options;
  
  toast.success(title, {
    description: message,
    duration,
  });
}

// Warning notification helper
export function handleWarning(message: string, options: { title?: string; duration?: number } = {}) {
  const { title = 'Atenção', duration = 4000 } = options;
  
  toast.warning(title, {
    description: message,
    duration,
  });
}

// Info notification helper
export function handleInfo(message: string, options: { title?: string; duration?: number } = {}) {
  const { title, duration = 3000 } = options;
  
  toast.info(title || message, {
    description: title ? message : undefined,
    duration,
  });
}

// Async operation wrapper with automatic error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options: ErrorOptions & { 
    successMessage?: string;
    onError?: (error: unknown) => void;
  } = {}
): Promise<T | null> {
  const { successMessage, onError, ...errorOptions } = options;
  
  try {
    const result = await operation();
    
    if (successMessage) {
      handleSuccess(successMessage);
    }
    
    return result;
  } catch (error) {
    handleError(error, errorOptions);
    onError?.(error);
    return null;
  }
}

// Supabase-specific error handler
export function handleSupabaseError(error: { message?: string; code?: string; details?: string } | null) {
  if (!error) return null;
  
  const message = getErrorMessage(error.message || error.details || 'Erro no banco de dados');
  
  toast.error('Erro', {
    description: message,
    duration: 5000,
  });
  
  console.error('[Supabase Error]', error);
  
  return message;
}
