import { createClient } from '@supabase/supabase-js';
import IORedis from 'ioredis';
import * as fs from 'fs';
import { execSync } from 'child_process';

async function getCounts(supabase: any) {
  const tables = ['books', 'chapters', 'characters', 'dialogues', 'emotions', 'training_samples', 'dataset_lineage'];
  const counts: Record<string, number> = {};
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) throw error;
    counts[table] = count || 0;
  }
  return counts;
}

async function runValidation() {
  console.log("=== PHASE 7.8 RUNTIME VALIDATION ===\n");
  const blockers: string[] = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("[1] Checking Database Connection & Initial Counts...");
  let beforeCounts: Record<string, number> = {};
  try {
    beforeCounts = await getCounts(supabase);
    console.log("✅ DB Connected.");
    console.log("--- BEFORE COUNTS ---");
    Object.entries(beforeCounts).forEach(([t, c]) => console.log(`${t}: ${c}`));
  } catch (e: any) {
    console.log("❌ DB Critical Error: " + e.message);
    blockers.push("Database is completely unreachable.");
    process.exit(1);
  }

  // Redis
  console.log("\n[2] Checking Redis / Queues...");
  try {
    const redis = new IORedis({ host: '127.0.0.1', port: 6379, maxRetriesPerRequest: 1, commandTimeout: 2000 });
    await new Promise((resolve, reject) => {
       redis.ping().then(resolve).catch(reject);
       setTimeout(() => reject(new Error('Redis timeout')), 2000);
    });
    console.log("✅ Redis Connected.");
    await redis.quit();
  } catch (e: any) {
    console.log("❌ Redis Connection Failed: " + e.message);
    blockers.push("Redis cache/queue system is unreachable.");
  }

  console.log("\n[3] Executing Golden Pipeline Runner...");
  try {
    execSync('npm run golden', { stdio: 'inherit' });
  } catch(e: any) {
    blockers.push("Golden Pipeline Execution Failed.");
  }

  console.log("\n[4] Re-Evaluating Database Counts...");
  let afterCounts: Record<string, number> = {};
  try {
    afterCounts = await getCounts(supabase);
    console.log("--- AFTER COUNTS ---");
    Object.entries(afterCounts).forEach(([t, c]) => console.log(`${t}: ${c}`));
    
    console.log("\n--- PERSISTENCE PROOF ---");
    let allIncremented = true;
    for (const table of Object.keys(beforeCounts)) {
       const b = beforeCounts[table];
       const a = afterCounts[table];
       console.log(`${table}: ${b} -> ${a}`);
       if (a <= b) {
         allIncremented = false;
         blockers.push(`Table ${table} did not persist new rows (Before: ${b}, After: ${a})`);
       }
    }
    if(allIncremented) {
       console.log("✅ ALL TABLES SUCCESSFULLY PERSISTED REAL DATA.");
    }
  } catch(e: any) {
    blockers.push("Failed to count after pipeline.");
  }

  console.log("\n=== VALIDATION COMPLETE ===");
  if (blockers.length > 0) {
    console.log("\nCERTIFICATION STATUS: FAIL");
    console.log("Blockers:");
    blockers.forEach(b => console.log(` - ${b}`));
    process.exit(1);
  } else {
    console.log("\nCERTIFICATION STATUS: PASS");
  }
}

runValidation().catch(console.error);
