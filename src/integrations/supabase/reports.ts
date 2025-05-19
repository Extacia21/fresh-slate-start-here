// This file provides type definitions for the reports table that doesn't exist in the auto-generated types

export interface Report {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  status: string;
  severity: "critical" | "high" | "medium" | "low";
  is_public: boolean;
  type?: string;
  source?: string;
  updates?: { time: string; content: string }[];
}

// Array of mock emergency titles and descriptions for random generation
const mockEmergencies = [
  {
    type: 'fire',
    titles: ['Structure Fire Reported', 'Vehicle Fire on Highway', 'Forest Fire Alert', 'Electrical Fire Warning'],
    descriptions: [
      'A structure fire has been reported. Fire department is responding.',
      'Vehicle fire reported on the highway. Emergency services en route.',
      'Wildfire alert issued for the northern forest area. Monitoring in progress.',
      'Electrical fire reported at downtown building. Evacuations in progress.'
    ],
    severity: ['high', 'critical'] as ("high" | "critical")[]
  },
  {
    type: 'weather',
    titles: ['Flash Flood Warning', 'Severe Storm Alert', 'High Winds Advisory', 'Heavy Rain Expected'],
    descriptions: [
      'Flash flood warning in effect for low-lying areas. Avoid driving through flooded roads.',
      'Severe thunderstorm approaching from the west. Seek shelter immediately.',
      'High winds advisory issued for the coastal areas. Secure loose objects.',
      'Heavy rainfall expected over the next 24 hours. Be prepared for potential flooding.'
    ],
    severity: ['medium', 'high'] as ("medium" | "high")[]
  },
  {
    type: 'police',
    titles: ['Traffic Accident', 'Road Closure', 'Public Safety Alert', 'Missing Person Report'],
    descriptions: [
      'Multi-vehicle accident on Main Street. Expect delays and take alternative routes.',
      'Road closure in effect due to police activity. Detours are in place.',
      'Public safety alert issued for downtown area due to suspicious activity.',
      'Missing person reported. Check alerts app for description and information.'
    ],
    severity: ['medium', 'high'] as ("medium" | "high")[]
  },
  {
    type: 'health',
    titles: ['Medical Emergency', 'Health Advisory', 'Air Quality Alert', 'Vaccination Clinic'],
    descriptions: [
      'Medical emergency reported at the community center. Emergency services responding.',
      'Health advisory issued due to increased respiratory illness cases.',
      'Air quality alert in effect. Those with respiratory conditions should remain indoors.',
      'Vaccination clinic open today at the community center from 9am-4pm.'
    ],
    severity: ['low', 'medium'] as ("low" | "medium")[]
  }
];

// Array of update messages for simulating live updates
const updateMessages = [
  'Emergency crews are now on site.',
  'Additional resources have been deployed to the affected area.',
  'Authorities are advising residents to avoid the area.',
  'The situation is being monitored closely by emergency services.',
  'Road closures have been implemented around the affected area.',
  'Evacuation orders have been issued for nearby residents.',
  'Medical teams are on standby to provide assistance.',
  'Weather conditions are deteriorating in the affected region.',
  'Officials have scheduled a press conference to provide more details.',
  'Community shelters have been opened for displaced residents.'
];

