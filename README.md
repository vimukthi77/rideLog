# Lakdhanavi Vehicle Ride Recording System

Full-stack enterprise web application built for **Lakdhanavi Limited - Sahasdhanavi 350 MW LNG Combined Cycle Power Plant (CCPP) EPC Project, Kerawalapitiya**.

This application digitizes the paper-based vehicle ride recording logbook used by the transport department, featuring mobile-first native app design for passengers and drivers, a comprehensive desktop operations dashboard for fleet administrators, real-time odometer sync, and official PDF generation replicating the paper logbook.

---

## 🎨 Brand Design System & Palette

- **Primary Dark**: `#1B262C` (Navigation bars, headers, footers)
- **Primary Medium**: `#0F4C75` (Buttons, active states, card headers)
- **Primary Blue**: `#3282B8` (Links, hover states, accent elements, charts)
- **Primary Light**: `#BBE1FA` (Highlights, section backgrounds, badges)
- **White**: `#FFFFFF` (Main backgrounds, cards)
- **Status Green**: `#27AE60` (Completed rides, available vehicles)
- **Warning Orange**: `#F39C12` (Ongoing trips, active alerts)
- **Danger Red**: `#E74C3C` (Errors, deactivations)

Official logo file placed at `/public/logo.png`.

---

## 🚀 Key Features

### 1. Animated Preloader
- Animated vehicle driving across the road with road markings
- Loading progress bar with project metadata
- Gradient backdrop from `#1B262C` to `#0F4C75`

### 2. Mobile-First App UI (Passengers & Drivers)
- Bottom navigation bar with floating action button (FAB) for "+ New Ride"
- Welcome screen with active trip notifications & monthly statistics
- Quick ride recording form:
  - Auto-generated current date
  - Vehicle dropdown showing odometer readings & availability status
  - Driver selection & authorizing officer initials
  - Auto-populated start mileage from vehicle's last reading
  - Route / places visited and trip purpose
- Live trip completion:
  - End mileage entry with validation (`end >= start`)
  - Auto-calculated distance traveled highlighted in prominent display
  - Overtime (OT) hours logging
  - Digital signatures for driver & passenger handover
  - Automatic update of vehicle current meter reading

### 3. Desktop Admin Operations Dashboard
- Sidebar navigation with collapsible drawer
- 4 Top Metric Cards (Total Vehicles, Active Drivers, Total KM This Month, Rides This Month) with `#BBE1FA` accents
- **Monthly Reset Logic**: KPIs and charts dynamically compute for the current calendar month while all historical records remain permanently stored
- 4 Interactive Recharts visualizations:
  1. **Vehicle KM Usage** (Bar chart)
  2. **Driver KM Usage** (Bar chart)
  3. **Daily Rides Trend** (Area/Line chart)
  4. **Vehicle Usage Distribution** (Donut chart)
- Vehicle Fleet Management with status indicators (`Available` vs `In Use`) and progress bars
- Driver Roster with license details and monthly trip count

### 4. Audit-Ready Logbook Reports & PDF Generation
- Exact replica of the paper logbook table format:
  `Date | Initials of Officer Authorizing | Start Time | End Time | Start Mileage KM | End Mileage KM | No of KM Done | Driver Name | Name of Person Traveling (Responsible) | Places Visited | OT Hours`
- Summary section: Total KM Done, Total Trips, Last Meter Reading
- Professional **A4 Landscape PDF** with Lakdhanavi Limited header, project title, official table styling, checked-by signatures, and metadata
- Direct **CSV / Excel** export button

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@lakdhanavi.com` | `admin123` |
| **Driver** | `lakshan@lakdhanavi.com` | `driver123` |
| **Passenger** | `gaveen@lakdhanavi.com` | `pass123` |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT & `jose` with secure HTTP-only cookies
- **Styling**: Tailwind CSS & Vanilla CSS design system
- **Charts**: Recharts
- **PDF Generation**: `jspdf` & `jspdf-autotable`
- **Animations**: Framer Motion
- **Icons**: `react-icons`

---

## 📦 Setup & Scripts

```bash
# Install dependencies
npm install

# Seed sample data (Admin, Drivers, Vehicles, Logbook Records)
npm run seed

# Run development server
npm run dev

# Build production bundle
npm run build
```
