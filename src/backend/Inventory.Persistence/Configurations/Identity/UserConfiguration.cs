using Inventory.Domain.Modules.Identity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Inventory.Persistence.Configurations.Identity;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    // Dev-only seed admin so login is possible before a user-management UI
    // exists (Phase 0's definition of done only requires "basic auth").
    // Email: admin@inventory.local / Password: Admin123! — change or remove
    // before this ever points at anything but a local dev database.
    public static readonly Guid SeedAdminId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("User", "identity");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Id)
            .ValueGeneratedNever();

        builder.Property(u => u.Email)
            .HasMaxLength(256)
            .IsRequired();

        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.Property(u => u.PasswordHash)
            .HasMaxLength(512)
            .IsRequired();

        builder.Property(u => u.Role)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(u => u.CreatedAt)
            .IsRequired();

        builder.Property(u => u.CreatedBy)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(u => u.UpdatedAt);

        builder.Property(u => u.UpdatedBy)
            .HasMaxLength(256);

        builder.HasData(new
        {
            Id = SeedAdminId,
            Email = "admin@inventory.local",
            PasswordHash = "100000.wI5U7XrVkcldbQd8Tdh8mw==.N3GoT912Q672ypFlKm4JTtayr+hJYa9TOl1jDJn1sao=",
            Role = UserRole.Admin,
            CreatedAt = new DateTime(2026, 8, 18, 0, 0, 0, DateTimeKind.Utc),
            CreatedBy = "system-seed",
        });
    }
}
