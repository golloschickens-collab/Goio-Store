
// Test de conexión Stripe
console.log('🧪 TEST STRIPE USA');
console.log('=' .repeat(25));

const stripeTest = {
    publishable_key: process.env.STRIPE_PUBLISHABLE_KEY_USA,
    secret_key: process.env.STRIPE_SECRET_KEY_USA
};

if (!stripeTest.publishable_key || !stripeTest.secret_key) {
    console.log('❌ Variables Stripe faltantes');
    console.log('Configura: STRIPE_PUBLISHABLE_KEY_USA y STRIPE_SECRET_KEY_USA');
} else {
    console.log('✅ Variables Stripe configuradas');
    console.log(`🔑 Publishable: ${stripeTest.publishable_key.substring(0, 12)}...`);
    console.log(`🔐 Secret: ${stripeTest.secret_key.substring(0, 12)}...`);
    console.log('💳 Listo para procesar pagos globales');
}
