from django.db import migrations


def add_postgres_exclusion_constraint(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    schema_editor.execute("CREATE EXTENSION IF NOT EXISTS btree_gist;")
    schema_editor.execute(
        """
        ALTER TABLE bookings_booking
        ADD CONSTRAINT bookings_booking_no_overlap
        EXCLUDE USING gist (
            resource_id WITH =,
            tstzrange(start_datetime, end_datetime, '[)') WITH &&
        )
        WHERE (blocks_availability);
        """
    )


def remove_postgres_exclusion_constraint(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    schema_editor.execute("ALTER TABLE bookings_booking DROP CONSTRAINT IF EXISTS bookings_booking_no_overlap;")


class Migration(migrations.Migration):
    dependencies = [("bookings", "0001_initial")]

    operations = [migrations.RunPython(add_postgres_exclusion_constraint, remove_postgres_exclusion_constraint)]
