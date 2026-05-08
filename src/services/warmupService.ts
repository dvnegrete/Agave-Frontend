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
    const timeoutId = setTimeout(() => controller.abort(), 10000);
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

      // Intentar con /db como alternativa (cualquier error, no solo AbortError)
      try {
        const altController = new AbortController();
        const altTimeoutId = setTimeout(() => altController.abort(), 10000);

        await fetch(`${API_BASE_URL}/db`, {
          method: 'GET',
          signal: altController.signal,
        });

        clearTimeout(altTimeoutId);
      } catch {
        console.log('ℹ️ [Warmup] No se pudo despertar el backend, pero continuando con login');
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
export const warmupBackendWithRetry = async (maxRetries: number = 5): Promise<void> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔥 [Warmup] Intento ${attempt}/${maxRetries}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s por intento

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
      if (attempt < maxRetries) {
        const delay = 3000 * attempt; // 3s, 6s, 9s, 12s — tiempo real para backends sleeping
        console.log(`⏳ [Warmup] Esperando ${delay}ms antes de reintentar...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.log('⚠️ [Warmup] No se pudo despertar el backend después de reintentos', lastError);
};
