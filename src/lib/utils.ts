import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un número como Pesos Chilenos (CLP) sin decimales y con separador de miles.
 * Ejemplo: 15990 -> "$15.990"
 */
export function formatCLP(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0';
  }
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/**
 * Formatea un número genérico con separador de miles.
 * Ejemplo: 1250 -> "1.250"
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('es-CL').format(value);
}

/**
 * Formatea porcentaje.
 * Ejemplo: 25.5 -> "25,5%"
 */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  return `${value.toFixed(1).replace('.', ',')}%`;
}

/**
 * Formato de fecha estándar local.
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Calcula margen de ganancia en porcentaje.
 */
export function calculateMargin(precioVenta: number, precioCompra: number): number {
  if (!precioVenta || precioVenta <= 0) return 0;
  const utilidad = precioVenta - precioCompra;
  return (utilidad / precioVenta) * 100;
}
