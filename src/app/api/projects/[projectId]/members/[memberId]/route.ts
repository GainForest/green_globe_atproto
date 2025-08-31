import { NextResponse } from "next/server";
import { getBigQueryClient, ensureDatasetLocation } from "../../../../bigquery";
import { BigQueryError } from "../../../../types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string; memberId: string } & Record<string, unknown>> }
) {
  try {
    const { projectId, memberId } = await params;

    // For DID projects, return mock data
    if (projectId.startsWith('did:plc:')) {
      console.log('[GET /api/projects/[projectId]/members/[memberId]] Returning mock member for DID project:', projectId);
      return NextResponse.json({
        success: true,
        data: {
          id: memberId,
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
        }
      });
    }

    // Only initialize BigQuery for non-DID projects
    await ensureDatasetLocation();
    const bigquery = getBigQueryClient();
    const location = await ensureDatasetLocation();

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
      WHERE id = @memberId AND project_id = @projectId AND is_active = true
      LIMIT 1
    `;

    const [rows] = await bigquery.query({
      query,
      params: {
        memberId,
        projectId: parseInt(projectId)
      },
      location: location || undefined,
    });

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Community member not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string; memberId: string } & Record<string, unknown>> }
) {
  try {
    const { projectId, memberId } = await params;
    const body = await request.json();

    // For DID projects, return mock success (these should be handled by ATproto in frontend)
    if (projectId.startsWith('did:plc:')) {
      console.log('[PUT /api/projects/[projectId]/members/[memberId]] Mock updating member for DID project:', projectId);
      return NextResponse.json({
        success: true,
        data: {
          id: memberId,
          ...body,
          project_id: projectId,
          updated_at: new Date().toISOString(),
        }
      });
    }

    // Only initialize BigQuery for non-DID projects
    await ensureDatasetLocation();
    const bigquery = getBigQueryClient();
    const location = await ensureDatasetLocation();

    const updateQuery = `
      UPDATE \`ecocertain.green_globe_v2_development.community_members\`
      SET
        first_name = @firstName,
        last_name = @lastName,
        title = @title,
        bio = @bio,
        profile_image_url = @profileImageUrl,
        display_order = @displayOrder,
        updated_at = CURRENT_TIMESTAMP()
      WHERE id = @memberId AND project_id = @projectId AND is_active = true
    `;

    const [updateResult] = await bigquery.query({
      query: updateQuery,
      params: {
        memberId,
        projectId: parseInt(projectId),
        firstName: body.first_name,
        lastName: body.last_name,
        title: body.title,
        bio: body.bio || null,
        profileImageUrl: body.profile_image_url || null,
        displayOrder: body.display_order || null,
      },
      location: location || undefined,
    });

    if (updateResult.length === 0 || updateResult[0].affected_rows === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Community member not found or no changes made",
        },
        { status: 404 }
      );
    }

    // Fetch the updated member
    const selectQuery = `
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
      WHERE id = @memberId AND project_id = @projectId AND is_active = true
      LIMIT 1
    `;

    const [rows] = await bigquery.query({
      query: selectQuery,
      params: {
        memberId,
        projectId: parseInt(projectId)
      },
      location: location || undefined,
    });

    return NextResponse.json({
      success: true,
      data: rows[0],
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string; memberId: string } & Record<string, unknown>> }
) {
  try {
    const { projectId, memberId } = await params;

    // For DID projects, return mock success (these should be handled by ATproto in frontend)
    if (projectId.startsWith('did:plc:')) {
      console.log('[DELETE /api/projects/[projectId]/members/[memberId]] Mock deleting member for DID project:', projectId);
      return NextResponse.json({
        success: true,
        message: "Member deleted successfully"
      });
    }

    // Only initialize BigQuery for non-DID projects
    await ensureDatasetLocation();
    const bigquery = getBigQueryClient();
    const location = await ensureDatasetLocation();

    // Soft delete by setting is_active to false
    const deleteQuery = `
      UPDATE \`ecocertain.green_globe_v2_development.community_members\`
      SET
        is_active = false,
        updated_at = CURRENT_TIMESTAMP()
      WHERE id = @memberId AND project_id = @projectId AND is_active = true
    `;

    const [deleteResult] = await bigquery.query({
      query: deleteQuery,
      params: {
        memberId,
        projectId: parseInt(projectId)
      },
      location: location || undefined,
    });

    if (deleteResult.length === 0 || deleteResult[0].affected_rows === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Community member not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Member deleted successfully"
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
