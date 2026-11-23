# VaxConnect 💉

### AI-Powered Vaccination Planning, Travel Guidance & Clinic Outreach

VaxConnect is an AI-powered healthcare booking prototype designed to simplify vaccination planning and vaccine availability checks. It combines conversational AI with voice-agent technology to help users explore vaccination requirements, locate vaccination centres and initiate clinic outreach.

The application uses **Google Gemini** for conversational vaccine-related assistance and **CALL-E with Model Context Protocol (MCP)** to connect AI agents with external services.

---

## 🌟 Key Features

### 1. Child Vaccination Check
- Enter a child's date of birth to explore age-based vaccination requirements.
- Helps users understand relevant vaccines based on the child's age.
- Provides an accessible interface for vaccination planning.

### 2. Travel Vaccination Check
- Select a destination country to explore relevant travel vaccination information.
- Uses AI-powered assistance to help users understand vaccination considerations before travelling.
- Designed to simplify access to travel-related vaccine information.

### 3. Vaccine Hub
- Centralised section for exploring vaccine-related information.
- Provides users with a convenient starting point for vaccination planning.

### 4. AI Vaccine Assistant
- Powered by the Google Gemini API.
- Answers natural-language questions about vaccines and vaccination planning.
- Provides conversational assistance through an AI-powered interface.

### 5. Pincode-Based Vaccine Availability
- Allows users to enter a pincode to check vaccination-centre availability.
- Connects the availability workflow with the application's external-service integration.

### 6. AI Voice-Agent Integration
- Integrates CALL-E to support AI-powered clinic outreach.
- Uses Model Context Protocol (MCP) to connect the AI application with external tools and services.
- Designed to make clinic communication more accessible through a voice-agent workflow.

### 7. Appointment Booking Workflow
- Provides an appointment booking interface.
- Supports the application's end-to-end vaccination planning experience.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Frontend framework and application routing |
| React | Component-based user interface |
| TypeScript | Type-safe application development |
| Google Gemini API | Conversational AI and vaccine-related assistance |
| CALL-E | AI voice-agent integration |
| Model Context Protocol (MCP) | Connecting AI applications with external tools and services |
| Node.js | JavaScript runtime for the application |

---

## 🏗️ System Architecture

VaxConnect combines a web application, conversational AI and external-service integrations.

**High-level workflow:**

1. The user interacts with the Next.js frontend.
2. The application collects relevant information, such as vaccination requirements, destination country or pincode.
3. Gemini processes conversational questions and generates informational responses.
4. The application's backend API routes manage application workflows and integrations.
5. The MCP client connects with the CALL-E MCP integration to expose external capabilities to the AI workflow.
6. CALL-E supports the voice-agent and clinic-outreach functionality.
7. The application presents relevant information and booking workflow results to the user.

### Architecture Overview

```text
                  USER
                    |
                    v
           NEXT.JS FRONTEND
                    |
          +---------+---------+
          |                   |
          v                   v
    GEMINI API
