
from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase_client import supabase_client


app = Flask(__name__) #creates the flask app
CORS(app) # should let react call the flask api

#main page
@app.route("/")
def index():
    return {"message" : "Backend test"}

#create a new student function
@app.route("/create-student", methods=["POST"]) # this the route for the page
def create_student(): 
    data = request.get_json() # this is the user information sent from the frontend. Gets stored as a JSON object

    #parse the data and put it into variables
    username = data.get("username")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    major = data.get("major")

    # send the information to the supabase db
    response = supabase_client.rpc ("create_student", {
        "p_username" : username,
        "p_first_name" : first_name,
        "p_last_name" : last_name,
        "p_major" : major
    }).execute()

    return jsonify({"data": response.data}), 200

#create an event 
@app.route("/create-event", methods=["POST"])
def create_event(): 
    data = request.get_json()

    event_type = data.get("event_type")
    event_name = data.get("event_name")
    event_description = data.get("event_description")
    event_date = data.get("event_date")
    event_time = data.get("event_time")

    
    response = supabase_client.rpc ("create_event", {
        "p_event_type" : event_type,
        "p_event_name" : event_name,
        "p_event_description" : event_description,
        "p_event_date" : event_date,
        "p_event_time" : event_time
    }).execute()

    return jsonify({"data": response.data}), 200

#add a course
@app.route("/add-course-catalog", methods=["POST"])
def add_course_catalog(): 
    data = request.get_json()

    course_name = data.get("course_name")
    course_description = data.get("course_description")
    course_prerequisites = data.get("course_prerequisites")

    response = supabase_client.rpc ("add_course_catalog", {
        "p_course_name" : course_name,
        "p_course_description" : course_description,
        "p_course_prerequisites" : course_prerequisites
    }).execute()

    return jsonify({"data": response.data}), 200

@app.route("/add-course-history", methods=["POST"])
def add_course_history(): 
    data = request.get_json()

    user_id = data.get("user_id")
    course_id = data.get("course_id")
    course_status = data.get("course_status")

    response = supabase_client.rpc ("add_course_history", {
        "p_user_id" : user_id,
        "p_course_id" : course_id,
        "p_course_status" : course_status
    }).execute()

    return jsonify({"data": response.data}), 200

# get an already exsisting student
@app.route("/fetch-student", methods=["GET"])
def fetch_student(): 
    
    username = request.args.get("username")
    print(f"Username: '{username}'")
    print(f"Length: {len(username) if username else 0}")
    #print("Username received:", username)

    response = supabase_client.rpc("fetch_student",{
        "p_username" : username
    }).execute()

    print("Supabase response:", response.data)  # check what supabase returns

    if response.data:  # if a student was found
        return jsonify({"result": True, "user": response.data[0]}), 200
    else:
        return jsonify({"result": False, "message": "User not found"}), 404

# get an already exsisting event
@app.route("/fetch-events", methods=["GET"])
def fetch_events(): 

    major = request.args.get("major")

    response = supabase_client.rpc ("fetch_events", {
        "p_major" : major
    }).execute()

    return jsonify({"data" : response.data}), 200

# gets the course history
@app.route("/fetch-course-history", methods=["GET"])
def fetch_course_history(): 

    user_id = request.args.get("user_id")

    response = supabase_client.rpc ("fetch_course_history", {
        "p_user_id" : user_id
    }).execute()

    return jsonify({"data" : response.data}), 200

# get the course catalog 
@app.route("/fetch-course-catalog", methods=["GET"])
def fetch_course_catalog():

    response = supabase_client.rpc ("fetch_course_catalog").execute()

    return jsonify({"data" : response.data}), 200


if __name__ == "__main__":
    app.run(debug=True)

