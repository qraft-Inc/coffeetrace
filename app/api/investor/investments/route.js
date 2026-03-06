import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '../../../../lib/authOptions';
import dbConnect from '../../../../lib/dbConnect';
import Investment from '../../../../models/Investment';
import User from '../../../../models/User';
import Cooperative from '../../../../models/Cooperative';
import Farmer from '../../../../models/Farmer';

/**
 * GET /api/investor/investments
 * Get investments for the current user
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'investor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query = { investorUserId: session.user.id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const investments = await Investment.find(query)
      .sort({ investmentDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('cooperativeId', 'name address certifications')
      .lean();

    const total = await Investment.countDocuments(query);

    return NextResponse.json({
      success: true,
      investments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching investments:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch investments', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/investor/investments
 * Create a new investment
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'investor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const {
      investorEmail,
      cooperativeId,
      investmentAmount,
      currency,
      expectedReturnPercentage,
      investmentTerm,
      coffeeType,
      riskLevel,
      notes,
      investmentGoals,
    } = body;

    // Validate required fields
    if (!investorEmail || !cooperativeId || !investmentAmount) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: investorEmail, cooperativeId, investmentAmount' },
        { status: 400 }
      );
    }

    if (investmentAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Investment amount must be positive' },
        { status: 400 }
      );
    }

    // Fetch cooperative details
    const cooperative = await Cooperative.findById(cooperativeId);
    if (!cooperative) {
      return NextResponse.json(
        { success: false, message: 'Cooperative not found' },
        { status: 404 }
      );
    }

    // Create or get investor user
    let investorUser = await User.findOne({ email: investorEmail });
    
    if (!investorUser) {
      // Create new investor user with password "investor123"
      const passwordHash = await bcrypt.hash('investor123', 12);
      
      investorUser = new User({
        name: investorEmail.split('@')[0], // Use email prefix as default name
        email: investorEmail,
        passwordHash,
        role: 'investor',
        isActive: true,
      });
      
      await investorUser.save();
    }

    // Count farmers in cooperative
    const farmerCount = await Farmer.countDocuments({ cooperativeId });

    // Calculate expected maturity date (assume seasonal harvest in ~9 months if not specified)
    const expectedMaturityDate = new Date();
    expectedMaturityDate.setMonth(expectedMaturityDate.getMonth() + 9);

    // Create investment
    const investment = new Investment({
      investorUserId: investorUser._id,
      cooperativeId,
      cooperativeName: cooperative.name,
      region: cooperative.address?.region,
      investmentAmount,
      currency: currency || 'UGX',
      expectedReturnPercentage: expectedReturnPercentage || 10,
      investmentDate: new Date(),
      expectedMaturityDate,
      cooperativeFarmerCount: farmerCount,
      cooperativeCertifications: cooperative.certifications?.map((c) => c.name) || [],
      coffeeType: coffeeType || 'Arabica',
      riskLevel: riskLevel || 'medium',
      investmentTerm: investmentTerm || 'Seasonal',
      notes,
      investmentGoals,
      status: 'pending',
      currentValue: investmentAmount,
      totalReturns: 0,
      returnPercentage: 0,
    });

    await investment.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Investment created successfully',
        investment: investment.toObject(),
        investorAccount: {
          isNewAccount: !investorUser.createdAt || new Date(investorUser.createdAt) > new Date(Date.now() - 5000),
          email: investorUser.email,
          password: 'investor123',
          loginUrl: '/auth?mode=signin',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating investment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create investment', error: error.message },
      { status: 500 }
    );
  }
}
