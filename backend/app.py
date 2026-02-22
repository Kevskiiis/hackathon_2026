
from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase_client import supabase_client

from gemini_client import client # for gemini client 
from gemini_client import types # allows us to use specfic gemini models


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
    data = request.get_json() # get data

    # parse data
    event_type = data.get("event_type")
    event_name = data.get("event_name")
    event_description = data.get("event_description")
    event_date = data.get("event_date")
    event_time = data.get("event_time")

    #send information to the db and then the db updates
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
    # get data from frontend
    data = request.get_json()

    #parse data
    course_name = data.get("course_name")
    course_description = data.get("course_description")
    course_prerequisites = data.get("course_prerequisites")

    # send to and update db
    response = supabase_client.rpc ("add_course_catalog", {
        "p_course_name" : course_name,
        "p_course_description" : course_description,
        "p_course_prerequisites" : course_prerequisites
    }).execute()
    
    #response from db
    return jsonify({"data": response.data}), 200

# add a course to the users course history
@app.route("/add-course-history", methods=["POST"])
def add_course_history(): 
    # get data from front 
    data = request.get_json()

    # parse data
    user_id = data.get("user_id")
    course_id = data.get("course_id")
    course_status = data.get("course_status")

    # send info to db
    response = supabase_client.rpc ("add_course_history", {
        "p_user_id" : user_id,
        "p_course_id" : course_id,
        "p_course_status" : course_status
    }).execute()

    return jsonify({"data": response.data}), 200

# get an already exsisting student
@app.route("/fetch-student", methods=["GET"])
def fetch_student(): 
    
    # get the username argument
    username = request.args.get("username")
    print(f"Username: '{username}'")
    print(f"Length: {len(username) if username else 0}")
    #print("Username received:", username)

    # sends the username to db
    response = supabase_client.rpc("fetch_student",{
        "p_username" : username
    }).execute()

    # print("Supabase response:", response.data)  # check what supabase returns

    if response.data:  # if a student was found
        return jsonify({"result": True, "user": response.data[0]}), 200
    else:
        return jsonify({"result": False, "message": "User not found"}), 404

# get an already exsisting event
@app.route("/fetch-events", methods=["GET"])
def fetch_events(): 

    #get the major arg
    major = request.args.get("major")

    # send to db and get response
    response = supabase_client.rpc ("fetch_events", {
        "p_major" : major
    }).execute()

    # return the response
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

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_message = data.get("message")
        user_major = data.get("major")
        user_first_name = data.get("first_name")

        # prompt we are using to power our ai chatbot feature
        system_instruction = f"""
            You are a helpful academic assistant for Washington State Univesity students.
            The student named {user_first_name} you are trying to help is studying {user_major}.
            When asked about events, clubs, or resources, search the web and provide:
            - A helpful and informative answer
            - Specific links to websites, Discord servers, Reddit communities, Instagram pages, etc
            - Where the student can find more information or resources
            - When applicable, shape the response to fit to the student's major 

            Some specifc resources to initally search through are provided below. Do not use these as the
            sole resources. Make sure to search in other places as well
            - https://vcea.wsu.edu/upcoming-events/
            - https://events.wsu.edu/
            """
        # prompts the ai model for the reponse 
        response = client.models.generate_content(
            model = "gemini-2.5-flash",
            contents = user_message ,
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                tools=[types.Tool(google_search=types.GoogleSearch())]
            )
            )

        return jsonify({"response": response.text}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# run the backend
if __name__ == "__main__":
    app.run(debug=True)

