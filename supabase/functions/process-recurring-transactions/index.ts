import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Process Recurring Transactions Edge Function
 * 
 * This function is called by pg_cron to process recurring transactions.
 * It finds all active recurring transactions that are due for processing,
 * creates actual transactions from them, and updates the next_process_date.
 * 
 * Schedule: Daily at midnight (00:00)
 * Cron: '0 0 * * *'
 */

interface RecurringTransaction {
  id: string
  user_id: string
  amount: number
  description: string | null
  type: 'income' | 'expense'
  category_id: string | null
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date: string | null
  last_processed_date: string | null
  next_process_date: string
  is_active: boolean
}

/**
 * Calculate the next process date based on frequency
 */
function calculateNextProcessDate(currentDate: Date, frequency: string): string {
  const nextDate = new Date(currentDate)
  
  switch (frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1)
      break
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7)
      break
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1)
      break
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1)
      break
  }
  
  return nextDate.toISOString().split('T')[0]
}

/**
 * Check if recurring transaction should be deactivated
 */
function shouldDeactivate(endDate: string | null, nextProcessDate: string): boolean {
  if (!endDate) return false
  return new Date(nextProcessDate) > new Date(endDate)
}

Deno.serve(async (req) => {
  try {
    // Create Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get today's date
    const today = new Date().toISOString().split('T')[0]
    
    console.log(`Processing recurring transactions for date: ${today}`)

    // Fetch all active recurring transactions that are due for processing
    const { data: recurringTransactions, error: fetchError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .lte('next_process_date', today)

    if (fetchError) {
      console.error('Error fetching recurring transactions:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch recurring transactions', details: fetchError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!recurringTransactions || recurringTransactions.length === 0) {
      console.log('No recurring transactions to process')
      return new Response(
        JSON.stringify({ message: 'No recurring transactions to process', processed: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${recurringTransactions.length} recurring transactions to process`)

    let processedCount = 0
    let errorCount = 0
    const errors: Array<{ id: string; error: string }> = []

    // Process each recurring transaction
    for (const rt of recurringTransactions as RecurringTransaction[]) {
      try {
        console.log(`Processing recurring transaction: ${rt.id}`)

        // Create actual transaction
        const { error: insertError } = await supabase
          .from('transactions')
          .insert({
            user_id: rt.user_id,
            amount: rt.amount,
            description: rt.description,
            type: rt.type,
            category_id: rt.category_id,
            date: today,
          })

        if (insertError) {
          console.error(`Error creating transaction for ${rt.id}:`, insertError)
          errors.push({ id: rt.id, error: insertError.message })
          errorCount++
          continue
        }

        // Calculate next process date
        const nextProcessDate = calculateNextProcessDate(new Date(today), rt.frequency)
        
        // Check if should deactivate
        const shouldStop = shouldDeactivate(rt.end_date, nextProcessDate)

        // Update recurring transaction
        const { error: updateError } = await supabase
          .from('recurring_transactions')
          .update({
            last_processed_date: today,
            next_process_date: nextProcessDate,
            is_active: !shouldStop,
            updated_at: new Date().toISOString(),
          })
          .eq('id', rt.id)

        if (updateError) {
          console.error(`Error updating recurring transaction ${rt.id}:`, updateError)
          errors.push({ id: rt.id, error: updateError.message })
          errorCount++
          continue
        }

        processedCount++
        console.log(`Successfully processed recurring transaction: ${rt.id}`)
        
        if (shouldStop) {
          console.log(`Deactivated recurring transaction ${rt.id} (reached end date)`)
        }
      } catch (error) {
        console.error(`Unexpected error processing ${rt.id}:`, error)
        errors.push({ id: rt.id, error: String(error) })
        errorCount++
      }
    }

    console.log(`Processing complete. Processed: ${processedCount}, Errors: ${errorCount}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Recurring transactions processed',
        processed: processedCount,
        errors: errorCount,
        errorDetails: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error in process-recurring-transactions:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * To deploy this function:
 * 
 * 1. Deploy the function:
 *    supabase functions deploy process-recurring-transactions
 * 
 * 2. Set up the cron job in Supabase SQL Editor:
 *    
 *    SELECT cron.schedule(
 *      'process-recurring-transactions',
 *      '0 0 * * *', -- Daily at midnight
 *      $$
 *      SELECT net.http_post(
 *        url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/process-recurring-transactions',
 *        headers := jsonb_build_object(
 *          'Content-Type', 'application/json',
 *          'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
 *        ),
 *        body := '{}'::jsonb
 *      ) as request_id;
 *      $$
 *    );
 * 
 * 3. To manually trigger (for testing):
 *    curl -X POST https://your-project.supabase.co/functions/v1/process-recurring-transactions \
 *      -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
 *      -H "Content-Type: application/json"
 * 
 * 4. To view cron jobs:
 *    SELECT * FROM cron.job;
 * 
 * 5. To unschedule:
 *    SELECT cron.unschedule('process-recurring-transactions');
 */

