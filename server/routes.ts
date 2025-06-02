import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Serve sample CSV file for testing URL parameter functionality
  app.get('/api/sample-events.csv', (req, res) => {
    const csvContent = `Seconds to Event,Title,Description,Category
-300,Pre-event Setup,Setting up equipment and final preparations,Setup
-180,Team Briefing,Final team briefing and role assignments,Meeting
-120,Sound Check,Testing all audio equipment and microphones,Technical
-60,Guest Arrival,VIP guests and speakers arrive,Logistics
-30,Final Preparations,Last minute checks and preparations,Setup
0,Main Event Start,The main presentation begins,23:30:00
30,Q&A Session,Interactive question and answer period,Interactive
90,Networking Break,Coffee break and networking opportunity,Social
120,Closing Remarks,Final thoughts and thank you messages,Presentation
180,Event Wrap-up,Clean up and equipment breakdown,Logistics`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.send(csvContent);
  });

  const httpServer = createServer(app);

  return httpServer;
}
