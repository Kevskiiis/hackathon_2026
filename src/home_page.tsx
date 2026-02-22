import { Tabs, Typography, Button, Card } from 'antd'

const { Title, Text } = Typography

export default function HomePage({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #981E32 0%, #5C1A24 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        boxSizing: 'border-box',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 900,
          borderRadius: 16,
          boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
        }}
      >
        <Tabs
          defaultActiveKey="home"
          items={[
            {
              key: 'home',
              label: 'Home',
              children: (
                <>
                  <Title level={3}>
                    Welcome {user.firstName || user.username} 
                  </Title>
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
                  <Title level={4}>Events</Title>
                  <Text type="secondary">
                    Major-related events will appear here.
                  </Text>
                </>
              ),
            },
            {
              key: 'profile',
              label: 'Profile',
              children: (
                <>
                  <Title level={4}>Profile</Title>
                  <Text><b>Username:</b> {user.username}</Text><br />
                  <Text><b>Name:</b> {user.firstName || '-'} {user.lastName || ''}</Text><br />
                  <Text><b>Major:</b> {user.major || '-'}</Text>
                </>
              ),
            },
          ]}
        />

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