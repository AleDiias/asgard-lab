-- Primeiro usuário Asgard (Super Admin).
-- Hash Argon2id da senha: SenhaAdminInicial123 — altere após o primeiro login.
-- O script `bun run db:seed` usa ASGARD_SEED_* e faz ON CONFLICT DO NOTHING; esta migration
-- garante o utilizador mesmo em deploys que só correm migrations.

INSERT INTO "asgard_users" ("name", "email", "password_hash", "is_active")
VALUES (
  'Administrador',
  'administrador@asgardai.com.br',
  '$argon2id$v=19$m=65536,t=3,p=4$iWxehaj/Mq2EIYd5E9xoCg$cbv5+PrU6FlJwbYG5MOLYtNpLHkHKCwGvrapA/uzqCk',
  true
)
ON CONFLICT ("email") DO NOTHING;
