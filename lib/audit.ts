import { getDatabase } from "./mongodb"
import { ObjectId } from "mongodb"
import type { AuditLog } from "./models"

export interface AuditLogEntry {
  user_id: string
  action: string
  collection_name: string
  document_id?: string
  old_values?: any
  new_values?: any
  ip_address?: string
  user_agent?: string
  session_id?: string
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const db = await getDatabase()

    const auditLog: AuditLog = {
      user_id: new ObjectId(entry.user_id),
      action: entry.action,
      collection_name: entry.collection_name,
      document_id: entry.document_id ? new ObjectId(entry.document_id) : undefined,
      old_values: entry.old_values,
      new_values: entry.new_values,
      ip_address: entry.ip_address,
      user_agent: entry.user_agent,
      session_id: entry.session_id,
      created_at: new Date(),
    }

    await db.auditLogs.insertOne(auditLog)
  } catch (error) {
    console.error("Failed to log audit event:", error)
  }
}
