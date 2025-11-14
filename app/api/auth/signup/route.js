import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import User from '../../../../models/User';
import Farmer from '../../../../models/Farmer';
import Buyer from '../../../../models/Buyer';
import AuditTrail from '../../../../models/AuditTrail';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/signup
 * Register a new user account
 */
export async function POST(request) {
  try {
    // Safety guard for build time
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { name, email, password, role, phone, ...profileData } = body;

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['farmer', 'coopAdmin', 'buyer', 'investor', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      phone,
    });

    await user.save();

    // Create role-specific profile
    if (role === 'farmer') {
      const farmer = new Farmer({
        userId: user._id,
        name,
        phone,
        email: email.toLowerCase(),
        ...profileData,
      });
      await farmer.save();
      user.farmerProfile = farmer._id;
      await user.save();
    } else if (role === 'buyer') {
      const buyer = new Buyer({
        userId: user._id,
        companyName: profileData.companyName || name,
        businessType: profileData.businessType || 'other',
        phone,
        email: email.toLowerCase(),
        ...profileData,
      });
      await buyer.save();
      user.buyerProfile = buyer._id;
      await user.save();
    }

    // Log signup event
    await AuditTrail.log({
      entityType: 'User',
      entityId: user._id,
      action: 'created',
      actorId: user._id,
      description: `New ${role} account created`,
    });

    // Return success (without password hash)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    return NextResponse.json(
      { message: 'User created successfully', user: userResponse },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    );
  }
}
