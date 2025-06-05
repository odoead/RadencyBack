using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace RadencyBack.Migrations
{
    /// <inheritdoc />
    public partial class init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Amenities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Icon = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Amenities", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Coworkings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Coworkings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserBookingInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserBookingInfos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Photos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Url = table.Column<string>(type: "text", nullable: false),
                    CoworkingId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Photos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Photos_Coworkings_CoworkingId",
                        column: x => x.CoworkingId,
                        principalTable: "Coworkings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkspaceAmenities",
                columns: table => new
                {
                    CoworkingId = table.Column<int>(type: "integer", nullable: false),
                    AmenityId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkspaceAmenities", x => new { x.CoworkingId, x.AmenityId });
                    table.ForeignKey(
                        name: "FK_WorkspaceAmenities_Amenities_AmenityId",
                        column: x => x.AmenityId,
                        principalTable: "Amenities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkspaceAmenities_Coworkings_CoworkingId",
                        column: x => x.CoworkingId,
                        principalTable: "Coworkings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WorkspaceUnits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CoworkingId = table.Column<int>(type: "integer", nullable: false),
                    WorkspaceType = table.Column<string>(type: "character varying(13)", maxLength: 13, nullable: false),
                    MeetingWorkspaceUnit_MaxCapacity = table.Column<int>(type: "integer", nullable: true),
                    OpenWorkspaceUnit_MaxCapacity = table.Column<int>(type: "integer", nullable: true),
                    MaxCapacity = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkspaceUnits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkspaceUnits_Coworkings_CoworkingId",
                        column: x => x.CoworkingId,
                        principalTable: "Coworkings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    WorkspaceUnitId = table.Column<int>(type: "integer", nullable: false),
                    StartTimeUTC = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndTimeUTC = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TimeZoneId = table.Column<string>(type: "text", nullable: false),
                    UserInfoId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bookings_UserBookingInfos_UserInfoId",
                        column: x => x.UserInfoId,
                        principalTable: "UserBookingInfos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Bookings_WorkspaceUnits_WorkspaceUnitId",
                        column: x => x.WorkspaceUnitId,
                        principalTable: "WorkspaceUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_UserInfoId",
                table: "Bookings",
                column: "UserInfoId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_WorkspaceUnitId",
                table: "Bookings",
                column: "WorkspaceUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_Photos_CoworkingId",
                table: "Photos",
                column: "CoworkingId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkspaceAmenities_AmenityId",
                table: "WorkspaceAmenities",
                column: "AmenityId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkspaceUnits_CoworkingId",
                table: "WorkspaceUnits",
                column: "CoworkingId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropTable(
                name: "Photos");

            migrationBuilder.DropTable(
                name: "WorkspaceAmenities");

            migrationBuilder.DropTable(
                name: "UserBookingInfos");

            migrationBuilder.DropTable(
                name: "WorkspaceUnits");

            migrationBuilder.DropTable(
                name: "Amenities");

            migrationBuilder.DropTable(
                name: "Coworkings");
        }
    }
}
