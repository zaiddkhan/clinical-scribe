// app/api/doctors/route.ts
import { NextRequest, NextResponse } from "next/server";
import Doctor from '@/app/model/doctor.model';
import mongoDb from "@/app/db/mongo";
import mongoose from "mongoose";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 1000;

export async function GET(request: NextRequest) {
  await mongoDb();
  try {
    // Get URL for parsing query parameters
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE)), MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    // Sorting parameters
    const sortField = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    // Using the correct type for MongoDB sort options
    const sortOptions: { [key: string]: 1 | -1 } = { [sortField]: sortOrder };

    // Search parameters
    const searchTerm = searchParams.get('search') || '';

    // Filter parameters
    const filters: any = {};

    // Specialization filter
    const specialization = searchParams.get('specialization');
    if (specialization) {
      filters.specialization = specialization;
    }

    // Email sent filter
    const emailSent = searchParams.get('emailSent');
    if (emailSent !== null) {
      filters.email_sent = emailSent === 'true';
    }

    // Phone exists filter
    const hasPhone = searchParams.get('hasPhone');
    if (hasPhone !== null) {
      if (hasPhone === 'true') {
        filters.phone = { $ne: '0000000000' };
      } else {
        filters.phone = '0000000000';
      }
    }

    // Website exists filter
    const hasWebsite = searchParams.get('hasWebsite');
    if (hasWebsite !== null) {
      if (hasWebsite === 'true') {
        filters.website = {
          $ne: 'No Website',
          $nin: ['', null]
        };
      } else {
        filters.website = { $in: ['No Website', '', null] };
      }
    }

    // Address exists filter
    const hasAddress = searchParams.get('hasAddress');
    if (hasAddress !== null) {
      if (hasAddress === 'true') {
        filters.address = { $ne: 'No Address' };
      } else {
        filters.address = 'No Address';
      }
    }

    // Search logic
    if (searchTerm) {
      filters.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { specialization: { $regex: searchTerm, $options: 'i' } },
        { address: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Execute query with all parameters
    const doctors = await Doctor.find(filters)
      .skip(skip)
      .limit(limit)
      .sort(sortOptions)
      .lean();

    // Get total count for pagination
    const totalDoctors = await Doctor.countDocuments(filters);
    const totalPages = Math.ceil(totalDoctors / limit);

    return NextResponse.json({
      success: true,
      data: doctors,
      pagination: {
        totalDoctors,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// Add a doctor stats endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, email_sent } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Doctor IDs are required' },
        { status: 400 }
      );
    }

    if (email_sent === undefined) {
      return NextResponse.json(
        { success: false, message: 'Email sent status is required' },
        { status: 400 }
      );
    }

    const result = await Doctor.updateMany(
      { _id: { $in: ids.map(id => new mongoose.Types.ObjectId(id)) } },
      { $set: { email_sent } }
    );

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: `Updated ${result.modifiedCount} doctor records`
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating doctors:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}