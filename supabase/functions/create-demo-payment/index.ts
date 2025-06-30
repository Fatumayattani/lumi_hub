import { corsHeaders } from '../_shared/cors.ts';

interface CreatePaymentRequest {
  productId: string;
  amount: number;
  productName: string;
  productDescription: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== CREATE DEMO PAYMENT ===');
    console.log('Request method:', req.method);

    const requestBody = await req.json();
    console.log('Request body:', requestBody);

    const { productId, amount, productName, productDescription }: CreatePaymentRequest = requestBody;

    // Validate required fields
    if (!productId || !amount || !productName) {
      console.error('Missing required fields:', { productId, amount, productName });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: productId, amount, or productName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('Environment variables check:');
    console.log('SUPABASE_URL:', !!supabaseUrl);
    console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract JWT token from Authorization header
    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted:', !!token);

    // Verify user with Supabase using the JWT token directly
    console.log('Verifying user with Supabase...');
    
    // Import Supabase client for server-side use
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from JWT token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('User verification failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User verified:', user.id);

    // Get current product to check download count
    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('download_count')
      .eq('id', productId)
      .single();

    if (fetchError) {
      console.error('Failed to fetch product:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: 'Product not found',
          details: fetchError.message
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create demo transaction
    console.log('Creating demo transaction...');
    const transactionData = {
      product_id: productId,
      user_id: user.id,
      amount: amount,
      crypto_amount: (amount * 0.000025).toFixed(6), // Simulated BTC amount
      currency: 'BTC',
      status: 'confirmed',
      gateway_payment_id: `demo_${Date.now()}`,
      transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      completed_at: new Date().toISOString()
    };

    console.log('Transaction data:', transactionData);

    const { data: transaction, error: dbError } = await supabase
      .from('crypto_transactions')
      .insert([transactionData])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to store transaction',
          details: dbError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Transaction stored successfully:', transaction.id);

    // Create purchase record
    const { error: purchaseError } = await supabase
      .from('user_purchases')
      .insert([
        {
          user_id: user.id,
          product_id: productId,
          transaction_id: transaction.id,
          purchase_type: 'crypto',
          amount_paid: amount
        }
      ]);

    if (purchaseError) {
      console.error('Purchase record error:', purchaseError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create purchase record',
          details: purchaseError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update product download count by incrementing the current value
    const newDownloadCount = (currentProduct.download_count || 0) + 1;
    const { error: updateError } = await supabase
      .from('products')
      .update({ download_count: newDownloadCount })
      .eq('id', productId);

    if (updateError) {
      console.error('Failed to update download count:', updateError);
      // Don't return error here as the payment was successful
    }

    const responseData = {
      success: true,
      transaction_id: transaction.id,
      status: 'confirmed',
      message: 'Demo payment completed successfully'
    };

    console.log('Returning success response:', responseData);

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Error creating demo payment:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});