# Soft Delete System Optimization - Recommendation

**Date:** 2025-09-30  
**Status:** 📋 RECOMMENDATION  
**Current State:** Soft deletes working with `deleted_at` column in each table

---

## 🎯 Current Situation

### **What We Have Now:**
- ✅ `deleted_at` column in `transactions`, `categories`, and `budgets` tables
- ✅ Soft delete working correctly (records marked as deleted, not removed)
- ✅ RLS policies filtering out deleted records automatically
- ✅ Deleted records preserved in database

### **The Issue:**
- Many soft-deleted records accumulating in main tables
- No easy way to view all deleted items in one place
- No built-in restore functionality
- Deleted records mixed with active records

---

## 💡 Recommended Solution: Hybrid Approach

### **Keep Current System + Add Unified Trash Table**

I recommend a **hybrid approach** that combines the best of both worlds:

1. **Keep `deleted_at` column** in existing tables (industry standard, efficient)
2. **Add ONE unified `deleted_items` table** for tracking and restore functionality

### **Why This Is Best:**

✅ **Simple**: Only ONE new table instead of 3 separate tables  
✅ **Efficient**: Queries still use `deleted_at` for filtering (fast)  
✅ **Organized**: All deleted items in one place for easy management  
✅ **Restorable**: Easy to implement restore functionality  
✅ **Auditable**: Track who deleted what and when  
✅ **Scalable**: Easy to add more tables in the future  

---

## 📊 Proposed Schema

### **New Table: `deleted_items`**

```sql
CREATE TABLE deleted_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What was deleted
  table_name TEXT NOT NULL,           -- 'transactions', 'categories', 'budgets'
  record_id UUID NOT NULL,            -- ID of the deleted record
  
  -- Who and when
  user_id TEXT NOT NULL,              -- Who deleted it
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- For restore functionality
  record_data JSONB NOT NULL,         -- Full record data before deletion
  
  -- Optional: Reason for deletion
  deletion_reason TEXT,               -- Optional user note
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_deleted_items_user_id ON deleted_items(user_id);
CREATE INDEX idx_deleted_items_table_name ON deleted_items(table_name);
CREATE INDEX idx_deleted_items_deleted_at ON deleted_items(deleted_at);
CREATE INDEX idx_deleted_items_record_id ON deleted_items(record_id);

-- RLS Policies
ALTER TABLE deleted_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deleted items" ON deleted_items
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own deleted items" ON deleted_items
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);
```

---

## 🔄 How It Works

### **Deletion Flow:**

```
User clicks "Delete Transaction"
  ↓
API receives DELETE request
  ↓
1. Get full record data
  ↓
2. Insert into deleted_items table (with full record data)
  ↓
3. Update deleted_at in original table
  ↓
4. Return success
  ↓
Record is "deleted" but fully recoverable
```

### **Example API Implementation:**

```typescript
// DELETE /api/transactions/[id]
export async function DELETE(request: NextRequest, { params }) {
  const { id } = await params
  
  // 1. Get the full record before deletion
  const { data: transaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single()
  
  // 2. Save to deleted_items table
  await supabase
    .from('deleted_items')
    .insert({
      table_name: 'transactions',
      record_id: id,
      user_id: user.id,
      record_data: transaction,
      deleted_at: new Date().toISOString()
    })
  
  // 3. Soft delete in original table
  await supabase
    .from('transactions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  
  return NextResponse.json({ success: true })
}
```

---

## 🎨 UI Features Enabled

### **1. Unified Trash Bin Page**

```typescript
// /trash page - Shows ALL deleted items
const { data: deletedItems } = await supabase
  .from('deleted_items')
  .select('*')
  .order('deleted_at', { ascending: false })

// Group by table_name for organized display
const groupedItems = {
  transactions: deletedItems.filter(i => i.table_name === 'transactions'),
  categories: deletedItems.filter(i => i.table_name === 'categories'),
  budgets: deletedItems.filter(i => i.table_name === 'budgets')
}
```

### **2. Restore Functionality**

```typescript
// PUT /api/trash/[id]/restore
export async function PUT(request: NextRequest, { params }) {
  const { id } = await params
  
  // 1. Get deleted item
  const { data: deletedItem } = await supabase
    .from('deleted_items')
    .select('*')
    .eq('id', id)
    .single()
  
  // 2. Restore in original table
  await supabase
    .from(deletedItem.table_name)
    .update({ deleted_at: null })
    .eq('id', deletedItem.record_id)
  
  // 3. Remove from deleted_items
  await supabase
    .from('deleted_items')
    .delete()
    .eq('id', id)
  
  return NextResponse.json({ success: true })
}
```

