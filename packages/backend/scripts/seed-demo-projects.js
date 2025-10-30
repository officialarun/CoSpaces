/**
 * Seed Demo Projects for Testing
 * 
 * Creates realistic land investment projects across India
 * Run: node packages/backend/scripts/seed-demo-projects.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../src/models/Project.model');
const User = require('../src/models/User.model');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const demoProjects = [
  {
    projectName: "Bangalore Tech Park Land - Whitefield",
    projectCode: "BLR-WF-001",
    description: "Prime commercial land parcel in Whitefield, Bangalore's IT hub. Located near major tech parks including ITPL and Brigade Tech Gardens. Excellent connectivity via Old Madras Road and upcoming metro extension. Ideal for commercial development or long-term appreciation.",
    shortDescription: "5 acres commercial land in Whitefield IT corridor",
    landDetails: {
      location: {
        address: "Survey No. 45/2, EPIP Zone, Whitefield",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560066",
        coordinates: {
          latitude: 12.9698,
          longitude: 77.7499
        }
      },
      totalArea: {
        value: 5.2,
        unit: "acres"
      },
      landType: "commercial",
      zoning: "Commercial - IT/ITES",
      surveyNumber: "45/2",
      plotNumber: "WF-EPIP-045",
      titleDeedNumber: "BLR/REG/2023/10456",
      registrationDetails: {
        registrationNumber: "KA-BLR-SRO-2023-10456",
        registrationDate: new Date("2023-08-15"),
        subRegistrarOffice: "Whitefield Sub-Registrar Office"
      }
    },
    financials: {
      landValue: 52000000, // 52 Cr
      acquisitionCost: 54600000, // Including 5% stamp duty
      targetRaise: 52000000,
      minimumInvestment: 1000000,
      maximumInvestment: 10000000,
      expectedIRR: {
        low: 12,
        high: 18,
        target: 15
      },
      holdingPeriod: 36, // 3 years
      exitStrategy: "development",
      projectedExitValue: 78000000 // 78 Cr (50% appreciation)
    },
    reraCompliance: {
      applicable: false,
      determinationDate: new Date("2023-09-01"),
      determinationReason: "Land bank project, no immediate development planned",
      reraProjectType: "not_applicable"
    },
    status: "listed",
    timeline: {
      draftCreatedAt: new Date("2023-09-01"),
      listedAt: new Date("2023-10-15"),
      fundraisingStartDate: new Date("2023-10-15"),
      fundraisingEndDate: new Date("2024-01-15"),
      expectedAcquisitionDate: new Date("2024-02-01"),
      expectedExitDate: new Date("2027-02-01")
    },
    media: {
      coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
      images: [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
      ]
    },
    riskFactors: [
      {
        category: "Market Risk",
        description: "IT sector slowdown could impact land prices",
        severity: "medium"
      },
      {
        category: "Regulatory Risk",
        description: "Zoning regulations may change",
        severity: "low"
      }
    ],
    tags: ["commercial", "IT hub", "Bangalore", "high-growth"],
    category: "Commercial Land",
    isPublic: true
  },
  
  {
    projectName: "Pune Agricultural Farm - Bhor Region",
    projectCode: "PUN-BHR-002",
    description: "Fertile agricultural land in Bhor taluka, known for sugarcane and vegetable cultivation. Reliable water supply from nearby dam. All-season farming possible. Government-backed MSP support. Good road connectivity to Pune city (45 km).",
    shortDescription: "25 acres agricultural land with water access",
    landDetails: {
      location: {
        address: "Gat No. 128, Village Morgaon, Bhor Taluka",
        city: "Pune",
        state: "Maharashtra",
        pincode: "412206",
        coordinates: {
          latitude: 18.1484,
          longitude: 73.8433
        }
      },
      totalArea: {
        value: 25.5,
        unit: "acres"
      },
      landType: "agricultural",
      zoning: "Agricultural - Multi-crop",
      surveyNumber: "128/1B",
      plotNumber: "BHOR-MG-128",
      titleDeedNumber: "MH/PUN/2022/08934"
    },
    financials: {
      landValue: 15300000, // 1.53 Cr (6L per acre)
      acquisitionCost: 16065000,
      targetRaise: 15300000,
      minimumInvestment: 500000,
      maximumInvestment: 5000000,
      expectedIRR: {
        low: 8,
        high: 12,
        target: 10
      },
      holdingPeriod: 60, // 5 years
      exitStrategy: "resale",
      projectedExitValue: 24500000 // 60% appreciation
    },
    reraCompliance: {
      applicable: false,
      determinationDate: new Date("2022-11-01"),
      determinationReason: "Agricultural land, RERA not applicable",
      reraProjectType: "not_applicable"
    },
    status: "fundraising",
    timeline: {
      draftCreatedAt: new Date("2022-11-01"),
      listedAt: new Date("2023-01-10"),
      fundraisingStartDate: new Date("2023-01-10"),
      fundraisingEndDate: new Date("2023-12-31"),
      expectedAcquisitionDate: new Date("2024-01-15")
    },
    media: {
      coverImage: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
      images: [
        "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800"
      ]
    },
    riskFactors: [
      {
        category: "Climate Risk",
        description: "Monsoon dependency for water supply",
        severity: "medium"
      },
      {
        category: "Price Risk",
        description: "Agricultural commodity price fluctuations",
        severity: "low"
      }
    ],
    tags: ["agricultural", "farming", "Maharashtra", "water-access"],
    category: "Agricultural Land",
    isPublic: true
  },

  {
    projectName: "Gurgaon Highway Retail Plot - NH-8",
    projectCode: "GGN-NH8-003",
    description: "Strategic commercial plot on National Highway 8 (Delhi-Jaipur Highway). High visibility location with daily traffic of 50,000+ vehicles. Approved for retail and hospitality development. 500m from proposed metro station. Ideal for retail plaza or hotel development.",
    shortDescription: "3 acres highway-facing commercial plot",
    landDetails: {
      location: {
        address: "Khasra No. 567, Sector 37D, Near Rajiv Chowk",
        city: "Gurugram",
        state: "Haryana",
        pincode: "122001",
        coordinates: {
          latitude: 28.4089,
          longitude: 77.0322
        }
      },
      totalArea: {
        value: 3.1,
        unit: "acres"
      },
      landType: "commercial",
      zoning: "Commercial - Retail/Hospitality",
      surveyNumber: "567/12",
      plotNumber: "GGN-37D-567",
      titleDeedNumber: "HR/GGN/2023/15678"
    },
    financials: {
      landValue: 93000000, // 93 Cr (30 Cr per acre)
      acquisitionCost: 97650000,
      targetRaise: 93000000,
      minimumInvestment: 2000000,
      maximumInvestment: 20000000,
      expectedIRR: {
        low: 15,
        high: 22,
        target: 18
      },
      holdingPeriod: 24, // 2 years
      exitStrategy: "development",
      projectedExitValue: 130000000 // 40% appreciation
    },
    reraCompliance: {
      applicable: true,
      determinationDate: new Date("2023-06-01"),
      determinationReason: "Commercial development planned",
      reraRegistrationNumber: "HRERA-GGN-2023-000567",
      reraRegistrationDate: new Date("2023-07-15"),
      reraState: "Haryana",
      reraProjectType: "commercial"
    },
    status: "listed",
    timeline: {
      draftCreatedAt: new Date("2023-06-01"),
      listedAt: new Date("2023-08-01"),
      fundraisingStartDate: new Date("2023-08-01"),
      fundraisingEndDate: new Date("2023-12-31")
    },
    media: {
      coverImage: "https://images.unsplash.com/photo-1486718448742-163732cd1544?w=800",
      images: [
        "https://images.unsplash.com/photo-1486718448742-163732cd1544?w=800",
        "https://images.unsplash.com/photo-1583377181643-c6c99bbfb6b3?w=800"
      ]
    },
    riskFactors: [
      {
        category: "Development Risk",
        description: "Approvals for development may take time",
        severity: "medium"
      },
      {
        category: "Market Risk",
        description: "Retail market cyclicality",
        severity: "medium"
      }
    ],
    tags: ["commercial", "highway", "retail", "Gurgaon", "high-traffic"],
    category: "Commercial Land",
    isPublic: true
  },

  {
    projectName: "Hyderabad Residential Plotted Development",
    projectCode: "HYD-PAT-004",
    description: "RERA-approved residential plotted development project in Patancheru. 150 plots ranging from 150-300 sq yards. Developed with roads, drainage, water, and electricity. Gated community concept. 15 km from Hitech City. Perfect for end-users and investors.",
    shortDescription: "Plotted development with 150 residential plots",
    landDetails: {
      location: {
        address: "Survey No. 234, Patancheru Municipality",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "502319",
        coordinates: {
          latitude: 17.5326,
          longitude: 78.2646
        }
      },
      totalArea: {
        value: 45.0,
        unit: "acres"
      },
      landType: "residential",
      zoning: "Residential - Plotted Development",
      surveyNumber: "234/A",
      plotNumber: "PAT-RES-234",
      titleDeedNumber: "TG/HYD/2022/23456"
    },
    financials: {
      landValue: 36000000, // 36 Cr (80L per acre)
      acquisitionCost: 37800000,
      targetRaise: 36000000,
      minimumInvestment: 1000000,
      maximumInvestment: 10000000,
      expectedIRR: {
        low: 18,
        high: 25,
        target: 22
      },
      holdingPeriod: 36, // 3 years
      exitStrategy: "resale",
      projectedExitValue: 63000000 // 75% appreciation after development
    },
    reraCompliance: {
      applicable: true,
      determinationDate: new Date("2022-09-01"),
      determinationReason: "Residential plotted development project",
      reraRegistrationNumber: "RERA-TG-2022-234A",
      reraRegistrationDate: new Date("2022-10-15"),
      reraState: "Telangana",
      reraProjectType: "plotted_development"
    },
    status: "fundraising",
    timeline: {
      draftCreatedAt: new Date("2022-09-01"),
      listedAt: new Date("2023-02-01"),
      fundraisingStartDate: new Date("2023-02-01"),
      fundraisingEndDate: new Date("2023-11-30")
    },
    media: {
      coverImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
      images: [
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
        "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800"
      ]
    },
    riskFactors: [
      {
        category: "Execution Risk",
        description: "Development timeline may extend",
        severity: "medium"
      },
      {
        category: "Market Risk",
        description: "Residential plot demand fluctuation",
        severity: "low"
      }
    ],
    tags: ["residential", "plotted", "gated-community", "Hyderabad"],
    category: "Residential Land",
    isPublic: true
  },

  {
    projectName: "Chennai Industrial Land - Oragadam",
    projectCode: "CHN-ORG-005",
    description: "Industrial land in Oragadam Industrial Corridor, part of Chennai-Bangalore Industrial Corridor (CBIC). Surrounded by Hyundai, Daimler, Ford manufacturing units. Excellent infrastructure with 4-lane approach road. Water, power, and effluent treatment facilities nearby.",
    shortDescription: "10 acres industrial land in auto corridor",
    landDetails: {
      location: {
        address: "T.S. No. 89/3B, Oragadam Industrial Growth Center",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "602105",
        coordinates: {
          latitude: 12.8776,
          longitude: 79.9831
        }
      },
      totalArea: {
        value: 10.2,
        unit: "acres"
      },
      landType: "industrial",
      zoning: "Industrial - Manufacturing",
      surveyNumber: "89/3B",
      plotNumber: "ORG-IND-089",
      titleDeedNumber: "TN/CHN/2023/34567"
    },
    financials: {
      landValue: 30600000, // 30.6 Cr (3 Cr per acre)
      acquisitionCost: 32130000,
      targetRaise: 30600000,
      minimumInvestment: 1500000,
      maximumInvestment: 15000000,
      expectedIRR: {
        low: 12,
        high: 16,
        target: 14
      },
      holdingPeriod: 48, // 4 years
      exitStrategy: "lease",
      projectedExitValue: 45000000 // 47% appreciation
    },
    reraCompliance: {
      applicable: false,
      determinationDate: new Date("2023-05-01"),
      determinationReason: "Industrial land, RERA not applicable",
      reraProjectType: "not_applicable"
    },
    status: "listed",
    timeline: {
      draftCreatedAt: new Date("2023-05-01"),
      listedAt: new Date("2023-07-15"),
      fundraisingStartDate: new Date("2023-07-15"),
      fundraisingEndDate: new Date("2024-01-15")
    },
    media: {
      coverImage: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800",
      images: [
        "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800",
        "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800"
      ]
    },
    riskFactors: [
      {
        category: "Industry Risk",
        description: "Automotive sector cyclicality",
        severity: "medium"
      },
      {
        category: "Environmental Risk",
        description: "Pollution control compliance requirements",
        severity: "low"
      }
    ],
    tags: ["industrial", "manufacturing", "auto-corridor", "Chennai"],
    category: "Industrial Land",
    isPublic: true
  },

  {
    projectName: "Jaipur Mixed-Use Development - Ajmer Road",
    projectCode: "JAI-AJM-006",
    description: "Premium mixed-use development land on Ajmer Road. Master plan approved for residential towers + retail. FSI of 2.5. Located in high-growth corridor between Jaipur and Kishangarh. Proposed metro extension within 1 km. Excellent investment opportunity.",
    shortDescription: "8 acres mixed-use development land",
    landDetails: {
      location: {
        address: "Khasra No. 456, Village Pratap Nagar, Ajmer Road",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302021",
        coordinates: {
          latitude: 26.8467,
          longitude: 75.7873
        }
      },
      totalArea: {
        value: 8.0,
        unit: "acres"
      },
      landType: "mixed_use",
      zoning: "Mixed Use - Residential + Commercial",
      surveyNumber: "456/2A",
      plotNumber: "JAI-AJM-456",
      titleDeedNumber: "RJ/JAI/2023/12345"
    },
    financials: {
      landValue: 40000000, // 40 Cr (5 Cr per acre)
      acquisitionCost: 42000000,
      targetRaise: 40000000,
      minimumInvestment: 1000000,
      maximumInvestment: 10000000,
      expectedIRR: {
        low: 16,
        high: 22,
        target: 19
      },
      holdingPeriod: 30, // 2.5 years
      exitStrategy: "development",
      projectedExitValue: 64000000 // 60% appreciation
    },
    reraCompliance: {
      applicable: true,
      determinationDate: new Date("2023-04-01"),
      determinationReason: "Mixed-use development with residential component",
      reraRegistrationNumber: "RERA-RAJ-2023-456A",
      reraRegistrationDate: new Date("2023-06-01"),
      reraState: "Rajasthan",
      reraProjectType: "residential"
    },
    status: "fundraising",
    timeline: {
      draftCreatedAt: new Date("2023-04-01"),
      listedAt: new Date("2023-08-01"),
      fundraisingStartDate: new Date("2023-08-01"),
      fundraisingEndDate: new Date("2023-12-31")
    },
    media: {
      coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      images: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800"
      ]
    },
    riskFactors: [
      {
        category: "Development Risk",
        description: "Complex mixed-use approvals",
        severity: "medium"
      },
      {
        category: "Market Risk",
        description: "Real estate market cycles",
        severity: "medium"
      }
    ],
    tags: ["mixed-use", "development", "Jaipur", "metro-proximity"],
    category: "Mixed Use Land",
    isPublic: true
  }
];

const seedProjects = async () => {
  try {
    console.log('🌱 Starting project seeding...\n');

    // Find an admin or asset manager user to assign as creator/manager
    let assetManager = await User.findOne({ role: 'asset_manager' });
    
    if (!assetManager) {
      // Try to find admin
      assetManager = await User.findOne({ role: 'admin' });
    }

    if (!assetManager) {
      console.log('⚠️  No asset manager or admin found. Creating a demo asset manager...');
      
      // Create a demo asset manager
      assetManager = await User.create({
        email: 'assetmanager@fractionalland.com',
        password: 'AssetManager@123', // Will be hashed by pre-save hook
        phone: '+919876543210', // Required field
        role: 'asset_manager',
        kycStatus: 'approved',
        isEmailVerified: true,
        profile: {
          firstName: 'Demo',
          lastName: 'Asset Manager'
        },
        onboardingCompleted: true
      });
      
      console.log('✅ Demo asset manager created:', assetManager.email);
    }

    console.log(`📋 Using asset manager: ${assetManager.email}\n`);

    // Clear existing demo projects
    const deleteResult = await Project.deleteMany({ 
      projectCode: { $in: demoProjects.map(p => p.projectCode) } 
    });
    console.log(`🗑️  Removed ${deleteResult.deletedCount} existing demo projects\n`);

    // Insert demo projects
    const createdProjects = [];
    
    for (const projectData of demoProjects) {
      const project = await Project.create({
        ...projectData,
        assetManager: assetManager._id,
        createdBy: assetManager._id,
        updatedBy: assetManager._id,
        // Set some approvals for listed projects
        ...(projectData.status === 'listed' && {
          approvals: {
            legalApproval: {
              approved: true,
              approvedBy: assetManager._id,
              approvedAt: new Date(),
              comments: "All legal documents verified"
            },
            complianceApproval: {
              approved: true,
              approvedBy: assetManager._id,
              approvedAt: new Date(),
              comments: "RERA and regulatory compliance confirmed"
            },
            assetManagerApproval: {
              approved: true,
              approvedBy: assetManager._id,
              approvedAt: new Date(),
              comments: "Investment thesis approved"
            },
            adminApproval: {
              approved: true,
              approvedBy: assetManager._id,
              approvedAt: new Date(),
              comments: "Approved for listing"
            }
          }
        })
      });
      
      createdProjects.push(project);
      console.log(`✅ Created: ${project.projectName} (${project.projectCode}) - ${project.status}`);
    }

    console.log(`\n🎉 Successfully seeded ${createdProjects.length} demo projects!\n`);
    
    // Summary
    console.log('📊 SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Projects: ${createdProjects.length}`);
    console.log(`Listed Projects: ${createdProjects.filter(p => p.status === 'listed').length}`);
    console.log(`Fundraising Projects: ${createdProjects.filter(p => p.status === 'fundraising').length}`);
    console.log('\nProjects by Type:');
    console.log(`  Commercial: ${createdProjects.filter(p => p.landDetails.landType === 'commercial').length}`);
    console.log(`  Agricultural: ${createdProjects.filter(p => p.landDetails.landType === 'agricultural').length}`);
    console.log(`  Residential: ${createdProjects.filter(p => p.landDetails.landType === 'residential').length}`);
    console.log(`  Industrial: ${createdProjects.filter(p => p.landDetails.landType === 'industrial').length}`);
    console.log(`  Mixed Use: ${createdProjects.filter(p => p.landDetails.landType === 'mixed_use').length}`);
    console.log('\nProjects by City:');
    const cities = {};
    createdProjects.forEach(p => {
      const city = p.landDetails.location.city;
      cities[city] = (cities[city] || 0) + 1;
    });
    Object.entries(cities).forEach(([city, count]) => {
      console.log(`  ${city}: ${count}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('💡 Next Steps:');
    console.log('1. Visit the projects page to see the demo projects');
    console.log('2. Click on any project to view details');
    console.log('3. Test investment flows with these projects');
    console.log('4. Create subscriptions and distributions for testing\n');

    console.log('🔐 Demo Asset Manager Credentials:');
    console.log(`   Email: ${assetManager.email}`);
    console.log(`   Password: AssetManager@123 (if newly created)\n`);

  } catch (error) {
    console.error('❌ Error seeding projects:', error);
    throw error;
  }
};

// Run the seeder
const run = async () => {
  try {
    await connectDB();
    await seedProjects();
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

run();

