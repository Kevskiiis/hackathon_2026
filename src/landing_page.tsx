import { act, useState } from 'react'
import { Card, Form, Input, Button, Typography, Segmented, Select } from 'antd'
import { Spin } from 'antd';
import axios from "axios";

// We are using title and text from Ant design to make it look good you know.
const { Title, Text } = Typography

// Delcarations:
interface FormValues {
  username: string;
  firstName?: string;
  lastName?: string;
  major?: string;
}

interface LandingPageProps {
  setLogin: (value: boolean) => void;
  setUser: (user: any) => void; // Replace 'any' with a more specific type if possible
}

// All the majors that are provided at WSU.
const WSU_MAJORS = [
  'Accounting',
  'Agricultural Education',
  'Animal Sciences',
  'Anthropology',
  'Architecture',
  'Art',
  'Biochemistry',
  'Biology',
  'Business Administration',
  'Chemical Engineering',
  'Chemistry',
  'Civil Engineering',
  'Communication',
  'Computer Engineering',
  'Computer Science',
  'Construction Management',
  'Criminal Justice and Criminology',
  'Data Analytics',
  'Economics',
  'Education',
  'Electrical Engineering',
  'Elementary Education',
  'English',
  'Environmental Science',
  'Finance',
  'Food Science',
  'History',
  'Hospitality Business Management',
  'Information Systems',
  'International Business',
  'Journalism and Media Production',
  'Kinesiology',
  'Management',
  'Marketing',
  'Mathematics',
  'Mechanical Engineering',
  'Microbiology',
  'Music',
  'Neuroscience',
  'Nursing',
  'Nutrition and Exercise Physiology',
  'Philosophy',
  'Physics',
  'Political Science',
  'Psychology',
  'Public Relations',
  'Sociology',
  'Software Engineering',
  'Sport Management',
  'Statistics',
]

export default function LandingPage({setLogin, setUser}: LandingPageProps) {
  // This keeps track of wther the user is signing up or logging in
  const [mode, setMode] = useState('Sign Up') // "Sign Up" or "Log In"
  const [isLoading, setIsLoading] = useState(false);  

  //This function runs:
  const onFinish = async (values: FormValues) => {
    console.log(values);
    setIsLoading(true);

    try {
      if (mode === "Log In") {
        const response = await axios.get(
          "http://127.0.0.1:5000/fetch-student",
          {
            params: { username: values.username }
          }
        );

        const data = response.data; // axios stores backend response here

        if (data.result) {
          setLogin(true);
          setUser(data.user); // adjust based on backend return
          alert("Looking up your plan...");
        } else {
          alert(data.message || "User not found.");
        }

      } else {
        const response = await axios.post(
          "http://127.0.0.1:5000/create-student",
          {
            username: values.username,
            first_name: values.firstName,
            last_name: values.lastName,
            major: values.major
          }
        );

        const data = response.data;

        if (data.result) {
          setLogin(true);
          setUser(values);
          alert("Generating your academic plan...");
        } else {
          alert(data.message || "Something went wrong.");
        }
      }

    } catch (error) {
      console.error(error);
      alert("Server error. Make sure Flask is running.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div
      style={{
        // Make the page take up the entire browser window
        width: '100vw',
        height: '100vh',

        // WSU colors
        background: 'linear-gradient(135deg, #981E32 0%, #5C1A24 100%)',

        // Center the the card/thing in the middle
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <Card
        style={{
          // Keep the form responsive but limit max width
          width: '100%',
          maxWidth: 520,

          // This just rounds the ednges and shadow to make it look good
          borderRadius: 16,
          boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
        }}
      >
        {/*Main page*/}
        <Title level={2} style={{ textAlign: 'center', color: '#981E32', marginBottom: 0 }}>
          New Coug
        </Title>

        {/* Small explanation under the title */}
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 16 }}>
          {mode === 'Sign Up'
            ? 'Sign up to generate your academic plan.'
            : 'Enter your username to pull up your plan.'}
        </Text>

        {/* This is just something fancy I added. It's a Toggle so users can switch between Sign Up and Log In */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <Segmented options={['Sign Up', 'Log In']} value={mode} onChange={setMode} />
        </div>

        {/* Form automatically handles validation and submission */}
        <Form layout="vertical" onFinish={onFinish}>
          {/* 1) Username */}
          <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Enter your username' }]}>
            <Input size="large" />
          </Form.Item>
          {/* Sign Up ONLY fields */}
          {mode === 'Sign Up' && (
            <>
              {/* First Name */}
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ required: true, message: 'Enter your first name' }]}
              >
                <Input size="large" />
              </Form.Item>

              {/* Last Name */}
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[{ required: true, message: 'Enter your last name' }]}
              >
                <Input size="large" />
              </Form.Item>

              {/* Major */}
              <Form.Item
                label="Major"
                name="major"
                rules={[{ required: true, message: 'Select your major' }]}
              >
                <Select
                  size="large"
                  showSearch
                  allowClear
                  placeholder="Type your major"
                  options={WSU_MAJORS.map((m) => ({ label: m, value: m }))}
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </>
          )}

          {/* Button text changes depending on mode */}
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              htmlType="submit"
              block
              size="large"
              style={{
                backgroundColor: '#981E32',
                borderColor: '#981E32',
                fontWeight: 600,
              }}
            >
              {mode === 'Sign Up' ? 'Create Account' : 'Find My Plan'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
