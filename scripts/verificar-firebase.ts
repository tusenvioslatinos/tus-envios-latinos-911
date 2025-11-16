#!/usr/bin/env tsx
/**
 * Script completo de verificación de Firebase
 * Verifica: Admin SDK, Firestore, Auth, reglas, índices, etc.
 */

import { initFirebaseAdmin, getFirestoreAdmin, getAuthAdmin } from '../backend/lib/firebase-admin';
import { db } from '../backend/db/schema';

async function verificarFirebase() {
  console.log('🔍 Verificación completa de Firebase...\n');
  let errores = 0;
  let advertencias = 0;

  try {
    // 1. Verificar inicialización de Firebase Admin
    console.log('1️⃣ Verificando Firebase Admin SDK...');
    try {
      const app = initFirebaseAdmin();
      console.log('   ✅ Firebase Admin inicializado correctamente');
    } catch (error: any) {
      console.error('   ❌ Error al inicializar Firebase Admin:', error.message);
      errores++;
      return;
    }

    // 2. Verificar conexión a Firestore
    console.log('\n2️⃣ Verificando conexión a Firestore...');
    try {
      const firestore = getFirestoreAdmin();
      
      // Crear un documento de prueba
      const testRef = firestore.collection('_test').doc('connection');
      await testRef.set({ 
        test: true, 
        timestamp: new Date().toISOString() 
      });
      
      // Leer el documento
      const testDoc = await testRef.get();
      if (testDoc.exists) {
        console.log('   ✅ Conexión a Firestore exitosa');
        // Limpiar
        await testRef.delete();
      } else {
        throw new Error('No se pudo crear documento de prueba');
      }
    } catch (error: any) {
      console.error('   ❌ Error de conexión a Firestore:', error.message);
      if (error.code === 'permission-denied') {
        console.error('   ⚠️  Error de permisos. Verifica las credenciales del servicio.');
      }
      errores++;
    }

    // 3. Verificar colecciones principales
    console.log('\n3️⃣ Verificando colecciones principales...');
    try {
      const firestore = getFirestoreAdmin();
      
      // Verificar colección 'admins'
      const adminsRef = firestore.collection('admins');
      const adminsSnapshot = await adminsRef.limit(1).get();
      console.log(`   ✅ Colección 'admins' accesible (${adminsSnapshot.size} documentos encontrados)`);
      
      // Verificar colección 'orders'
      const ordersRef = firestore.collection('orders');
      const ordersSnapshot = await ordersRef.limit(1).get();
      console.log(`   ✅ Colección 'orders' accesible (${ordersSnapshot.size} documentos encontrados)`);
    } catch (error: any) {
      console.error('   ❌ Error al verificar colecciones:', error.message);
      if (error.code === 'permission-denied') {
        console.error('   ⚠️  Las reglas de Firestore pueden estar bloqueando el acceso.');
        console.error('   💡 Revisa las reglas en Firebase Console > Firestore Database > Reglas');
      }
      errores++;
    }

    // 4. Verificar operaciones de escritura
    console.log('\n4️⃣ Verificando operaciones de escritura...');
    try {
      const testOrder = {
        type: 'remittance-cash',
        recipientData: '{"test": true}',
        amount: 100,
        currency: 'USD',
        senderName: 'Test User',
        senderCountry: 'US',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const order = await db.orders.create(testOrder);
      console.log(`   ✅ Creación de orden exitosa. ID: ${order.id}`);
      
      // Intentar leer la orden
      const readOrder = await db.orders.findById(order.id);
      if (readOrder) {
        console.log('   ✅ Lectura de orden exitosa');
      }
      
      // Limpiar - eliminar la orden de prueba
      await db.orders.delete(order.id);
      console.log('   ✅ Eliminación de orden de prueba exitosa');
    } catch (error: any) {
      console.error('   ❌ Error en operaciones de base de datos:', error.message);
      if (error.code === 'permission-denied') {
        console.error('   ⚠️  Error de permisos. Verifica las reglas de Firestore.');
      }
      errores++;
    }

    // 5. Verificar Firebase Auth
    console.log('\n5️⃣ Verificando Firebase Auth...');
    try {
      const auth = getAuthAdmin();
      const listResult = await auth.listUsers(1);
      console.log('   ✅ Conexión a Firebase Auth exitosa');
      console.log(`   ℹ️  Usuarios en el sistema: ${listResult.users.length}`);
    } catch (error: any) {
      console.error('   ❌ Error de conexión a Firebase Auth:', error.message);
      if (error.code === 'permission-denied') {
        console.error('   ⚠️  Error de permisos. Verifica las credenciales del servicio.');
      }
      errores++;
    }

    // 6. Verificar índices necesarios (información)
    console.log('\n6️⃣ Verificando índices...');
    console.log('   ℹ️  Los índices se crearán automáticamente cuando sean necesarios.');
    console.log('   💡 Si ves errores sobre índices, créalos en Firebase Console:');
    console.log('      Firestore Database > Índices');
    console.log('      - Campo: createdAt (Ascendente) para orders');
    console.log('      - Campo: email (Ascendente) para admins');

    // 7. Verificar estructura del schema
    console.log('\n7️⃣ Verificando estructura del schema...');
    try {
      // Verificar que las funciones del schema funcionen
      const allAdmins = await db.admins.getAll();
      console.log(`   ✅ Schema de admins funcionando (${allAdmins.length} admins)`);
      
      const allOrders = await db.orders.getAll();
      console.log(`   ✅ Schema de orders funcionando (${allOrders.length} órdenes)`);
    } catch (error: any) {
      console.error('   ❌ Error en el schema:', error.message);
      errores++;
    }

    // Resumen final
    console.log('\n' + '='.repeat(50));
    if (errores === 0 && advertencias === 0) {
      console.log('✅ ¡TODAS LAS VERIFICACIONES PASARON!');
      console.log('\n🎉 Firebase está configurado correctamente.');
      console.log('\n📋 Próximos pasos:');
      console.log('   1. Verifica que el backend esté corriendo: bun run server');
      console.log('   2. Crea una orden desde la app');
      console.log('   3. Verifica en Firebase Console que la orden aparezca');
    } else {
      console.log(`⚠️  VERIFICACIÓN COMPLETADA CON ${errores} ERROR(ES) Y ${advertencias} ADVERTENCIA(S)`);
      console.log('\n💡 Revisa los errores arriba y corrige los problemas.');
    }
    console.log('='.repeat(50));

    process.exit(errores > 0 ? 1 : 0);
  } catch (error: any) {
    console.error('\n❌ Error crítico durante la verificación:', error);
    console.error('\nDetalles:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    process.exit(1);
  }
}

verificarFirebase();

