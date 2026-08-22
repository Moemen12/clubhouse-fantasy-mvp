import { formatEnvValidationError, validateEnv } from "./shared/kernel";

try {
  validateEnv();
} catch (error) {
  console.error(`Invalid environment configuration:\n${formatEnvValidationError(error)}`);
  process.exit(1);
}
