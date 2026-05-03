import { supabase } from "@/lib/supabase";

/**
 * Base repository with common CRUD operations
 * Provides abstraction layer for Supabase database operations
 */
export class BaseRepository<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Get a single record by ID
   */
  async getById(id: string, select = "*") {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(select)
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data as unknown as T | null;
  }

  /**
   * Get all records with optional filters
   */
  async getAll(filters: Record<string, unknown> = {}, select = "*") {
    let query = supabase.from(this.tableName).select(select);
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data, error } = await query;
    if (error) throw error;
    return data as unknown as T[];
  }

  /**
   * Create a new record
   */
  async create(record: Partial<T>) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(record)
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as T;
  }

  /**
   * Update a record by ID
   */
  async update(id: string, updates: Partial<T>) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as T;
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  }

  /**
   * Upsert a record (insert or update)
   */
  async upsert(record: Partial<T>, onConflict?: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .upsert(record, { onConflict: onConflict as `${string}.${string}` })
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as T;
  }
}
