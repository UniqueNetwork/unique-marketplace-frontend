import { sleep } from '../../../utils/helpers';

export const repeatCheckForTransactionFinish = async (checkIfCompleted: () => Promise<boolean>, options: { maxAttempts: boolean, awaitBetweenAttempts: number } | null = null): Promise<void> => {
  let attempt = 0;
  const maxAttempts = options?.maxAttempts || 100;
  const awaitBetweenAttempts = options?.awaitBetweenAttempts || 2 * 1000;

  while (attempt < maxAttempts) {
    const isCompleted = await checkIfCompleted();
    if (isCompleted) return;
    attempt++;
    await sleep(awaitBetweenAttempts);
  }

  throw new Error('Awaiting tx execution timed out');
};
