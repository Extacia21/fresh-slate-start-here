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
    source: 'official'
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
    source: 'official'
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
    source: 'official'
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
    source: 'official'
  }
];

// Generate a new random alert every 30-90 seconds
if (typeof window !== 'undefined') {
  const generateAndAddReport = () => {
    const newReport = generateRandomReport();
    mockReports.unshift(newReport);
    
    // Keep the list at a reasonable size
    if (mockReports.length > 20) {
      mockReports.pop();
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
    const nextDelay = Math.floor(Math.random() * 60000) + 30000; // Between 30s and 90s
    setTimeout(generateAndAddReport, nextDelay);
  };
  
  // Initial delay before starting simulation
  setTimeout(generateAndAddReport, 5000);
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
      updated_at: timestamp
    };
    
    // Add to our mock reports
    mockReports.unshift(newReport);
    
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
