import { NextResponse } from "next/server";
import { getBigQueryClient, ensureDatasetLocation } from "../../../bigquery";
import { BigQueryError } from "../../../types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string } & Record<string, unknown>> }
) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(request.url);

    // Get pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");
    const offset = (page - 1) * pageSize;

    // Check if this is a DID project first, before initializing BigQuery
    if (projectId.startsWith('did:plc:')) {
      console.log('[GET /api/projects/[projectId]/members] Returning mock community member for DID project:', projectId);
      return NextResponse.json({
        success: true,
        data: [{
          id: '1',
          wallet_address_id: null,
          project_id: 1,
          first_name: 'Project',
          last_name: 'Owner',
          title: 'Project Lead',
          bio: 'This is a decentralized project managed through ATproto.',
          profile_image_url: null,
          display_order: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }],
        pagination: {
          total: 1,
          page: 1,
          pageSize: 50,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        }
      });
    }

    // Only initialize BigQuery for non-DID projects
    await ensureDatasetLocation();
    const bigquery = getBigQueryClient();
    const location = await ensureDatasetLocation();

    // Query community members for the project
    const query = `
      SELECT
        id,
        wallet_address_id,
        project_id,
        first_name,
        last_name,
        title,
        bio,
        profile_image_url,
        display_order,
        is_active,
        created_at,
        updated_at
      FROM \`ecocertain.green_globe_v2_development.community_members\`
      WHERE project_id = @projectId AND is_active = true
      ORDER BY display_order ASC NULLS LAST, first_name ASC, last_name ASC
      LIMIT ${pageSize}
      OFFSET ${offset}
    `;

    // Query to get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM \`ecocertain.green_globe_v2_development.community_members\`
      WHERE project_id = @projectId AND is_active = true
    `;

    const [rows] = await bigquery.query({
      query,
      params: { projectId: parseInt(projectId) },
      location: location || undefined,
    });

    const [countResults] = await bigquery.query({
      query: countQuery,
      params: { projectId: parseInt(projectId) },
      location: location || undefined,
    });

    const totalMembers = countResults[0]?.total || 0;
    const totalPages = Math.ceil(totalMembers / pageSize);

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        total: totalMembers,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    });

  } catch (error: unknown) {
    console.error("BigQuery error:", error);
    const bigQueryError = error as BigQueryError;
    return NextResponse.json(
      {
        success: false,
        error: bigQueryError.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string } & Record<string, unknown>> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();

    // For DID projects, return mock success (these should be handled by ATproto in frontend)
    if (projectId.startsWith('did:plc:')) {
      console.log('[POST /api/projects/[projectId]/members] Mock creating member for DID project:', projectId);
      return NextResponse.json({
        success: true,
        data: {
          id: Date.now().toString(),
          ...body,
          project_id: projectId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      });
    }

    // Only initialize BigQuery for non-DID projects
    await ensureDatasetLocation();
    const bigquery = getBigQueryClient();
    const location = await ensureDatasetLocation();

    // Generate a unique ID for the new member
    const memberId = Date.now().toString();

    const insertQuery = `
      INSERT INTO \`ecocertain.green_globe_v2_development.community_members\`
      (id, wallet_address_id, project_id, first_name, last_name, title, bio, profile_image_url, display_order, is_active, created_at, updated_at)
      VALUES (@id, @walletAddressId, @projectId, @firstName, @lastName, @title, @bio, @profileImageUrl, @displayOrder, @isActive, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())
    `;

    await bigquery.query({
      query: insertQuery,
      params: {
        id: memberId,
        walletAddressId: body.wallet_address_id || null,
        projectId: parseInt(projectId),
        firstName: body.first_name,
        lastName: body.last_name,
        title: body.title,
        bio: body.bio || null,
        profileImageUrl: body.profile_image_url || null,
        displayOrder: body.display_order || null,
        isActive: true,
      },
      location: location || undefined,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: memberId,
        ...body,
        project_id: parseInt(projectId),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    });

  } catch (error: unknown) {
    console.error("BigQuery error:", error);
    const bigQueryError = error as BigQueryError;
    return NextResponse.json(
      {
        success: false,
        error: bigQueryError.message,
      },
      { status: 500 }
    );
  }
}
