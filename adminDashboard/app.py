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
                             has_prev=page > 1)
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)