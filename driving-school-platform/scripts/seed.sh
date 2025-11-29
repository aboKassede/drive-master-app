#!/bin/bash

echo "Seeding database..."

cd backend

python -c "
import asyncio
from app.db.mongo import connect_to_mongo, close_mongo_connection
from app.db.seeds.seed_students import seed_students
from app.db.seeds.seed_instructors import seed_instructors
from app.db.seeds.seed_schools import seed_schools

async def main():
    await connect_to_mongo()
    await seed_students()
    await seed_instructors()
    await seed_schools()
    await close_mongo_connection()
    print('Database seeded successfully!')

asyncio.run(main())
"

echo "Seeding completed!"