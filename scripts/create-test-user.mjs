import "dotenv/config";

import { hashPassword } from "better-auth/crypto";
import { Client } from "pg";

const TEST_USER = {
  name: "Usuario Teste",
  email: "teste@doutoragenda.local",
  password: "Adminim1!",
  clinicName: "Clinica Demo",
  plan: "essential",
};

async function createOrUpdateTestUser() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não configurada.");
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  try {
    await client.query("BEGIN");

    const existingUserResult = await client.query(
      `
        SELECT id
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [TEST_USER.email],
    );

    const userId = existingUserResult.rows[0]?.id ?? crypto.randomUUID();
    const passwordHash = await hashPassword(TEST_USER.password);
    const now = new Date();

    if (existingUserResult.rowCount === 0) {
      await client.query(
        `
          INSERT INTO users (
            id,
            name,
            email,
            email_verified,
            image,
            stripe_customer_id,
            stripe_subscription_id,
            plan,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `,
        [
          userId,
          TEST_USER.name,
          TEST_USER.email,
          true,
          null,
          null,
          null,
          TEST_USER.plan,
          now,
          now,
        ],
      );
    } else {
      await client.query(
        `
          UPDATE users
          SET name = $2,
              email_verified = $3,
              plan = $4,
              updated_at = $5
          WHERE id = $1
        `,
        [userId, TEST_USER.name, true, TEST_USER.plan, now],
      );
    }

    const existingAccountResult = await client.query(
      `
        SELECT id
        FROM accounts
        WHERE user_id = $1 AND provider_id = 'credential'
        LIMIT 1
      `,
      [userId],
    );

    if (existingAccountResult.rowCount === 0) {
      await client.query(
        `
          INSERT INTO accounts (
            id,
            account_id,
            provider_id,
            user_id,
            password,
            created_at,
            updated_at
          ) VALUES ($1, $2, 'credential', $3, $4, $5, $6)
        `,
        [crypto.randomUUID(), userId, userId, passwordHash, now, now],
      );
    } else {
      await client.query(
        `
          UPDATE accounts
          SET password = $2,
              updated_at = $3
          WHERE id = $1
        `,
        [existingAccountResult.rows[0].id, passwordHash, now],
      );
    }

    const clinicResult = await client.query(
      `
        SELECT c.id
        FROM clinics c
        INNER JOIN users_to_clinics utc ON utc.clinic_id = c.id
        WHERE utc.user_id = $1
        LIMIT 1
      `,
      [userId],
    );

    let clinicId = clinicResult.rows[0]?.id;

    if (!clinicId) {
      const insertedClinic = await client.query(
        `
          INSERT INTO clinics (name, created_at, updated_at)
          VALUES ($1, $2, $3)
          RETURNING id
        `,
        [TEST_USER.clinicName, now, now],
      );

      clinicId = insertedClinic.rows[0].id;

      await client.query(
        `
          INSERT INTO users_to_clinics (
            user_id,
            clinic_id,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4)
        `,
        [userId, clinicId, now, now],
      );
    }

    await client.query("COMMIT");

    console.log("Usuario de teste pronto:");
    console.log(`email: ${TEST_USER.email}`);
    console.log(`senha: ${TEST_USER.password}`);
    console.log(`clinica: ${TEST_USER.clinicName}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

createOrUpdateTestUser().catch((error) => {
  console.error("Falha ao criar usuario de teste.");
  console.error(error);
  process.exit(1);
});
