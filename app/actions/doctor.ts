'use server'

import { revalidatePath } from 'next/cache'
import Doctor from '@/app/model/doctor.model'
import mongoDb from '@/app/db/mongo'
import mongoose from 'mongoose'

// Return type for the toggle email action
type ToggleEmailActionResult = {
  success: boolean
  message: string
  data?: {
    id: string
    email_sent: boolean
  }
}

/**
 * Server action to toggle the email_sent status of a doctor
 * @param id - The MongoDB ID of the doctor
 * @returns A result object with success status, message, and updated data
 */
export async function toggleDoctorEmailStatus(id: string): Promise<ToggleEmailActionResult> {
  try {
    // Connect to MongoDB
    await mongoDb()

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        success: false,
        message: 'Invalid doctor ID format'
      }
    }

    // Find the doctor
    const doctor = await Doctor.findById(id)

    if (!doctor) {
      return {
        success: false,
        message: 'Doctor not found'
      }
    }

    // Toggle the email_sent status
    doctor.email_sent = !doctor.email_sent

    // Save the updated doctor
    await doctor.save()

    // Revalidate the doctors page to update the UI
    revalidatePath('/doctors')

    return {
      success: true,
      message: `Doctor ${doctor.email_sent ? 'marked as contacted' : 'marked as not contacted'}`,
      data: {
        id: doctor._id.toString(),
        email_sent: doctor.email_sent
      }
    }
  } catch (error) {
    console.error('Error toggling doctor email status:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    }
  }
}

/**
 * Server action to bulk update email_sent status for multiple doctors
 * @param ids - Array of doctor IDs
 * @param status - The email_sent status to set (true or false)
 * @returns A result object with success status and message
 */
export async function bulkUpdateDoctorEmailStatus(
  ids: string[], 
  status: boolean
): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    // Connect to MongoDB
    await mongoDb()

    // Validate IDs
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id))
    
    if (validIds.length === 0) {
      return {
        success: false,
        message: 'No valid doctor IDs provided'
      }
    }

    // Convert string IDs to ObjectIDs
    const objectIds = validIds.map(id => new mongoose.Types.ObjectId(id))

    // Update all doctors at once
    const result = await Doctor.updateMany(
      { _id: { $in: objectIds } },
      { $set: { email_sent: status } }
    )

    // Revalidate the doctors page to update the UI
    revalidatePath('/doctors')

    return {
      success: true,
      message: `Updated ${result.modifiedCount} doctor records`,
      count: result.modifiedCount
    }
  } catch (error) {
    console.error('Error bulk updating doctor email status:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    }
  }
}