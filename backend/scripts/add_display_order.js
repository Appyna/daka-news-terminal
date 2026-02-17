/**
 * Script de migration: Ajout colonnes display_order et category_order
 * Usage: node scripts/add_display_order.js
 */

const { supabase } = require('../src/config/supabase');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Début de la migration: ajout colonnes display_order...\n');

  try {
    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, '../database/migration_display_order.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Exécuter la migration via RPC (car Supabase ne permet pas ALTER TABLE direct)
    // On va plutôt faire les UPDATE directement

    console.log('✅ Étape 1: Vérification des sources existantes...');
    const { data: sources, error: fetchError } = await supabase
      .from('sources')
      .select('id, name, category')
      .order('name');

    if (fetchError) throw fetchError;

    console.log(`   📊 ${sources.length} sources trouvées\n`);

    console.log('✅ Étape 2: Ajout des colonnes (si nécessaire)...');
    console.log('   ⚠️  IMPORTANT: Exécute ce SQL dans Supabase SQL Editor:');
    console.log('   👉 https://supabase.com/dashboard/project/wzqhrothppyktowwllkr/sql\n');
    console.log('--- COPIE-COLLE CE SQL ---');
    console.log(sql);
    console.log('--- FIN DU SQL ---\n');

    console.log('✅ Migration préparée !');
    console.log('📝 Actions à faire:');
    console.log('   1. Copie le SQL ci-dessus');
    console.log('   2. Va sur Supabase SQL Editor');
    console.log('   3. Colle et exécute le SQL');
    console.log('   4. Vérifie que les colonnes sont ajoutées\n');

  } catch (error) {
    console.error('❌ Erreur migration:', error.message);
    process.exit(1);
  }
}

runMigration();
