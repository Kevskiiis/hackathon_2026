import { Tabs, Typography, Button, Card, Input, Row, Col, Image} from 'antd'
import { useState, useEffect } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'

const { Title, Text } = Typography

interface Event {
  event_date: string;
  event_description: string;
  event_name: string;
  event_time: string;
  event_type: string;
}

interface Course {
  course_description: string;
  course_id: number;
  course_name: string;
  course_prerequisites: string;
  course_status: 'Enrolled' | 'Passed' | 'Failed' | 'Withdrawed';
}

 

// This is the main dashboard after a student logs in
// It receives the student info from user and a logout function
export default function HomePage({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [geminiPrompt, setGeminiPrompt] = useState('')
  const [geminiResponse, setGeminiResponse] = useState('')
  const [geminiCourses, setGeminiCourses] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [events, setEvents] = useState([])
  const [courses, setCourses] = useState<Course[]>([])
  const [catalog, setCatalog] = useState([])

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

    const courses = result.data.data
    console.log(courses[0])

    if (courses[0]) {
      setCourses(courses) 
    }
  }

  const askGemini = async () => {
    if (!geminiPrompt.trim()) return;
    setIsLoading(true);
    try {

      const response = await axios.post("http://127.0.0.1:5000/chat", {
        message: geminiPrompt
      });
      setGeminiResponse(response.data.response);
    } catch (error) {
      setGeminiResponse("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const askAboutCourses = async () => {
    setIsLoading(true);
    try {

      const response = await axios.post("http://127.0.0.1:5000/recommend-courses", {
        course_history: courses,
        course_catalog: catalog
      });
      setGeminiCourses(response.data.response || "No recommendations found.");
      console.log(response.data.response);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }

  const LoadCourseCatalog = async () => {
    const result = await axios.get("http://127.0.0.1:5000/fetch-course-catalog")

    const catalog = result.data.data
    console.log(catalog); 

    if (catalog[0]) {
      setCatalog(catalog)
    }
  }

  useEffect(() => {
    LoadEvents();
    LoadCourseCatalog();
    LoadCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0 && catalog.length > 0) {
      askAboutCourses();
    }
  }, [courses, catalog]);


  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',          // allow content to grow
        background: 'linear-gradient(135deg, #981E32 0%, #5C1A24 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',    // don't vertically center long content
        padding: 120,
        boxSizing: 'border-box',
        overflowY: 'auto',           // allow scroll
      }}
    > 
       {/* This card holds all the tab content */}  
      <Card
        style={{
          alignItems: 'flex-start',
          // marginTop: "2%",
          width: '100%',
          maxWidth: '99.5%',
          height: '90%',
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
                  <Title level={4}>Roadmap</Title>
                  {/* AI Advisor Section */}
                  <Title level={5} style={{ marginTop: 8, color: '#981E32' }}>Your AI Advisor</Title>
                  {geminiCourses ? (
                    <Card style={{ marginBottom: 16 }}>
                      <ReactMarkdown>{typeof geminiCourses === 'string' ? geminiCourses : JSON.stringify(geminiCourses)}</ReactMarkdown>
                    </Card>
                  ) : (
                    <Text type="secondary">AI course recommendations will appear here.</Text>
                  )}
                  {/* Enrolled courses */}
                  <Title level={5}>Currently Enrolled</Title>
                  {courses.filter(c => c.course_status === 'Enrolled').length === 0 ? (
                    <Text type="secondary">No currently enrolled courses.</Text>
                  ) : (
                    courses.filter(c => c.course_status === 'Enrolled').map((course, idx) => (
                      <Card key={idx} style={{ marginBottom: 8 }}>
                        <b>{course.course_name}</b><br />
                        <Text type="secondary">Prerequisites: {course.course_prerequisites ? course.course_prerequisites.split(';').join(', ') : 'None'}</Text>
                      </Card>
                    ))
                  )}
                  {/* Passed courses */}
                  <Title level={5} style={{ marginTop: 16 }}>Passed</Title>
                  {courses.filter(c => c.course_status === 'Passed').length === 0 ? (
                    <Text type="secondary">No passed courses.</Text>
                  ) : (
                    courses.filter(c => c.course_status === 'Passed').map((course, idx) => (
                      <Card key={idx} style={{ marginBottom: 8 }}>
                        <b>{course.course_name}</b><br />
                        <Text type="secondary">Prerequisites: {course.course_prerequisites ? course.course_prerequisites.split(';').join(', ') : 'None'}</Text>
                      </Card>
                    ))
                  )}
                  {/* Failed courses */}
                  <Title level={5} style={{ marginTop: 16 }}>Failed</Title>
                  {courses.filter(c => c.course_status === 'Failed').length === 0 ? (
                    <Text type="secondary">No failed courses.</Text>
                  ) : (
                    courses.filter(c => c.course_status === 'Failed').map((course, idx) => (
                      <Card key={idx} style={{ marginBottom: 8 }}>
                        <b>{course.course_name}</b><br />
                        <Text type="secondary">Prerequisites: {course.course_prerequisites ? course.course_prerequisites.split(';').join(', ') : 'None'}</Text>
                      </Card>
                    ))
                  )}
                  {/* Withdrawed courses */}
                  <Title level={5} style={{ marginTop: 16 }}>Withdrawed</Title>
                  {courses.filter(c => c.course_status === 'Withdrawed').length === 0 ? (
                    <Text type="secondary">No withdrawed courses.</Text>
                  ) : (
                    courses.filter(c => c.course_status === 'Withdrawed').map((course, idx) => (
                      <Card key={idx} style={{ marginBottom: 8 }}>
                        <b>{course.course_name}</b><br />
                        <Text type="secondary">Prerequisites: {course.course_prerequisites ? course.course_prerequisites.split(';').join(', ') : 'None'}</Text>
                      </Card>
                    ))
                  )}
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
                  
                  {
                    events.length > 0 ? (
                      events.map((event: Event, idx) => (
                        <Card key={idx}>
                          <Title level={5}>{event.event_name}</Title>
                          <Text>{event.event_description}</Text>
                          <Text type="secondary">{event.event_date} {event.event_time}</Text>
                        </Card>
                      ))
                    ) : (
                      <Text type="secondary">Major-related events will appear here.</Text>
                    )
                  }
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
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Title level={4}>Gemini Assistant</Title>
                    <Text type="secondary">
                      Ask about events, clubs, resources, or anything WSU related.
                    </Text>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Button onClick={() => setGeminiPrompt('I want to get more involved in student clubs.')}>Student clubs</Button>
                      <Button onClick={() => setGeminiPrompt('I want to get more involved with upcoming events.')}>Upcoming events</Button>
                      <Button onClick={() => setGeminiPrompt('I want to connect with professors at WSU within my major.')}>Connect with professors</Button>
                      <Button onClick={() => setGeminiPrompt('I want to get involved with more student programs.')}>Student programs</Button>
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
