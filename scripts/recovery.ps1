# ==========================================
# KADHAISOLAI INFRASTRUCTURE RECOVERY
# ==========================================

# Verify Docker daemon
docker ps

# Start Supabase stack
npx supabase start

# Wait a few seconds then verify
npx supabase status

# Verify containers
docker ps
