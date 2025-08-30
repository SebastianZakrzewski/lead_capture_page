import { PrismaClient } from '@prisma/client';

// Inicjalizacja klienta Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Funkcja do czyszczenia połączenia z bazą
export async function disconnect() {
  await prisma.$disconnect();
}

// Funkcja do sprawdzenia połączenia z bazą
export async function checkConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { success: true, message: 'Połączenie z bazą danych OK' };
  } catch (error) {
    console.error('Database connection error:', error);
    return { success: false, error: 'Błąd połączenia z bazą danych' };
  }
}
