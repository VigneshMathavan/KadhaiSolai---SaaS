import { RuntimeHealthChecker } from './RuntimeHealthChecker';

async function bootstrap() {
  console.log("Bootstrapping Kadhaisolai Platform...");
  const isHealthy = await RuntimeHealthChecker.verify();
  
  if (isHealthy) {
     console.log("🚀 Platform is ready for execution.");
  } else {
     console.error("❌ Platform failed health checks.");
     process.exit(1);
  }
}

bootstrap();
