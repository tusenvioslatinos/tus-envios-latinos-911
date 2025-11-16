#!/usr/bin/env tsx
/**
 * Script de prueba para verificar la configuración de Firebase
 * Ejecutar con: bun run scripts/test-firebase.ts
 */

import { initFirebaseAdmin, getFirestoreAdmin, getAuthAdmin } from '../backend/lib/firebase-admin';

async function testFirebase() {
  console.log('🔥 Iniciando prueba de Firebase...\n');

  try {
    // 1. Probar inicialización de Firebase Admin
    console.log('1️⃣ Probando inicialización de Firebase Admin...');
    const app = initFirebaseAdmin();
    console.log('✅ Firebase Admin inicializado correctamente\n');

    // 2. Probar conexión a Firestore
    console.log('2️⃣ Probando conexión a Firestore...');
    const db = getFirestoreAdmin();
    
    // Intentar leer una colección para verificar la conexión
    const testCollection = db.collection('_test_connection');
    await testCollection.doc('test').set({ timestamp: new Date().toISOString() });
    const testDoc = await testCollection.doc('test').get();
    
    if (testDoc.exists) {
      console.log('✅ Conexión a Firestore exitosa');
      // Limpiar el documento de prueba
      await testCollection.doc('test').delete();
      console.log('✅ Documento de prueba eliminado\n');
    } else {
      throw new Error('No se pudo crear el documento de prueba');
    }

    // 3. Probar conexión a Firebase Auth
    console.log('3️⃣ Probando conexión a Firebase Auth...');
    const auth = getAuthAdmin();
    
    // Intentar listar usuarios (esto verifica la conexión)
    const listUsersResult = await auth.listUsers(1);
    console.log('✅ Conexión a Firebase Auth exitosa');
    console.log(`   Usuarios encontrados: ${listUsersResult.users.length}\n`);

    // 4. Verificar colecciones principales
    console.log('4️⃣ Verificando colecciones principales...');
    
    // Verificar colección de admins
    const adminsSnapshot = await db.collection('admins').limit(1).get();
    console.log(`✅ Colección 'admins' accesible (${adminsSnapshot.size} documentos)`);
    
    // Verificar colección de orders
    const ordersSnapshot = await db.collection('orders').limit(1).get();
    console.log(`✅ Colección 'orders' accesible (${ordersSnapshot.size} documentos)\n`);

    // 5. Verificar índices necesarios
    console.log('5️⃣ Verificando índices...');
    console.log('ℹ️  Para verificar índices, revisa la consola de Firebase');
    console.log('   Los índices se crearán automáticamente cuando se necesiten\n');

    console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('\n✅ Firebase está configurado correctamente');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Configura las variables de entorno para el cliente (EXPO_PUBLIC_FIREBASE_*)');
    console.log('   2. Verifica las reglas de seguridad en Firestore');
    console.log('   3. Crea un administrador usando la ruta /trpc/auth.register');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error durante la prueba:', error.message);
    console.error('\nDetalles del error:');
    console.error(error);
    
    if (error.code === 'permission-denied') {
      console.error('\n⚠️  Error de permisos. Verifica:');
      console.error('   1. Las credenciales del servicio de Firebase');
      console.error('   2. Que el servicio tenga permisos de administrador');
    } else if (error.code === 'ENOENT') {
      console.error('\n⚠️  No se encontró el archivo de credenciales.');
      console.error('   Asegúrate de tener el archivo JSON de credenciales en la raíz del proyecto');
    }
    
    process.exit(1);
  }
}

// Ejecutar la prueba
testFirebase();


