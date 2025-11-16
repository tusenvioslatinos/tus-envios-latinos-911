#!/usr/bin/env tsx
/**
 * Script de prueba para verificar la configuración de Firebase del cliente
 * Ejecutar con: bun run scripts/test-firebase-client.ts
 */

import { firebaseConfig } from '../backend/lib/firebase-config';

function testFirebaseClientConfig() {
  console.log('🔥 Verificando configuración de Firebase para el cliente...\n');

  const requiredVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'EXPO_PUBLIC_FIREBASE_APP_ID',
  ];

  console.log('1️⃣ Verificando variables de entorno...');
  let allPresent = true;

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.includes('your-') || value.includes('tu-')) {
      console.log(`❌ ${varName}: No configurada o tiene valor por defecto`);
      allPresent = false;
    } else {
      // Mostrar solo los primeros y últimos caracteres por seguridad
      const displayValue = value.length > 20 
        ? `${value.substring(0, 10)}...${value.substring(value.length - 5)}`
        : value;
      console.log(`✅ ${varName}: ${displayValue}`);
    }
  }

  if (!allPresent) {
    console.log('\n⚠️  Algunas variables no están configuradas correctamente.');
    console.log('   Verifica el archivo env y asegúrate de tener todas las variables.');
    process.exit(1);
  }

  console.log('\n2️⃣ Verificando configuración de Firebase...');
  console.log('   Project ID:', firebaseConfig.projectId);
  console.log('   Auth Domain:', firebaseConfig.authDomain);
  console.log('   Storage Bucket:', firebaseConfig.storageBucket);
  
  // Verificar que los valores no sean los por defecto
  if (
    firebaseConfig.apiKey === 'your-api-key' ||
    firebaseConfig.authDomain === 'your-project.firebaseapp.com' ||
    firebaseConfig.projectId === 'your-project-id'
  ) {
    console.log('\n❌ La configuración todavía tiene valores por defecto.');
    console.log('   Por favor, actualiza las variables de entorno en el archivo env.');
    process.exit(1);
  }

  console.log('\n✅ Configuración del cliente verificada correctamente!');
  console.log('\n📋 Nota: Esta es una verificación estática.');
  console.log('   Para probar la conexión real, inicia la app y verifica que Firebase se inicialice correctamente.');
  
  process.exit(0);
}

testFirebaseClientConfig();


