from flask import Flask, render_template, request, jsonify
import json
from datetime import datetime

app = Flask(__name__)

# Mock data for demonstration
mock_data = {
    "students": [
        {"_id": "507f1f77bcf86cd799439011", "name": "John Doe", "email": "john@example.com", "phone": "+1234567890", "status": "active"},
        {"_id": "507f1f77bcf86cd799439012", "name": "Jane Smith", "email": "jane@example.com", "phone": "+1234567891", "status": "active"},
        {"_id": "507f1f77bcf86cd799439013", "name": "Mike Johnson", "email": "mike@example.com", "phone": "+1234567892", "status": "pending"}
    ],
    "instructors": [
        {"_id": "507f1f77bcf86cd799439021", "name": "Sarah Wilson", "email": "sarah@example.com", "license": "INS001", "rating": 4.8},
        {"_id": "507f1f77bcf86cd799439022", "name": "David Brown", "email": "david@example.com", "license": "INS002", "rating": 4.6}
    ],
    "schools": [
        {"_id": "507f1f77bcf86cd799439031", "name": "DriveRight School", "address": "123 Main St", "phone": "+1234567800", "status": "active"},
        {"_id": "507f1f77bcf86cd799439032", "name": "SafeDrive Academy", "address": "456 Oak Ave", "phone": "+1234567801", "status": "active"}
    ],
    "lessons": [
        {"_id": "507f1f77bcf86cd799439041", "student_id": "507f1f77bcf86cd799439011", "instructor_id": "507f1f77bcf86cd799439021", "date": "2024-01-15", "status": "completed"},
        {"_id": "507f1f77bcf86cd799439042", "student_id": "507f1f77bcf86cd799439012", "instructor_id": "507f1f77bcf86cd799439022", "date": "2024-01-16", "status": "scheduled"}
    ],
    "bookings": [
        {"_id": "507f1f77bcf86cd799439051", "student_id": "507f1f77bcf86cd799439011", "lesson_id": "507f1f77bcf86cd799439041", "booking_date": "2024-01-10", "status": "confirmed"},
        {"_id": "507f1f77bcf86cd799439052", "student_id": "507f1f77bcf86cd799439012", "lesson_id": "507f1f77bcf86cd799439042", "booking_date": "2024-01-11", "status": "pending"}
    ]
}

@app.route('/')
def dashboard():
    collections = list(mock_data.keys())
    stats = {collection: len(data) for collection, data in mock_data.items()}
    return render_template('dashboard.html', collections=collections, stats=stats)

@app.route('/collection/<name>')
def view_collection(name):
    if name not in mock_data:
        return "Collection not found", 404
    
    page = int(request.args.get('page', 1))
    limit = 20
    skip = (page - 1) * limit
    
    data = mock_data[name][skip:skip + limit]
    total = len(mock_data[name])
    
    return render_template('collection.html', 
                         collection_name=name, 
                         data=data, 
                         page=page, 
                         total=total,
                         has_next=skip + limit < total,
                         has_prev=page > 1)

@app.route('/api/delete/<collection>/<doc_id>', methods=['DELETE'])
def delete_document(collection, doc_id):
    try:
        if collection in mock_data:
            mock_data[collection] = [item for item in mock_data[collection] if item["_id"] != doc_id]
            return jsonify({"success": True, "deleted": 1})
        return jsonify({"success": False, "error": "Collection not found"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)