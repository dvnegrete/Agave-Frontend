import { API_BASE_URL } from '@config/api';

/**
 * Servicio de warmup del backend
 * Realiza una petición ligera al backend para "despertarlo" (si está en cold start)
 * y precalentar la conexión con la base de datos
 */

/**
 * Realiza una petición de warmup al backend
 * Se ejecuta en background sin afectar la UX
 * Si falla, el error se ignora silenciosamente
 */
export const warmupBackend = async (): Promise<void> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // timeout de 5 segundos

    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log('⚠️ [Warmup]:', response.status);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Si el endpoint /health no existe, intentar con otro
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {      
        try {
          const altResponse = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            signal: controller.signal,
          });

          if (altResponse.ok) {
            console.log('✅ [Warmup] Backend despertado exitosamente (endpoint alternativo)');
          }
        } catch {
          console.log('ℹ️ [Warmup] No se pudo despertar el backend, pero continuando con login');
        }
      }
    }
  } catch (error: unknown) {
    console.log('ℹ️ [Warmup] Warmup completado (con o sin éxito)');
  }
};

/**
 * Variante con reintentos para mayor confiabilidad
 * Útil si queremos asegurar que el backend está despierto
 */
export const warmupBackendWithRetry = async (maxRetries: number = 3): Promise<void> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔥 [Warmup] Intento ${attempt}/${maxRetries}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log(`✅ [Warmup] Backend despertado en intento ${attempt}`);
        return;
      }
    } catch (error: unknown) {
      lastError = error;
      // Esperar un poco antes del siguiente intento
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  console.log('⚠️ [Warmup] No se pudo despertar el backend después de reintentos', lastError);
};
