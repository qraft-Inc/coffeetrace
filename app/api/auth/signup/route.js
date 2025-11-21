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
    try {
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
        // Validate buyer-specific required fields
        const companyName = profileData.companyName || name;
        const businessType = profileData.businessType || 'other';
        
        console.log('Creating buyer with:', { companyName, businessType, email: email.toLowerCase() });
        
        if (!companyName) {
          // Clean up the user we just created
          await User.findByIdAndDelete(user._id);
          return NextResponse.json(
            { error: 'Company name is required for buyers' },
            { status: 400 }
          );
        }

        const buyerData = {
          userId: user._id,
          companyName,
          businessType,
          email: email.toLowerCase(),
        };
        
        // Only add phone if it exists
        if (phone) {
          buyerData.phone = phone;
        }
        
        const buyer = new Buyer(buyerData);
        
        console.log('Saving buyer profile...');
        await buyer.save();
        console.log('Buyer profile saved:', buyer._id);
        
        user.buyerProfile = buyer._id;
        await user.save();
        console.log('User updated with buyer profile');
      }
    } catch (profileError) {
      // If profile creation fails, delete the user
      console.error('Profile creation error:', profileError);
      console.error('Error details:', profileError.message);
      console.error('Stack:', profileError.stack);
      await User.findByIdAndDelete(user._id);
      throw profileError;
    }

    // Log signup event
    try {
      await AuditTrail.log({
        entityType: 'User',
        entityId: user._id,
        action: 'created',
        actorId: user._id,
        description: `New ${role} account created`,
      });
    } catch (auditError) {
      console.error('Audit log error (non-blocking):', auditError);
    }

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
