"""
Migration script to add user_id field to existing links.

This script should be run once after implementing authentication.
It assigns all existing links to a default user (the first user in the database).

Usage:
    python migrate_add_user_id.py

Options:
    --user-email <email>  Assign links to specific user by email
    --dry-run             Show what would be changed without modifying data
"""

import asyncio
import argparse
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from app.core.config import get_settings

settings = get_settings()


async def migrate(user_email: str = None, dry_run: bool = False):
    """
    Add user_id to links that don't have it.

    Args:
        user_email: Email of user to assign links to (optional)
        dry_run: If True, show changes without applying them
    """
    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client.get_database()

    try:
        # Find links without user_id
        links_without_user = await db.links.count_documents(
            {"user_id": {"$exists": False}}
        )

        print(f"Found {links_without_user} links without user_id")

        if links_without_user == 0:
            print("No migration needed. All links have user_id.")
            return

        # Find the user to assign links to
        if user_email:
            user = await db.users.find_one({"email": user_email})
            if not user:
                print(f"Error: User with email '{user_email}' not found.")
                print("Available users:")
                async for u in db.users.find({}, {"email": 1, "name": 1}):
                    print(f"  - {u['email']} ({u['name']})")
                return
        else:
            # Get the first user
            user = await db.users.find_one({})
            if not user:
                print("Error: No users found in database.")
                print("Please create a user first by logging in via Google OAuth.")
                return

        user_id = user["_id"]
        print(f"\nWill assign links to:")
        print(f"  User: {user['name']} ({user['email']})")
        print(f"  User ID: {user_id}")

        if dry_run:
            print("\n--- DRY RUN MODE ---")
            print("The following links would be updated:")
            async for link in db.links.find({"user_id": {"$exists": False}}):
                print(f"  - {link['url'][:60]}... (ID: {link['_id']})")
            print(f"\nTotal: {links_without_user} links")
            print("\nRun without --dry-run to apply changes.")
        else:
            # Update links
            result = await db.links.update_many(
                {"user_id": {"$exists": False}}, {"$set": {"user_id": user_id}}
            )

            print(f"\n✓ Migration complete!")
            print(f"  Updated {result.modified_count} links")

    except Exception as e:
        print(f"Error during migration: {e}")
    finally:
        client.close()


def main():
    parser = argparse.ArgumentParser(
        description="Add user_id to existing links in the database"
    )
    parser.add_argument(
        "--user-email",
        type=str,
        help="Email of user to assign links to (defaults to first user)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be changed without modifying data",
    )

    args = parser.parse_args()

    asyncio.run(migrate(user_email=args.user_email, dry_run=args.dry_run))


if __name__ == "__main__":
    main()