// Function to generate a random emergency report
function generateRandomReport(): Report {
  const randomType = mockEmergencies[Math.floor(Math.random() * mockEmergencies.length)];
  const randomTitleIndex = Math.floor(Math.random() * randomType.titles.length);
  const randomSeverityIndex = Math.floor(Math.random() * randomType.severity.length);
  
  const locations = ['Downtown', 'North District', 'West Side', 'East Village', 'South Bay', 'Central Park'];
  const randomLocation = locations[Math.floor(Math.random() * locations.length)];
  
  // Create timestamp between 1 minute and 3 hours ago
  const minutesAgo = Math.floor(Math.random() * 180) + 1;
  const timestamp = new Date(Date.now() - (minutesAgo * 60 * 1000)).toISOString();
  
  // Generate random updates (0-3)
  const numUpdates = Math.floor(Math.random() * 3);
  const updates: { time: string; content: string }[] = [];
  
  for (let i = 0; i < numUpdates; i++) {
    const updateMinutesAgo = Math.floor(Math.random() * (minutesAgo - 1));
    const updateTime = new Date(Date.now() - (updateMinutesAgo * 60 * 1000));
    updates.push({
      time: updateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: updateMessages[Math.floor(Math.random() * updateMessages.length)]
    });
  }
  
  return {
    id: `report-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    user_id: 'system',
    title: randomType.titles[randomTitleIndex],
    description: randomType.descriptions[randomTitleIndex],
    category: randomType.type,
    location: randomLocation,
    created_at: timestamp,
    updated_at: timestamp,
    status: 'active',
    severity: randomType.severity[randomSeverityIndex],
    is_public: true,
    type: randomType.type,
    source: 'official',
    updates: updates
  };
}

// Initial set of mock reports
let mockReports: Report[] = [
  {
    id: '1',
    user_id: 'system',
    title: 'Flash Flood Warning',
    description: 'Flash flood warning issued for downtown area. Avoid low-lying roads.',
    category: 'weather',
    location: 'Downtown',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'active',
    severity: 'high',
    is_public: true,
    type: 'weather',
    source: 'official',
    updates: [
      { 
        time: new Date(Date.now() - 7 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        content: 'Water levels continue to rise in downtown area. Additional streets being closed.' 
      }
    ]
  },
  {
    id: '2',
    user_id: 'system',
    title: 'Road Closure',
    description: 'Main Street closed due to accident. Expect delays.',
    category: 'police',
    location: 'Main Street',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'active',
    severity: 'medium',
    is_public: true,
    type: 'police',
    source: 'official',
    updates: [
      { 
        time: new Date(Date.now() - 30 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        content: 'Emergency crews are working to clear the accident. Detours in place.' 
      },
      { 
        time: new Date(Date.now() - 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        content: 'One lane reopened. Cleanup continues.' 
      }
    ]
  },
  {
    id: '3',
    user_id: 'system',
    title: 'Power Outage',
    description: 'Power outage reported in the north sector. Crews are working to restore service.',
    category: 'other',
    location: 'North Sector',
    created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(), 
    status: 'active',
    severity: 'medium',
    is_public: true,
    type: 'other',
    source: 'official',
    updates: [
      { 
        time: new Date(Date.now() - 90 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        content: 'Utility company estimates 3-4 hours for service restoration.' 
      }
    ]
  }
];

// Function to simulate updates to existing reports
function simulateReportUpdates() {
  // Only update reports that are active and have been around for a while
  const eligibleReports = mockReports.filter(r => 
    r.status === 'active' && 
    new Date(r.updated_at).getTime() < Date.now() - 5 * 60 * 1000 // At least 5 minutes old
  );
  
  if (eligibleReports.length > 0) {
    // Pick a random report to update
    const reportIndex = Math.floor(Math.random() * eligibleReports.length);
    const reportToUpdate = eligibleReports[reportIndex];
    
    // Add a new update
    const updateMessage = updateMessages[Math.floor(Math.random() * updateMessages.length)];
    const newUpdate = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: updateMessage
    };
    
    // Update the report
    const updatedReport = {
      ...reportToUpdate,
      updates: [...(reportToUpdate.updates || []), newUpdate],
      updated_at: new Date().toISOString()
    };
    
    // Replace the report in the array
    const reportIdx = mockReports.findIndex(r => r.id === reportToUpdate.id);
    if (reportIdx !== -1) {
      mockReports[reportIdx] = updatedReport;
      
      // Dispatch custom event for report update
      if (typeof window !== 'undefined') {
        const updateEvent = new CustomEvent('report-updated', {
          detail: {
            type: 'update-report',
            report: updatedReport,
          },
        });
        window.dispatchEvent(updateEvent);
      }
    }
  }
}

// Generate a new random alert every 30-60 seconds
if (typeof window !== 'undefined') {
  const generateAndAddReport = () => {
    const newReport = generateRandomReport();
    mockReports.unshift(newReport);
    
    // Keep the list at a reasonable size
    if (mockReports.length > 30) {
      mockReports = mockReports.slice(0, 30);
    }
    
    // Dispatch custom event for real-time updates
    const reportEvent = new CustomEvent('report-created', {
      detail: {
        type: 'new-report',
        report: newReport,
      },
    });
    window.dispatchEvent(reportEvent);
    
    // Schedule next alert
    const nextDelay = Math.floor(Math.random() * 30000) + 30000; // Between 30s and 60s
    setTimeout(generateAndAddReport, nextDelay);
  };
  
  // Schedule updates to existing reports every 15-45 seconds
  const scheduleReportUpdates = () => {
    simulateReportUpdates();
    
    const nextUpdateDelay = Math.floor(Math.random() * 30000) + 15000; // Between 15s and 45s
    setTimeout(scheduleReportUpdates, nextUpdateDelay);
  };
  
  // Initial delay before starting simulation
  setTimeout(() => {
    generateAndAddReport();
    scheduleReportUpdates();
  }, 3000);
}

// Mock functions to handle reports
export const getReports = async () => {
  try {
    return { data: mockReports, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getPublicReports = async () => {
  const { data, error } = await getReports();
  if (data) {
    const publicReports = data.filter(report => report.is_public);
    return { data: publicReports, error: null };
  }
  return { data, error };
};

export const createReport = async (report: Omit<Report, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    // In a real implementation, this would insert into the actual reports table
    const timestamp = new Date().toISOString();
    const newReport: Report = {
      ...report,
      id: `report-${Date.now()}`,
      created_at: timestamp,
      updated_at: timestamp,
      status: 'active',
      updates: []
    };
    
    // Add to our mock reports
    mockReports.unshift(newReport);
    
    // Dispatch custom event for real-time updates
    if (typeof window !== 'undefined') {
      const reportEvent = new CustomEvent('report-created', {
        detail: {
          type: 'new-report',
          report: newReport,
        },
      });
      window.dispatchEvent(reportEvent);
    }
    
    return { data: newReport, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getReportById = async (id: string) => {
  try {
    const { data, error } = await getReports();
    if (error) throw error;
    
    const report = data?.find(r => r.id === id) || null;
    return { data: report, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
