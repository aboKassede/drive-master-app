from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
import json
from bson import ObjectId
from datetime import datetime

app = Flask(__name__)

# MongoDB connection with timeout
try:
    client = MongoClient(
        "mongodb://admin:password@54.157.242.59:27017/driving_school?authSource=admin",
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000
    )
    # Test connection
    client.admin.command('ping')
    db = client.driving_school
    print("✅ Connected to MongoDB successfully!")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    client = None
    db = None

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        return json.JSONEncoder.default(self, o)

@app.route('/')
def dashboard():
    if db is None:
        return render_template('error.html', error="Database connection failed")
    
    try:
        collections = db.list_collection_names()
        stats = {}
        for collection in collections:
            stats[collection] = db[collection].count_documents({})
        return render_template('dashboard.html', collections=collections, stats=stats)
    except Exception as e:
        return render_template('error.html', error=f"Database error: {str(e)}")

@app.route('/collection/<name>')
def view_collection(name):
    if db is None:
        return render_template('error.html', error="Database connection failed")
    
    try:
        page = int(request.args.get('page', 1))
        limit = 20
        skip = (page - 1) * limit
        
        data = list(db[name].find().skip(skip).limit(limit))
        total = db[name].count_documents({})
        
        # Get sample fields for add form
        sample_fields = []
        if data:
            sample_fields = list(data[0].keys())
        
        # Convert ObjectIds to strings for JSON serialization
        for item in data:
            if '_id' in item:
                item['_id'] = str(item['_id'])
            for key, value in item.items():
                if isinstance(value, ObjectId):
                    item[key] = str(value)
                elif isinstance(value, datetime):
                    item[key] = value.isoformat()
        
        return render_template('collection.html', 
                             collection_name=name, 
                             data=data, 
                             page=page, 
                             total=total,
                             has_next=skip + limit < total,
                             has_prev=page > 1,
                             sample_fields=sample_fields)
    except Exception as e:
        return render_template('error.html', error=f"Error loading collection: {str(e)}")

@app.route('/api/delete/<collection>/<doc_id>', methods=['DELETE'])
def delete_document(collection, doc_id):
    if db is None:
        return jsonify({"success": False, "error": "Database connection failed"})
    
    try:
        result = db[collection].delete_one({"_id": ObjectId(doc_id)})
        return jsonify({"success": True, "deleted": result.deleted_count})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/add-record/<collection>', methods=['POST'])
def add_record(collection):
    if db is None:
        return jsonify({"success": False, "error": "Database connection failed"})
    
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "error": "No data provided"})
        
        # Convert string dates to datetime if needed
        for key, value in data.items():
            if isinstance(value, str) and 'date' in key.lower():
                try:
                    data[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                except:
                    pass
        
        result = db[collection].insert_one(data)
        return jsonify({"success": True, "id": str(result.inserted_id)})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/update-record/<collection>/<doc_id>', methods=['PUT'])
def update_record(collection, doc_id):
    if db is None:
        return jsonify({"success": False, "error": "Database connection failed"})
    
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "error": "No data provided"})
        
        # Remove _id from update data
        data.pop('_id', None)
        
        # Convert string dates to datetime if needed
        for key, value in data.items():
            if isinstance(value, str) and 'date' in key.lower():
                try:
                    data[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                except:
                    pass
        
        result = db[collection].update_one({"_id": ObjectId(doc_id)}, {"$set": data})
        return jsonify({"success": True, "modified": result.modified_count})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/get-record/<collection>/<doc_id>', methods=['GET'])
def get_record(collection, doc_id):
    if db is None:
        return jsonify({"success": False, "error": "Database connection failed"})
    
    try:
        record = db[collection].find_one({"_id": ObjectId(doc_id)})
        if not record:
            return jsonify({"success": False, "error": "Record not found"})
        
        # Convert ObjectIds to strings
        if '_id' in record:
            record['_id'] = str(record['_id'])
        for key, value in record.items():
            if isinstance(value, ObjectId):
                record[key] = str(value)
            elif isinstance(value, datetime):
                record[key] = value.isoformat()
        
        return jsonify({"success": True, "record": record})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/create-collection', methods=['POST'])
def create_collection():
    if db is None:
        return jsonify({"success": False, "error": "Database connection failed"})
    
    try:
        data = request.json
        collection_name = data.get('name')
        sample_record = data.get('sample_record', {})
        
        if not collection_name:
            return jsonify({"success": False, "error": "Collection name required"})
        
        # Create collection by inserting a document
        if sample_record:
            db[collection_name].insert_one(sample_record)
        else:
            # Create empty collection
            db.create_collection(collection_name)
        
        return jsonify({"success": True, "message": f"Collection '{collection_name}' created"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/create-schools')
def create_schools_direct():
    if db is None:
        return "Database connection failed"
    
    try:
        # Show existing schools
        existing_schools = list(db.schools.find({}, {"name": 1, "status": 1}))
        result_html = f"<h2>Existing Schools ({len(existing_schools)}):</h2>"
        
        for school in existing_schools:
            result_html += f"<p>• {school.get('name', 'Unknown')} (Status: {school.get('status', 'unknown')})</p>"
        
        # Add more schools if less than 3
        if len(existing_schools) < 3:
            new_schools = [
                {
                    "name": "SafeDrive Institute", 
                    "address": "456 Oak Avenue, Los Angeles, CA 90210",
                    "phone": "+1-555-0202",
                    "email": "contact@safedrive.com",
                    "description": "Safety-focused driving education since 2010",
                    "status": "active",
                    "rating": 4.6,
                    "established": "2010",
                    "services": ["Beginner Lessons", "Advanced Driving", "Highway Training"]
                },
                {
                    "name": "City Driving School",
                    "address": "789 Pine Road, Chicago, IL 60601", 
                    "phone": "+1-555-0303",
                    "email": "admin@citydriving.com",
                    "description": "Urban driving specialists",
                    "status": "active",
                    "rating": 4.4,
                    "established": "2018",
                    "services": ["City Driving", "Parallel Parking", "Night Driving"]
                }
            ]
            
            insert_result = db.schools.insert_many(new_schools)
            result_html += f"<h3>✅ Added {len(insert_result.inserted_ids)} more schools!</h3>"
        
        result_html += '<br><a href="/">← Back to Dashboard</a>'
        return result_html
        
    except Exception as e:
        return f"❌ Error: {str(e)}"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)