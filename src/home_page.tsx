import { Tabs, Typography, Button, Card, Input } from 'antd'
import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import axios from 'axios'

const { Title, Text } = Typography

interface Event {
  event_date: string,
  event_description: string,
  event_name: string,
  event_time: string,
  event_type: string
}

// This is the main dashboard after a student logs in
// It receives the student info from user and a logout function
export default function HomePage({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [geminiPrompt, setGeminiPrompt] = useState('')
  const [geminiResponse, setGeminiResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [events, setEvents] = useState([])
  const [courses, setCourses] = useState([]) 

  const LoadEvents = async () => {
    const result = await axios.get(
          "http://127.0.0.1:5000/fetch-events",
          {
            params: {major: user.major}
          }
        );
    const eventsArray= result.data.data;
    // console.log(eventsArray); 

    if (eventsArray[0]) {
      setEvents(eventsArray); 
    }
  }

  const LoadCourses = async () => {
    const result = await axios.get(
          "http://127.0.0.1:5000/fetch-course-history",
          {
            params: {user_id: user.id}
          }
        );

    const courses = result.data.data;
    console.log(result); 

    // if (eventsArray[0]) {
    //   setEvents(eventsArray); 
    // }
  }

  useEffect(() => {
    LoadEvents();
    LoadCourses(); 
  }, []);


  // This function sends the message to Flask and gets Gemini's response
  const askGemini = async () => {
    if (!geminiPrompt.trim()) return  // don't send empty messages
    setIsLoading(true)

    try {
      const response = await axios.post("http://127.0.0.1:5000/chat", {
        message: geminiPrompt,
        major: user.major,
        first_name: user.firsName
      })
      setGeminiResponse(response.data.response)
    } catch (error) {
      setGeminiResponse("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div
      style={{

        // Make the home page full screen just like the landing page
        width: '100vw',
        height: '100vh',

        // Keep the same WSU colors
        background: 'linear-gradient(135deg, #981E32 0%, #5C1A24 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        boxSizing: 'border-box',
      }}
    >   
       {/* This card holds all the tab content */}  
      <Card
        style={{
          width: '100%',
          maxWidth: '99.5%',
          height: '100%',
          maxHeight: '99.5%',
          borderRadius: 16,
          boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
        }}
      >
        {/* Tabs help organize the dashboard into sections */}
        <Tabs
          defaultActiveKey="home"
          items={[
            {
              key: 'home',
              label: 'Home',
              children: (
                <>
                 {/* Welcome message personalized using student info */}
                  <Title level={3}>
                    Welcome {user.firstName || user.username} 
                  </Title>

                  {/* Show their major so it feels customized */}
                  <Text type="secondary">
                    Major: {user.major || 'Pulled from database'}
                  </Text>
                </>
              ),
            },
            {
              key: 'roadmap',
              label: 'Roadmap',
              children: (
                <>
                {/* This tab will show required graduation classes */}
                  <Title level={4}>Roadmap</Title>
                  <Text type="secondary">
                    Required classes for graduation will appear here.
                  </Text>
                </>
              ),
            },
            {
              key: 'events',
              label: 'Events',
              children: (
                <>
                {/* This tab will show events related to the student’s major */}
                  <Title level={4}>Events</Title>
                  <div style={{ maxHeight: 450, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {
                    events.length > 0 ? (
                      events.map((event: Event, idx) => (
                        <Card key={idx}>
                          <Title level={5}>{event.event_name}</Title>
                          <Text>{event.event_description}</Text><br />
                          <Text type="secondary">{new Date(event.event_date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</Text>
                        </Card>
                      ))
                    ) : (
                      <Text type="secondary">Major-related events will appear here.</Text>
                    )
                  }
                  </div>
                </>
              ),
            },
            {
              key: 'profile',
              label: 'Profile',
              children: (
                <>
                {/* This tab displays the student's stored information */}
                  <Title level={4}>Profile</Title>
                  <Text><b>Username:</b> {user.username}</Text><br />
                  <Text><b>Name:</b> {user.firstName || '-'} {user.lastName || ''}</Text><br />
                  <Text><b>Major:</b> {user.major || '-'}</Text>
                </>
              ),
            },
            {
              key: 'assistant',
              label: 'Gemini Assistant',
              children: (
                <div style={{ display: 'flex', flexDirection: 'row', gap: 24, alignItems: 'flex-start' }}>

                  {/* LEFT COLUMN - title, buttons, input, ask button */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Title level={4}>Gemini Assistant</Title>
                    <Text type="secondary">
                      Ask about events, clubs, resources, or anything WSU related.
                    </Text>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Button onClick={() => setGeminiPrompt('I want to get more involved in student clubs.')}>
                        Student clubs
                      </Button>
                      <Button onClick={() => setGeminiPrompt('I want to get more involved with upcoming events.')}>
                        Upcoming events
                      </Button>
                      <Button onClick={() => setGeminiPrompt('I want to connect with professors at WSU within my major.')}>
                        Connect with professors
                      </Button>
                      <Button onClick={() => setGeminiPrompt('I want to get involved with more student programs.')}>
                        Student programs
                      </Button>
                    </div>

                    <Input.TextArea
                      placeholder="Ask Gemini..."
                      value={geminiPrompt}
                      onChange={(e) => setGeminiPrompt(e.target.value)}
                      rows={3}
                    />

                    <Button
                      type="primary"
                      loading={isLoading}
                      onClick={askGemini}
                      style={{ backgroundColor: '#981E32', borderColor: '#981E32', fontWeight: 600 }}
                    >
                      Ask
                    </Button>
                  </div>

                  {/* RIGHT COLUMN - response box */}
                  <div style={{ flex: 1 }}>
                    {geminiResponse && (
                      <Card style={{ maxHeight: 550, overflowY: 'auto' }}>
                        <ReactMarkdown>{geminiResponse}</ReactMarkdown>
                      </Card>
                    )}
                  </div>

                </div>
              ),
            },
          ]}
        />

        {/* Gemini Assistant */}
        <div

         // Keeps the assistant fixed to the bottom right of the screen
        style={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          width: 300,

          // Ensures it appears above other elements
          zIndex:1000, 
        }}
      >
    
      </div>
      
        {/* Logout button resets user state and sends them back to landing page */}
        <Button
          style={{ marginTop: 20 }}
          onClick={onLogout}
        >
          Log Out
        </Button>
      </Card>
    </div>
  )
}