### **3. Permanent Delete**

```typescript
// DELETE /api/trash/[id]/permanent
export async function DELETE(request: NextRequest, { params }) {
  const { id } = await params
  
  // 1. Get deleted item
  const { data: deletedItem } = await supabase
    .from('deleted_items')
    .select('*')
    .eq('id', id)
    .single()
  
  // 2. Permanently delete from original table
  await supabase
    .from(deletedItem.table_name)
    .delete()
    .eq('id', deletedItem.record_id)
  
  // 3. Remove from deleted_items
  await supabase
    .from('deleted_items')
    .delete()
    .eq('id', id)
  
  return NextResponse.json({ success: true })
}
```

### **4. Auto-Cleanup (Optional)**

```sql
-- Function to auto-delete items older than 30 days
CREATE OR REPLACE FUNCTION cleanup_old_deleted_items()
RETURNS void AS $$
BEGIN
  -- Permanently delete records older than 30 days
  DELETE FROM transactions
  WHERE deleted_at < NOW() - INTERVAL '30 days';
  
  DELETE FROM categories
  WHERE deleted_at < NOW() - INTERVAL '30 days';
  
  DELETE FROM budgets
  WHERE deleted_at < NOW() - INTERVAL '30 days';
  
  -- Remove from deleted_items
  DELETE FROM deleted_items
  WHERE deleted_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule to run daily (using pg_cron extension)
SELECT cron.schedule('cleanup-deleted-items', '0 2 * * *', 'SELECT cleanup_old_deleted_items()');
```

---

## 📈 Benefits

### **For Users:**
- ✅ **Trash Bin UI** - See all deleted items in one place
- ✅ **Easy Restore** - Undo accidental deletions
- ✅ **Peace of Mind** - Know data isn't lost forever
- ✅ **Organized View** - Deleted items grouped by type

### **For Developers:**
- ✅ **Simple Queries** - Still use `deleted_at` for filtering
- ✅ **Audit Trail** - Full history of deletions
- ✅ **Easy Restore** - All data preserved in JSONB
- ✅ **Scalable** - Easy to add more tables

### **For Business:**
- ✅ **Data Recovery** - Restore accidentally deleted data
- ✅ **Compliance** - Meet data retention requirements
- ✅ **Analytics** - Analyze deletion patterns
- ✅ **Customer Support** - Help users recover data

---

## 🚀 Implementation Plan

### **Phase 1: Create Table** (15 minutes)
1. Create `deleted_items` table migration
2. Add indexes and RLS policies
3. Test table creation

### **Phase 2: Update API Routes** (30 minutes)
1. Update DELETE endpoints to insert into `deleted_items`
2. Test deletion flow
3. Verify data is saved correctly

### **Phase 3: Restore API** (20 minutes)
1. Create restore endpoint
2. Test restore functionality
3. Verify data integrity

### **Phase 4: Trash Bin UI** (1 hour)
1. Create `/trash` page
2. Display deleted items grouped by type
3. Add restore and permanent delete buttons
4. Test user flow

### **Phase 5: Auto-Cleanup** (Optional, 15 minutes)
1. Create cleanup function
2. Schedule daily cleanup
3. Test cleanup logic

**Total Time: ~2 hours**

---

## ❌ Why NOT Create Separate Tables

### **Option: 3 Separate Tables (delete_transactions, delete_categories, delete_budgets)**

**Cons:**
- ❌ More tables to manage (3 new tables)
- ❌ Duplicate schema definitions
- ❌ Harder to query all deleted items
- ❌ More complex migrations
- ❌ Harder to add new tables in future
- ❌ More RLS policies to maintain

**Verdict:** Not recommended. Too much complexity for little benefit.

---

## ✅ Recommended Next Steps

1. **Review this recommendation** - Make sure it fits your needs
2. **Create `deleted_items` table** - Run migration
3. **Update DELETE endpoints** - Add logging to deleted_items
4. **Test thoroughly** - Verify deletion and data preservation
5. **Build Trash Bin UI** - Create user-facing restore functionality

---

## 📊 Summary

**Current System:**
- ✅ Soft deletes with `deleted_at` column (KEEP THIS)

**Add:**
- ✅ ONE unified `deleted_items` table for tracking and restore

**Result:**
- ✅ Organized deleted items
- ✅ Easy restore functionality
- ✅ Audit trail
- ✅ Scalable solution
- ✅ Only ONE new table

**This is the industry-standard approach used by major applications!** 🎯

