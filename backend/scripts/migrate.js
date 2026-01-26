#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variables SUPABASE manquantes dans .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function migrate() {
  console.log('\n🗄️  Migration de la base de données...\n');

  try {
    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, '../database/schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Exécuter via l'API Supabase
    console.log('📝 Exécution du schéma SQL...');
    console.log('⚠️  IMPORTANT: Allez dans Supabase Dashboard > SQL Editor');
    console.log('⚠️  Copiez-collez le contenu de database/schema.sql');
    console.log('⚠️  Puis cliquez sur "RUN"\n');

    console.log('📄 Chemin du fichier SQL:', sqlPath);
    console.log('\n✅ Une fois exécuté dans Supabase, votre base sera prête!\n');
  } catch (error) {
    console.error('❌ Erreur migration:', error);
    process.exit(1);
  }
}

migrate();
