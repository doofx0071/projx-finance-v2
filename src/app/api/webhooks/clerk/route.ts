import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || process.env.CLERK_SECRET_KEY!)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400,
    })
  }

  // Get the ID and type
  const { id } = evt.data
  const eventType = evt.type

  console.log(`Webhook with an ID of ${id} and type of ${eventType}`)
  console.log('Webhook body:', body)

  try {
    switch (eventType) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data

        // Create user in Supabase
        const { data: user, error } = await supabaseAdmin
          .from('users')
          .insert({
            id: id,
            email: email_addresses[0]?.email_address || '',
            first_name: first_name,
            last_name: last_name,
            avatar_url: image_url,
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating user in Supabase:', error)
          return NextResponse.json(
            { error: 'Failed to create user in database' },
            { status: 500 }
          )
        }

        console.log('User created in Supabase:', user)
        return NextResponse.json({ message: 'User created successfully', user })
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data

        // Update user in Supabase
        const { data: user, error } = await supabaseAdmin
          .from('users')
          .update({
            email: email_addresses[0]?.email_address || '',
            first_name: first_name,
            last_name: last_name,
            avatar_url: image_url,
          })
          .eq('id', id)
          .select()
          .single()

        if (error) {
          console.error('Error updating user in Supabase:', error)
          return NextResponse.json(
            { error: 'Failed to update user in database' },
            { status: 500 }
          )
        }

        console.log('User updated in Supabase:', user)
        return NextResponse.json({ message: 'User updated successfully', user })
      }

      case 'user.deleted': {
        const { id } = evt.data

        // Delete user from Supabase
        const { error } = await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', id!)

        if (error) {
          console.error('Error deleting user from Supabase:', error)
          return NextResponse.json(
            { error: 'Failed to delete user from database' },
            { status: 500 }
          )
        }

        console.log('User deleted from Supabase:', id)
        return NextResponse.json({ message: 'User deleted successfully' })
      }

      default:
        console.log(`Unhandled event type: ${eventType}`)
        return NextResponse.json({ message: 'Event type not handled' })
    }
  } catch (error) {
    console.error(`Error handling ${eventType} event:`, error)
    return NextResponse.json(
      { error: `Failed to handle ${eventType} event` },
      { status: 500 }
    )
  }
}
