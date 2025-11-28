db = db.getSiblingDB('driving_school');

db.createCollection('students');
db.createCollection('instructors');
db.createCollection('lessons');
db.createCollection('schedules');

// Create indexes
db.students.createIndex({ "email": 1 }, { unique: true });
db.instructors.createIndex({ "email": 1 }, { unique: true });
db.lessons.createIndex({ "student_id": 1 });
db.lessons.createIndex({ "instructor_id": 1 });
db.lessons.createIndex({ "scheduled_date": 1 });

print('Database initialized successfully');