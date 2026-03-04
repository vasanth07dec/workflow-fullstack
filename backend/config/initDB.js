import pool from "./db.js";
import bcrypt from "bcryptjs";
import "dotenv/config"

/**
 * initialize user data
 */
const insertUsers = async () => {
  const users = [
    { name: "Admin User", email: "admin@example.com", role: "admin" },
    { name: "Normal User", email: "user@example.com", role: "user" },
    { name: "Manager User", email: "manager@example.com", role: "manager" },
    { name: "Vasanth test Manager", email: "vasanthdevcode@gmail.com", role: "manager" },
    { name: "CEO User", email: "ceo@example.com", role: "ceo" },
  ];

  for (const user of users) {
    const passwordHash = await bcrypt.hash("password123", 10);

    await pool.query(
      `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
      `,
      [user.name, user.email, passwordHash, user.role]
    );
  }
  console.log("users inserted");
};

/**
 * initialize tables and enum types
 */
export const initDB = async () => {
  try {
    console.log("Initializing database...");

    // Enable extension
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    `);

    // ENUMS
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE step_type AS ENUM ('task', 'approval', 'notification');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE execution_status AS ENUM 
        ('pending','in_progress','completed','failed','canceled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE role AS ENUM 
        ('admin','user','manager', 'ceo');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // user table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role role DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await insertUsers();

    // WORKFLOWS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS workflows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      version INTEGER NOT NULL,
      is_active BOOLEAN DEFAULT false,
      input_schema JSONB NOT NULL,
      start_step_id UUID,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows(created_at);
    `);

    // STEPS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS steps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        step_type step_type NOT NULL,
        step_order INTEGER,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // RULES TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        step_id UUID REFERENCES steps(id) ON DELETE CASCADE,
        condition TEXT NOT NULL,
        next_step_id UUID,
        priority INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // EXECUTIONS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS executions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workflow_id UUID REFERENCES workflows(id),
        workflow_version INTEGER NOT NULL,
        status execution_status DEFAULT 'pending',
        data JSONB NOT NULL,
        current_step_id UUID,
        retries INTEGER DEFAULT 0,
        triggered_by UUID,
        started_at TIMESTAMP DEFAULT NOW(),
        ended_at TIMESTAMP
      );
    `);

    // EXECUTION LOGS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS execution_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        execution_id UUID REFERENCES executions(id) ON DELETE CASCADE,
        step_id UUID,
        log JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("Database initialized successfully");

  } catch (error) {
    console.error("Error initializing database:", error);
  }
};